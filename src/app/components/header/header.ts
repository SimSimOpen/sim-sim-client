import { Component, computed, inject } from '@angular/core';
import { BaseModalComponent } from '../modal/baseModal';
import { ModalComponent } from '../modal/modal.component';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../../account/auth.service';
import { Common } from '../../shared/common';
import { CategoryService } from '../../shared/services/category.service';
import { CategoryIcon } from '../category-icon/category-icon';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { LanguageSwitcher } from '../../shared/i18n/language-switcher';

@Component({
  selector: 'app-header',
  imports: [ModalComponent, LoginComponent, CategoryIcon, TranslatePipe, LanguageSwitcher],
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
    { label: 'nav.allCategories', path: '/' },
    { label: 'nav.about', path: '/about' },
    { label: 'nav.contact', path: '/contact' },
  ]);

  readonly ctaLabel = computed(() => this.categoryService.current()?.ctaLabel ?? 'nav.postAd');

  override closeModal(): void {
    this.isOpenSignIn = false;
    super.closeModal();
  }
}
