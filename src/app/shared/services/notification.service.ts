import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NOTIFICATION_URL } from '../constants/urls';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/auth';

export interface TelegramOtpResult {
  status: 'SENT' | 'LINK_REQUIRED';
  botUrl: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);

  sendOTP(phoneNumber: string): Observable<any> {
    return this.http.post<any>(`${NOTIFICATION_URL}/send-otp`, { phoneNumber });
  }

  /** SENT: the code is in the user's Telegram. LINK_REQUIRED: they must open `botUrl` and share their number first. */
  sendOTPTelegram(phoneNumber: string): Observable<TelegramOtpResult> {
    return this.http.post<TelegramOtpResult>(`${NOTIFICATION_URL}/send-otp-telegram`, { phoneNumber });
  }

  verifyOTP(phoneNumber: string, otp: string): Observable<AuthResponse> {
    const params = { phoneNumber, otp };
    return this.http.get<AuthResponse>(`${NOTIFICATION_URL}/verify-otp`, { params });
  }
}
