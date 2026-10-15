import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../shared/services/category.service';
import { CategoryIcon } from '../../components/category-icon/category-icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CategoryIcon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly categories = inject(CategoryService).categories;
}
