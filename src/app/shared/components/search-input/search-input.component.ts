import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="search-input">
      @if (label()) {
        <label [for]="_id" class="search-input__label">{{ label() }}</label>
      }
      <div class="search-input__wrapper">
        <input
          [id]="_id"
          class="search-input__field"
          type="search"
          [placeholder]="placeholder()"
          [value]="value()"
          [attr.aria-label]="label() || placeholder()"
          (input)="onInput($event)"
          autocomplete="off"
        />
        @if (hasValue()) {
          <button
            class="search-input__clear"
            type="button"
            aria-label="Clear search"
            (click)="onClear()"
          >
            &#x2715;
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .search-input__label {
      display: block;
      margin-bottom: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .search-input__wrapper {
      position: relative;
    }

    .search-input__field {
      width: 100%;
      padding-right: 36px;
    }

    .search-input__clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #6c757d;
      padding: 4px;
      line-height: 1;
      font-size: 0.75rem;

      &:hover { color: #1a1a2e; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent implements OnInit, OnDestroy {
  label = input<string>('');
  placeholder = input<string>('Search…');
  value = input<string>('');
  debounceMs = input<number>(300);

  searchChanged = output<string>();

  readonly _id = 'search-' + Math.random().toString(36).slice(2);

  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly _currentValue = signal('');
  hasValue = computed(() => this._currentValue().length > 0);

  ngOnInit(): void {
    this._currentValue.set(this.value());
  }

  ngOnDestroy(): void {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this._currentValue.set(val);
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this.searchChanged.emit(val), this.debounceMs());
  }

  onClear(): void {
    this._currentValue.set('');
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this.searchChanged.emit('');
  }
}
