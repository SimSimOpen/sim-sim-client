import { Component, inject } from '@angular/core';
import { Common } from '../../shared/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../shared/services/category.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  public common = inject(Common);
  readonly categoryService = inject(CategoryService);
  readonly categories = this.categoryService.categories;
}
