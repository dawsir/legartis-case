import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  template: `
    <div class="error-message" role="alert">
      <span class="error-message__text">{{ message() }}</span>
      @if (showRetry()) {
        <button class="btn btn--secondary error-message__retry" type="button" (click)="retry.emit()">
          Try again
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: block; }

    .error-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #fff5f5;
      border: 1px solid #ffa8a8;
      border-radius: 8px;
      color: #c92a2a;
      font-size: 0.875rem;
    }

    .error-message__text {
      flex: 1;
    }

    .error-message__retry {
      flex-shrink: 0;
      font-size: 0.875rem;
      padding: 4px 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {
  message = input.required<string>();
  showRetry = input<boolean>(true);
  retry = output<void>();
}
