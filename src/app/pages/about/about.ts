import { Component, inject } from '@angular/core';
import { Common } from '../../shared/common';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  public common = inject(Common);
}
