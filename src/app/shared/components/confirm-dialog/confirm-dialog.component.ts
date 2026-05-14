import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="dialog-backdrop" (click)="onCancel()" (keydown.escape)="onCancel()" role="presentation">
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'dialog-title-' + _uid"
          (click)="$event.stopPropagation()"
        >
          <h2 class="dialog__title" [id]="'dialog-title-' + _uid">{{ title() }}</h2>
          <p class="dialog__message">{{ message() }}</p>
          <div class="dialog__actions">
            <button class="btn btn--secondary" type="button" (click)="onCancel()">Cancel</button>
            <button class="btn btn--danger" type="button" (click)="onConfirm()">Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: contents; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  isOpen = input.required<boolean>();
  title = input<string>('Confirm deletion');
  message = input<string>('This action cannot be undone.');
  confirmed = output<void>();
  cancelled = output<void>();

  readonly _uid = Math.random().toString(36).slice(2);

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
