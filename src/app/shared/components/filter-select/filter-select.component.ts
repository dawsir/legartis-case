import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-filter-select',
  standalone: true,
  template: `
    <div class="filter-select">
      @if (label()) {
        <label [for]="_id()" class="filter-select__label">{{ label() }}</label>
      }
      <div class="filter-select__wrapper">
        <select
          [id]="_id()"
          class="filter-select__select"
          [value]="value()"
          [attr.aria-label]="label() || undefined"
          (change)="onChange($event)"
        >
          <option value="">{{ defaultLabel() }}</option>
          @for (opt of options(); track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
        @if (value()) {
          <button
            class="filter-select__clear"
            type="button"
            [attr.aria-label]="'Clear ' + (label() || 'selection')"
            (click)="onClear()"
          >
            &#x2715;
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; min-width: 140px; }

    .filter-select__label {
      display: block;
      margin-bottom: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .filter-select__wrapper {
      position: relative;
    }

    .filter-select__select {
      width: 100%;
      /* extra right padding: × button + chevron arrow */
      padding-right: 52px;
    }

    /* × sits just left of the chevron arrow (~20px at right edge) */
    .filter-select__clear {
      position: absolute;
      right: 28px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #6c757d;
      padding: 4px;
      line-height: 1;
      font-size: 0.75rem;
      z-index: 1;

      &:hover { color: #1a1a2e; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSelectComponent {
  label = input<string>('');
  inputId = input<string>('');
  value = input<string>('');
  options = input<Array<{ value: string; label: string }>>([]);
  defaultLabel = input<string>('All');

  valueChanged = output<string>();

  private readonly _autoId = 'filter-select-' + Math.random().toString(36).slice(2);
  readonly _id = computed(() => this.inputId() || this._autoId);

  onChange(event: Event): void {
    this.valueChanged.emit((event.target as HTMLSelectElement).value);
  }

  onClear(): void {
    this.valueChanged.emit('');
  }
}
