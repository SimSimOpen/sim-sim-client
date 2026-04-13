import { Component, inject } from '@angular/core';
import { BaseModalComponent } from '../modal/baseModal';
import { ModalComponent } from '../modal/modal.component';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../../account/auth.service';

@Component({
  selector: 'app-header',
  imports: [ModalComponent, LoginComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header extends BaseModalComponent {
  isOpenSignIn: boolean = false;

  public authService = inject(AuthService);

  override closeModal(): void {
    this.isOpenSignIn = false;
    super.closeModal();
  }
}
