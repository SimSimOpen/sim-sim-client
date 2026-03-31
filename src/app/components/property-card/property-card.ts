import { Component, Input } from '@angular/core';
import { Property } from '../../shared/models/properties';

@Component({
  selector: 'app-property-card',
  imports: [],
  templateUrl: './property-card.html',
  styleUrl: './property-card.scss',
})
export class PropertyCard {
  @Input() property?: Property;
}
