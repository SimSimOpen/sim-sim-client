import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AuthResponse } from '../shared/models/auth';
import { Observable } from 'rxjs';
import { AUTH_URL } from '../shared/constants/urls';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  /** The stored token as a signal, so chat connects on sign-in and disconnects on sign-out. */
  readonly token = signal<string | null>(sessionStorage.getItem('authToken'));
  /** The header's sign-in dialog; anything that needs an account (like chat) can open it. */
  readonly signInOpen = signal(false);

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

  storeToken(token: string) {
    sessionStorage.setItem('authToken', token);
    this.token.set(token);
  }

  getToken() {
    return this.token();
  }

  setUsername(username: string) {
    sessionStorage.setItem('username', username);
  }

  getUsername() {
    return sessionStorage.getItem('username');
  }

  /**
   * Roles of the signed-in account, stored next to the token because they decide what the header's
   * "Post ad" button does: agents are handed over to the admin panel, everybody else is told no.
   */
  setAuthorities(authorities: string[]) {
    sessionStorage.setItem('authorities', JSON.stringify(authorities ?? []));
  }

  getAuthorities(): string[] {
    const raw = sessionStorage.getItem('authorities');
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
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('authorities');
    this.token.set(null);
  }
}
