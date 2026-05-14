import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">
        <img [src]="image()" alt="" class="empty-state__image">
      </div>
      @if (title()) {
        <h2 class="empty-state__title">{{ title() }}</h2>
      }
      <p class="empty-state__message">{{ message() }}</p>
      @if (actionLabel()) {
        <div class="empty-state__actions">
          <button class="btn btn--primary" type="button" (click)="action.emit()">
            {{ actionLabel() }}
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  title = input<string>('');
  message = input<string>('No items found.');
  actionLabel = input<string>('');
  image = input<string>('/empty.png');
  action = output<void>();
}
