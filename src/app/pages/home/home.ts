import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../shared/services/category.service';
import { CategoryIcon } from '../../components/category-icon/category-icon';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CategoryIcon, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly categoryService = inject(CategoryService);
  readonly categories = this.categoryService.categories;
}
