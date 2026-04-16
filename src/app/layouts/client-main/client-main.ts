import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-client-main',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './client-main.html',
  styleUrl: './client-main.scss',
})
export class ClientMain {
  private router = inject(Router);

  ngOnInit() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      window.scrollTo(0, 0);
      // or if .main-content has its own scroll:
      // document.getElementsByClassName('main-content')[0]?.scrollTo(0, 0);
    });
  }
}
