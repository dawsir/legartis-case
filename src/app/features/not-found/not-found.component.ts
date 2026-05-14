import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="container empty-state">
      <h1 class="empty-state__title">404</h1>
      <p class="empty-state__message">The page you are looking for does not exist.</p>
      <a routerLink="/collections" class="btn btn--primary">Back to Collections</a>
    </section>
  `,
})
export class NotFoundComponent {}
