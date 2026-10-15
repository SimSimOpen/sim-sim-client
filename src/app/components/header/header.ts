import { Component, computed, inject } from '@angular/core';
import { BaseModalComponent } from '../modal/baseModal';
import { ModalComponent } from '../modal/modal.component';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../../account/auth.service';
import { Common } from '../../shared/common';
import { CategoryService } from '../../shared/services/category.service';
import { CategoryIcon } from '../category-icon/category-icon';

@Component({
  selector: 'app-header',
  imports: [ModalComponent, LoginComponent, CategoryIcon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header extends BaseModalComponent {
  isOpenSignIn: boolean = false;
  isOpenHamburderMenu: boolean = false;

  public authService = inject(AuthService);
  public common = inject(Common);
  public categoryService = inject(CategoryService);

  /** Section links of the active category first, then the site-wide links. */
  readonly navLinks = computed(() => [
    ...(this.categoryService.current()?.nav ?? []),
    { label: 'All Categories', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ]);

  readonly ctaLabel = computed(() => this.categoryService.current()?.ctaLabel ?? 'Post an Ad');

  override closeModal(): void {
    this.isOpenSignIn = false;
    super.closeModal();
  }
}
