import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NOTIFICATION_URL } from '../constants/urls';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);

  sendOTP(phoneNumber: string): Observable<any> {
    return this.http.post<any>(`${NOTIFICATION_URL}/send-otp`, { phoneNumber });
  }

  verifyOTP(phoneNumber: string, otp: string): Observable<AuthResponse> {
    const params = { phoneNumber, otp };
    return this.http.get<AuthResponse>(`${NOTIFICATION_URL}/verify-otp`, { params });
  }
}
