import { Component, inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from '../../shared/services/global.service';
import { AuthService } from '../../account/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  isPhoneNumberSet: boolean = false;
  private authService = inject(AuthService);
  private common = inject(GlobalService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.buildLoginForm();

  ngOnInit() {}

  sendCodeAndLogin() {
    if (!this.isPhoneNumberSet) {
      const phoneNumber = this.loginForm.get('phoneNumber')?.value;
      this.isPhoneNumberSet = true;
    }
  }

  buildLoginForm() {
    return this.fb.group({
      phoneNumber: [''],
      otpCode: [''],
    });
  }
}
