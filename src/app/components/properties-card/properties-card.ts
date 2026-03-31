import { Component, Input } from '@angular/core';
import { Property } from '../../shared/models/properties';
import { PropertyCard } from '../property-card/property-card';

@Component({
  selector: 'app-properties-card',
  imports: [PropertyCard],
  templateUrl: './properties-card.html',
  styleUrl: './properties-card.scss',
})
export class PropertiesCard {
  @Input() properties?: Property[];
}
