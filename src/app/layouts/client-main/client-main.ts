import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-client-main',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './client-main.html',
  styleUrl: './client-main.scss',
})
export class ClientMain {}
