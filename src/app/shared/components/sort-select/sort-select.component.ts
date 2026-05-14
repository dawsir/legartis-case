import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SortDirection } from '../../models/filters.model';

export interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-sort-select',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="sort-select">
      <label [for]="_fieldId" class="sort-select__label">Sort by</label>
      <div class="sort-select__controls">
        <select
          [id]="_fieldId"
          class="sort-select__field"
          [value]="activeProperty()"
          (change)="onPropertyChange($event)"
        >
          @for (opt of options(); track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
        <button
          class="sort-select__dir btn btn--secondary"
          type="button"
          [attr.aria-label]="activeDirection() === 'asc' ? 'Sort ascending' : 'Sort descending'"
          (click)="onToggleDirection()"
        >
          {{ activeDirection() === 'asc' ? '↑' : '↓' }}
        </button>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .sort-select__label {
      display: block;
      margin-bottom: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .sort-select__controls {
      display: flex;
      gap: 8px;
    }

    .sort-select__field {
      flex: 1;
    }

    .sort-select__dir {
      flex-shrink: 0;
      min-width: 40px;
      padding: 0 10px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortSelectComponent {
  options = input.required<SortOption[]>();
  activeProperty = input.required<string>();
  activeDirection = input<SortDirection>('asc');

  sortChanged = output<{ property: string; direction: SortDirection }>();

  readonly _fieldId = 'sort-' + Math.random().toString(36).slice(2);

  onPropertyChange(event: Event): void {
    const property = (event.target as HTMLSelectElement).value;
    this.sortChanged.emit({ property, direction: this.activeDirection() });
  }

  onToggleDirection(): void {
    const direction: SortDirection = this.activeDirection() === 'asc' ? 'desc' : 'asc';
    this.sortChanged.emit({ property: this.activeProperty(), direction });
  }
}
