import { Component } from '@angular/core';
import { BaseModalComponent } from '../modal/baseModal';
import { ModalComponent } from '../modal/modal.component';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-header',
  imports: [ModalComponent, LoginComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header extends BaseModalComponent {
  isOpenSignIn: boolean = true;

  override closeModal(): void {
    this.isOpenSignIn = false;
    super.closeModal();
  }
}
