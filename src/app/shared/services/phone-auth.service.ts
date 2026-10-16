import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
// Type-only imports: the SDK itself is loaded on first use so it stays out of the initial bundle
import type { Auth, ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { EnvironmentTs } from '../../environments/environment';
import { AUTH_URL } from '../constants/urls';
import { AuthResponse } from '../models/auth';
import { I18nService } from '../i18n/i18n.service';

/**
 * Phone sign-in: Firebase sends and checks the SMS code, then the backend exchanges Firebase's ID
 * token for our own JWT (creating the account the first time a number signs in).
 */
@Injectable({ providedIn: 'root' })
export class PhoneAuthService {
  private http = inject(HttpClient);

  private auth: Auth | null = null;
  private verifier: RecaptchaVerifier | null = null;
  private confirmation: ConfirmationResult | null = null;

  get isConfigured(): boolean {
    const c = EnvironmentTs.FIREBASE;
    return !!(c.apiKey && c.authDomain && c.projectId && c.appId);
  }

  /** Sends the SMS. `recaptchaContainer` is an element the invisible reCAPTCHA can attach to. */
  async sendCode(phoneE164: string, recaptchaContainer: HTMLElement): Promise<void> {
    const auth = await this.getFirebaseAuth();
    const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth');
    // A verifier can only be used for one request, so build a fresh one for every send/resend
    this.clearVerifier();
    this.verifier = new RecaptchaVerifier(auth, recaptchaContainer, { size: 'invisible' });
    try {
      this.confirmation = await signInWithPhoneNumber(auth, phoneE164, this.verifier);
    } catch (e) {
      this.clearVerifier();
      throw e;
    }
  }

  /** Checks the code with Firebase, then signs in to our backend. */
  async verifyCode(code: string): Promise<AuthResponse> {
    if (!this.confirmation) {
      throw { code: 'app/no-pending-code' };
    }
    const credential = await this.confirmation.confirm(code);
    const idToken = await credential.user.getIdToken();
    const resp = await firstValueFrom(
      this.http.post<AuthResponse>(`${AUTH_URL}/v1/firebase-login`, { idToken }),
    );
    // Our JWT is the session from here on; the Firebase session is not needed any more
    this.confirmation = null;
    this.clearVerifier();
    const { signOut } = await import('firebase/auth');
    await signOut(await this.getFirebaseAuth()).catch(() => undefined);
    return resp;
  }

  reset() {
    this.confirmation = null;
    this.clearVerifier();
  }

  private clearVerifier() {
    this.verifier?.clear();
    this.verifier = null;
  }

  private async getFirebaseAuth(): Promise<Auth> {
    if (!this.isConfigured) {
      throw { code: 'app/not-configured' };
    }
    if (!this.auth) {
      const [{ getApps, initializeApp }, { getAuth }] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
      ]);
      const app = getApps()[0] ?? initializeApp(EnvironmentTs.FIREBASE);
      this.auth = getAuth(app);
      this.auth.useDeviceLanguage();
    }
    return this.auth;
  }
}

/** Turns Firebase / HTTP errors into something a user can act on. */
export function phoneAuthErrorMessage(err: any, i18n: I18nService): string {
  switch (err?.code) {
    case 'auth/invalid-phone-number':
      return i18n.t('auth.err.invalidPhone');
    case 'auth/too-many-requests':
      return i18n.t('auth.err.tooMany');
    case 'auth/invalid-verification-code':
      return i18n.t('auth.err.badCode');
    case 'auth/code-expired':
      return i18n.t('auth.err.expired');
    case 'auth/quota-exceeded':
      return i18n.t('auth.err.quota');
    case 'auth/captcha-check-failed':
    case 'auth/missing-app-credential':
    case 'auth/invalid-app-credential':
      return i18n.t('auth.err.captcha');
    case 'auth/network-request-failed':
      return i18n.t('auth.err.network');
    case 'app/not-configured':
      return i18n.t('auth.err.notConfigured');
    case 'app/no-pending-code':
      return i18n.t('auth.err.noPending');
  }
  // HttpErrorResponse from our backend
  const body = err?.error;
  if (typeof body === 'string' && body) {
    return body.replace(/^Error /, '');
  }
  return body?.message ?? i18n.t('common.genericError');
}
