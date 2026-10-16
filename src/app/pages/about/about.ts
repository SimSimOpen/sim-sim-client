import { Component, inject } from '@angular/core';
import { Common } from '../../shared/common';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-about',
  imports: [TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  public common = inject(Common);
}
