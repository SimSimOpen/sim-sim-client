import { Component, inject } from '@angular/core';
import { BaseModalComponent } from '../modal/baseModal';
import { ModalComponent } from '../modal/modal.component';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../../account/auth.service';
import { Common } from '../../shared/common';

@Component({
  selector: 'app-header',
  imports: [ModalComponent, LoginComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header extends BaseModalComponent {
  isOpenSignIn: boolean = false;
  isOpenHamburderMenu: boolean = false;

  public authService = inject(AuthService);
  public common = inject(Common);

  override closeModal(): void {
    this.isOpenSignIn = false;
    super.closeModal();
  }
}
