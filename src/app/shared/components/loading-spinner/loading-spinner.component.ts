import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="loading-spinner" [attr.aria-label]="label()">
      <div class="spinner" role="status"></div>
      @if (label()) {
        <span class="loading-spinner__label">{{ label() }}</span>
      }
    </div>
  `,
  styles: `
    :host { display: block; }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 32px;
    }

    .loading-spinner__label {
      font-size: 0.875rem;
      color: #6c757d;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  label = input<string>('Loading…');
}
