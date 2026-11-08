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
import { EngagementService } from '../../shared/services/engagement.service';

@Component({
  selector: 'app-header',
  imports: [ModalComponent, LoginComponent, CategoryIcon, TranslatePipe, LanguageSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header extends BaseModalComponent {
  isOpenHamburderMenu: boolean = false;

  public authService = inject(AuthService);
  public common = inject(Common);
  public categoryService = inject(CategoryService);
  private toastr = inject(ToastrService);
  private i18n = inject(I18nService);
  private engagement = inject(EngagementService);

  /** How many listings this browser has favorited; the favorites link only shows when there are some. */
  readonly favoritesCount = computed(() => this.engagement.saved().length);

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
      this.authService.signInOpen.set(true);
      return;
    }
    if (!this.authService.canPostAds()) {
      this.toastr.info(this.i18n.t('nav.postAdAgentsOnly'));
      return;
    }
    // The token travels in the fragment: it is never sent to a server or written to access logs,
    // and the admin app strips it from the address bar as soon as it is stored.
    window.open(`${EnvironmentTs.ADMIN_URL}/#sso=${encodeURIComponent(token)}`, '_blank');
  }

  /** The JWT is stateless, so signing out only means forgetting the stored session. */
  logout() {
    this.authService.clearStorage();
    this.isOpenHamburderMenu = false;
    this.toastr.success(this.i18n.t('header.loggedOut'));
  }

  override closeModal(): void {
    this.authService.signInOpen.set(false);
    super.closeModal();
  }
}
