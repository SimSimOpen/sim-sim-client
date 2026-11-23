import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PRODUCT_URL } from '../constants/urls';
import { ListingKind } from './engagement.service';

export type ReportReason = 'FAKE' | 'SCAM' | 'WRONG_INFO' | 'UNAVAILABLE' | 'INAPPROPRIATE' | 'OTHER';

export const REPORT_REASONS: ReportReason[] = [
  'FAKE',
  'SCAM',
  'WRONG_INFO',
  'UNAVAILABLE',
  'INAPPROPRIATE',
  'OTHER',
];

/** Longest text the backend accepts in a complaint's details. */
export const REPORT_DETAILS_MAX = 1000;

/** A signed-in visitor's complaint about a listing; the SimSim admins review it. */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  report(kind: ListingKind, listingId: number, reason: ReportReason, details: string): Observable<unknown> {
    return this.http.post(`${PRODUCT_URL}/v1/reports`, {
      kind,
      listingId,
      reason,
      details: details.trim() || null,
    });
  }
}
