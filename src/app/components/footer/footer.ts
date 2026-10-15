import { Component, inject } from '@angular/core';
import { Common } from '../../shared/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../shared/services/category.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  public common = inject(Common);
  readonly categories = inject(CategoryService).categories;
}
