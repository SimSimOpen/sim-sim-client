import { ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from '../../shared/services/global.service';
import { AuthService } from '../../account/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  isPhoneNumberSet: boolean = false;

  private authService = inject(AuthService);
  private common = inject(GlobalService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  loginForm: FormGroup = this.buildLoginForm();

  ngOnInit() {}

  sendCodeAndLogin() {
    if (!this.isPhoneNumberSet && this.loginForm.get('otpCode')?.value === '') {
      this.sendOTP();
    } else if (this.isPhoneNumberSet) {
      this.verifyOTP();
    }
  }
  sendOTP() {
    const phoneNumber = this.loginForm.get('phoneNumber')?.value;
    this.notificationService.sendOTP(phoneNumber).subscribe({
      next: () => {
        this.toastr.success('OTP sent successfully');
        this.isPhoneNumberSet = true;
        this.cdr.detectChanges(); // Trigger change detection to update the view
      },
      error: (err) => {
        this.toastr.error('Failed to send OTP');
        this.isPhoneNumberSet = false;
        this.cdr.detectChanges(); // Trigger change detection to update the view
      },
    });
  }

  verifyOTP() {
    const phoneNumber = this.loginForm.get('phoneNumber')?.value;
    const otpCode = this.loginForm.get('otpCode')?.value;
    this.notificationService.verifyOTP(phoneNumber, otpCode).subscribe({
      next: () => {
        this.toastr.success('Login successful');
        this.isPhoneNumberSet = false;
        this.loginForm.reset();
        this.closeModal.emit(); // Close the modal after successful login
      },
      error: (err) => {
        this.toastr.error('Invalid OTP');
      },
    });
  }

  buildLoginForm() {
    return this.fb.group({
      phoneNumber: [''],
      otpCode: [''],
    });
  }
}
