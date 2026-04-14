import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-browse',
  imports: [CommonModule],
  templateUrl: './browse.html',
  styleUrl: './browse.scss',
})
export class Browse {
  isFilterOpen: boolean = false;
}
