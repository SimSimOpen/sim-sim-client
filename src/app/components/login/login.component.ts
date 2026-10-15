import { Component, DestroyRef, ElementRef, EventEmitter, inject, Output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../account/auth.service';
import { NotificationService } from '../../shared/services/notification.service';
import { PhoneAuthService, phoneAuthErrorMessage } from '../../shared/services/phone-auth.service';
import { PHONE_PATTERN, PhoneMask, toE164 } from '../../shared/utils/phone-mask.directive';

/** Seconds before "Resend code" unlocks. */
const RESEND_COOLDOWN = 60;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, PhoneMask],
})
export class LoginComponent {
  @Output() closeModal = new EventEmitter<void>();

  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);
  private phoneAuth = inject(PhoneAuthService);
  private notificationService = inject(NotificationService);
  private recaptcha = viewChild.required<ElementRef<HTMLElement>>('recaptcha');

  step = signal<'phone' | 'code'>('phone');
  /** How the current code was delivered: SMS through Firebase, or our own Telegram bot. */
  channel = signal<'sms' | 'telegram'>('sms');
  /** Set while a Telegram number still has to be linked by opening the bot. */
  telegramBotUrl = signal<string | null>(null);
  isSending = signal(false);
  isVerifying = signal(false);
  resendIn = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  phoneForm = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
  });

  codeForm = this.fb.nonNullable.group({
    otpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.stopTimer();
      this.phoneAuth.reset();
    });
  }

  get phoneNumber(): string {
    return this.phoneForm.controls.phoneNumber.value;
  }

  isInvalid(control: 'phoneNumber' | 'otpCode'): boolean {
    const c = control === 'phoneNumber' ? this.phoneForm.controls.phoneNumber : this.codeForm.controls.otpCode;
    return c.invalid && (c.touched || c.dirty);
  }

  async sendOTP(channel: 'sms' | 'telegram' = this.channel()) {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      return;
    }
    if (this.isSending() || this.resendIn() > 0) {
      return;
    }
    this.isSending.set(true);
    this.channel.set(channel);
    try {
      if (channel === 'telegram') {
        const result = await firstValueFrom(this.notificationService.sendOTPTelegram(toE164(this.phoneNumber)));
        this.telegramBotUrl.set(result.status === 'LINK_REQUIRED' ? result.botUrl : null);
        if (result.status === 'SENT') {
          this.toastr.success('Code sent to your Telegram');
        }
      } else {
        await this.phoneAuth.sendCode(toE164(this.phoneNumber), this.recaptcha().nativeElement);
        this.telegramBotUrl.set(null);
        this.toastr.success(`Code sent to ${this.phoneNumber}`);
      }
      this.codeForm.reset();
      this.step.set('code');
      this.startTimer();
    } catch (err) {
      this.toastr.error(phoneAuthErrorMessage(err));
    } finally {
      this.isSending.set(false);
    }
  }

  async verifyOTP() {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    if (this.isVerifying()) {
      return;
    }
    this.isVerifying.set(true);
    try {
      const code = this.codeForm.controls.otpCode.value;
      const resp =
        this.channel() === 'telegram'
          ? await firstValueFrom(this.notificationService.verifyOTP(toE164(this.phoneNumber), code))
          : await this.phoneAuth.verifyCode(code);
      this.authService.storeToken(resp.token);
      this.authService.setUsername(resp.username);
      this.toastr.success('You are signed in');
      this.resetFlow();
      this.closeModal.emit();
    } catch (err: any) {
      if (err?.code === 'auth/code-expired') {
        // Unlock "Resend code" straight away instead of making them wait out the timer
        this.stopTimer();
        this.resendIn.set(0);
      }
      this.codeForm.controls.otpCode.reset();
      this.toastr.error(phoneAuthErrorMessage(err));
    } finally {
      this.isVerifying.set(false);
    }
  }

  changeNumber() {
    this.phoneAuth.reset();
    this.telegramBotUrl.set(null);
    this.stopTimer();
    this.resendIn.set(0);
    this.codeForm.reset();
    this.step.set('phone');
  }

  private resetFlow() {
    this.telegramBotUrl.set(null);
    this.stopTimer();
    this.resendIn.set(0);
    this.phoneForm.reset();
    this.codeForm.reset();
    this.step.set('phone');
  }

  private startTimer() {
    this.stopTimer();
    this.resendIn.set(RESEND_COOLDOWN);
    this.timer = setInterval(() => {
      const next = this.resendIn() - 1;
      this.resendIn.set(Math.max(next, 0));
      if (next <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
