import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">
        <img [src]="image()" [alt]="message()" class="empty-state__image">
      </div>
      <p class="empty-state__message">{{ message() }}</p>
      @if (actionLabel()) {
        <button class="btn btn--primary" type="button" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  message = input<string>('No items found.');
  actionLabel = input<string>('');
  image = input<string>('/empty.png');
  action = output<void>();
}
