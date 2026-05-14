import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-filter-number-input',
  standalone: true,
  template: `
    <div class="filter-number">
      @if (label()) {
        <label [for]="_id()" class="filter-number__label">{{ label() }}</label>
      }
      <div class="filter-number__wrapper">
        <input
          [id]="_id()"
          type="number"
          class="filter-number__input"
          [class.filter-number__input--invalid]="hasError()"
          [value]="value() ?? ''"
          [placeholder]="placeholder()"
          [attr.aria-label]="label() || placeholder()"
          (change)="onChange($event)"
        />
        @if (value() !== null) {
          <button
            class="filter-number__clear"
            type="button"
            [attr.aria-label]="'Clear ' + (label() || 'field')"
            (click)="onClear()"
          >
            &#x2715;
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 110px;
    }

    .filter-number__label {
      display: block;
      margin-bottom: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .filter-number__wrapper {
      position: relative;
    }

    .filter-number__input {
      width: 100%;
    }

    .filter-number__input--invalid {
      border-color: #d92d20;

      &:focus {
        box-shadow: 0 0 0 3px rgba(217, 45, 32, 0.12);
      }
    }

    .filter-number__clear {
      position: absolute;
      right: 35px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #6c757d;
      padding: 4px;
      line-height: 1;
      font-size: 0.75rem;

      &:hover {
        color: #1a1a2e;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterNumberInputComponent {
  label = input<string>('');
  inputId = input<string>('');
  value = input<number | null>(null);
  placeholder = input<string>('');
  hasError = input<boolean>(false);

  valueChanged = output<number | null>();

  private readonly _autoId = 'filter-number-' + Math.random().toString(36).slice(2);
  readonly _id = computed(() => this.inputId() || this._autoId);

  onChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = raw !== '' ? parseInt(raw, 10) : null;
    this.valueChanged.emit(parsed !== null && !isNaN(parsed) ? parsed : null);
  }

  onClear(): void {
    this.valueChanged.emit(null);
  }
}
