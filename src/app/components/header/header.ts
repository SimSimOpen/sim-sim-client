import { Component, computed, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BaseModalComponent } from '../modal/baseModal';
import { ModalComponent } from '../modal/modal.component';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../../account/auth.service';
import { Common } from '../../shared/common';
import { CategoryService } from '../../shared/services/category.service';
import { CategoryIcon } from '../category-icon/category-icon';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { LanguageSwitcher } from '../../shared/i18n/language-switcher';
import { I18nService } from '../../shared/i18n/i18n.service';
import { EnvironmentTs } from '../../environments/environment';

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
  private toastr = inject(ToastrService);
  private i18n = inject(I18nService);

  /** Section links of the active category first, then the site-wide links. */
  readonly navLinks = computed(() => [
    ...(this.categoryService.current()?.nav ?? []),
    { label: 'nav.allCategories', path: '/' },
    { label: 'nav.about', path: '/about' },
    { label: 'nav.contact', path: '/contact' },
  ]);

  readonly ctaLabel = computed(() => this.categoryService.current()?.ctaLabel ?? 'nav.postAd');

  /**
   * Publishing happens in the admin panel, so an agent who taps this button is handed over to it
   * with their token and lands on the dashboard with the Add Product picker already open. Anyone
   * without listings to manage gets the sign-in dialog or an explanation instead.
   */
  postAd() {
    const token = this.authService.getToken();
    if (!token) {
      this.isOpenSignIn = true;
      return;
    }
    if (!this.authService.canPostAds()) {
      this.toastr.info(this.i18n.t('nav.postAdAgentsOnly'));
      return;
    }
    // The token travels in the fragment: it is never sent to a server or written to access logs,
    // and the admin app strips it from the address bar as soon as it is stored.
    window.location.href = `${EnvironmentTs.ADMIN_URL}/#sso=${encodeURIComponent(token)}`;
  }

  override closeModal(): void {
    this.isOpenSignIn = false;
    super.closeModal();
  }
}
