import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { AuthResponse } from '../shared/models/auth';
import { catchError, finalize, map, Observable, of, shareReplay } from 'rxjs';
import { AUTH_URL } from '../shared/constants/urls';

const KEYS = ['authToken', 'refreshToken', 'username', 'authorities'] as const;
/**
 * Refresh this long before the access token expires, which also absorbs clock skew; capped at a
 * quarter of the token's lifetime so a short-lived token is not refreshed the moment it arrives.
 */
const REFRESH_MARGIN_MS = 5 * 60_000;

/**
 * Sessions used to live in sessionStorage and died with the tab; they now live in localStorage so a
 * signed-in user stays signed in across tabs and restarts. Moves an old session over once.
 */
function migrateSession() {
  if (localStorage.getItem('authToken') || !sessionStorage.getItem('authToken')) return;
  for (const key of KEYS) {
    const value = sessionStorage.getItem(key);
    if (value !== null) localStorage.setItem(key, value);
    sessionStorage.removeItem(key);
  }
}

/** When to refresh a JWT, in ms since the epoch, or null when its expiry cannot be read. */
function refreshAt(token: string): number | null {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp, iat } = JSON.parse(atob(part));
    if (typeof exp !== 'number') return null;
    const lifetime = typeof iat === 'number' ? (exp - iat) * 1000 : Infinity;
    return exp * 1000 - Math.min(REFRESH_MARGIN_MS, lifetime / 4);
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const exp = JSON.parse(atob(part)).exp;
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  /** Bypasses the interceptors, which themselves wait on a refresh. */
  private rawHttp = new HttpClient(inject(HttpBackend));

  /** The stored token as a signal, so chat connects on sign-in and disconnects on sign-out. */
  readonly token = signal<string | null>((migrateSession(), localStorage.getItem('authToken')));
  /** The header's sign-in dialog; anything that needs an account (like chat) can open it. */
  readonly signInOpen = signal(false);

  private refreshing?: Observable<string | null>;
  private refreshTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Refresh ahead of expiry so the token stays valid even while nothing is being requested
    // (the chat stream reconnects with whatever token is current).
    effect(() => {
      const token = this.token();
      clearTimeout(this.refreshTimer);
      const at = token ? refreshAt(token) : null;
      if (at === null) return;
      const delay = Math.max(at - Date.now(), 0);
      // setTimeout overflows past ~24.8 days; the interceptor covers anything left after that.
      this.refreshTimer = setTimeout(() => this.refresh().subscribe(), Math.min(delay, 2 ** 31 - 1));
    });
    // A laptop waking up: timers were paused, so check right away.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.validToken().subscribe();
    });
    // Another tab signed in, out, or refreshed (which rotates the shared refresh token).
    window.addEventListener('storage', (event) => {
      if (event.key === 'authToken' || event.key === null) {
        this.token.set(localStorage.getItem('authToken'));
      }
    });
  }

  /**
   * The token to send with a request: the stored one, or a freshly refreshed one when it is about to
   * expire. Null when signed out.
   */
  validToken(): Observable<string | null> {
    const token = this.token();
    if (!token) return of(null);
    const at = refreshAt(token);
    if (at === null || at > Date.now()) return of(token);
    return this.refresh();
  }

  /** Swaps the refresh token for a new pair; concurrent callers share one request. */
  refresh(): Observable<string | null> {
    if (this.refreshing) return this.refreshing;
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      // A session from before refresh tokens: usable until it expires, then signed out.
      const token = this.token();
      if (token && isExpired(token)) this.clearStorage();
      return of(this.token());
    }
    this.refreshing = this.rawHttp
      .post<AuthResponse>(`${AUTH_URL}/v1/refresh`, { refreshToken })
      .pipe(
        map((resp) => {
          this.storeToken(resp.token, resp.refreshToken);
          return resp.token as string | null;
        }),
        catchError((err: HttpErrorResponse) => {
          const latest = localStorage.getItem('refreshToken');
          if (latest && latest !== refreshToken) {
            // Another tab refreshed first and rotated the token; adopt its session.
            this.token.set(localStorage.getItem('authToken'));
          } else if (err.status >= 400 && err.status < 500) {
            // Refresh token expired or revoked: the user has to sign in again.
            this.clearStorage();
          }
          // Otherwise (offline, server down) keep the session and try again later.
          return of(this.token());
        }),
        finalize(() => (this.refreshing = undefined)),
        shareReplay(1),
      );
    return this.refreshing;
  }

  authenticate(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_URL}/v1/authenticate`, {
      username,
      password,
    });
  }
  registerAgent(username: string, email: string, password: string): Observable<void> {
    return this.http.post<void>(`${AUTH_URL}/v1/register/agent`, {
      username,
      email,
      password,
    });
  }

  checkTokenValidity(): Observable<boolean> {
    return this.http.get<boolean>(`${AUTH_URL}/access/validate-token`);
  }

  getUserData(): Observable<any> {
    return this.http.get<any>(`${AUTH_URL}/check-token`);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  isAdmin(): Observable<boolean> {
    return this.http.get<boolean>(`${AUTH_URL}/access/is-admin`);
  }

  storeToken(token: string, refreshToken?: string | null) {
    localStorage.setItem('authToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    else localStorage.removeItem('refreshToken');
    this.token.set(token);
  }

  getToken() {
    return this.token();
  }

  setUsername(username: string) {
    localStorage.setItem('username', username);
  }

  getUsername() {
    return localStorage.getItem('username');
  }

  /**
   * Roles of the signed-in account, stored next to the token because they decide what the header's
   * "Post ad" button does: agents are handed over to the admin panel, everybody else is told no.
   */
  setAuthorities(authorities: string[]) {
    localStorage.setItem('authorities', JSON.stringify(authorities ?? []));
  }

  getAuthorities(): string[] {
    const raw = localStorage.getItem('authorities');
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  hasAnyAuthority(roles: string[]): boolean {
    const owned = this.getAuthorities();
    return roles.some((role) => owned.includes(role));
  }

  /** Only these roles own listings to manage, matching the admin panel's own menu rules. */
  canPostAds(): boolean {
    return this.hasAnyAuthority(['AGENT', 'ADMIN', 'MANAGER']);
  }

  clearStorage() {
    for (const key of KEYS) localStorage.removeItem(key);
    this.token.set(null);
  }
}
