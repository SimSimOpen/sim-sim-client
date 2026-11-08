import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { AuthService } from './auth.service';

const EXCLUDED_URLS = ['/api/auth/v1/authenticate', '/api/auth/v1/register/agent', '/api/auth/v1/refresh'];

/** Adds the access token, refreshing it first when it is about to expire. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (EXCLUDED_URLS.some((url) => req.url.includes(url))) {
    return next(req);
  }
  return inject(AuthService)
    .validToken()
    .pipe(
      switchMap((token) =>
        next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req),
      ),
    );
};
