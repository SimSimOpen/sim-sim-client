import { Component } from '@angular/core';
import { getRandomLandingPageCoverImage } from '../../shared/constants/urls';

@Component({
  selector: 'app-search-section',
  imports: [],
  templateUrl: './search-section.html',
  styleUrl: './search-section.scss',
})
export class SearchSection {
  coverImageUrl: string;

  constructor() {
    this.coverImageUrl = getRandomLandingPageCoverImage();
  }
}
