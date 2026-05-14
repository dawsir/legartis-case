import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="not-found container">
      <div class="not-found__code" aria-hidden="true">404</div>
      <h1 class="not-found__title">Page not found</h1>
      <p class="not-found__message">The page you are looking for does not exist or has been moved.</p>
      <a routerLink="/collections" class="btn btn--primary">Back to Collections</a>
    </section>
  `,
  styles: `
    :host { display: block; }

    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding-top: 80px;
      padding-bottom: 80px;
    }

    .not-found__code {
      font-size: 6rem;
      font-weight: 800;
      line-height: 1;
      color: #dee2e6;
      margin-bottom: 16px;
      letter-spacing: -2px;
    }

    .not-found__title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 12px;
      color: #1a1a2e;
    }

    .not-found__message {
      font-size: 1rem;
      color: #6c757d;
      margin-bottom: 32px;
      max-width: 400px;
    }
  `,
})
export class NotFoundComponent {}
