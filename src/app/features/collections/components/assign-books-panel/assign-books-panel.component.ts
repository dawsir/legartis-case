import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { BooksFacade } from '../../../books/state/books.facade';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-assign-books-panel',
  standalone: true,
  imports: [RouterLink, SearchInputComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="assign-panel">
      <!-- Assigned books -->
      <div class="assign-panel__section">
        <h2 class="assign-panel__title">
          Books in this collection ({{ assignedCount() }})
        </h2>

        @if (loading()) {
          <app-loading-spinner label="Loading books…" />
        } @else if (assigned().length === 0) {
          <app-empty-state message="No books in this collection yet. Add some below." />
        } @else {
          <ul class="assign-list">
            @for (book of assigned(); track book.id) {
              <li class="assign-list__item">
                <div class="assign-list__info">
                  <a [routerLink]="['/books', book.id]" class="assign-list__name">
                    {{ book.title }}
                  </a>
                  <span class="assign-list__meta">{{ book.author }} · {{ book.year }}</span>
                </div>
                <button
                  class="btn btn--secondary btn--sm"
                  type="button"
                  (click)="onUnassign(book.id)"
                >
                  Remove
                </button>
              </li>
            }
          </ul>
        }
      </div>

      <!-- Available books -->
      <div class="assign-panel__section assign-panel__section--add">
        <h3 class="assign-panel__subtitle">
          Add books
          @if (availableCount() > 0) {
            <span class="assign-panel__count">({{ availableCount() }} available)</span>
          }
        </h3>

        @if (!loading() && availableCount() === 0) {
          <p class="assign-panel__all-added">All books are already in this collection.</p>
        } @else if (!loading()) {
          <div class="assign-panel__search">
            <app-search-input
              placeholder="Search by title or author…"
              [value]="searchTerm()"
              (searchChanged)="searchTerm.set($event)"
            />
          </div>

          @if (filteredAvailable().length === 0) {
            <p class="assign-panel__no-results">No books match your search.</p>
          } @else {
            <ul class="assign-list">
              @for (book of filteredAvailable(); track book.id) {
                <li class="assign-list__item">
                  <div class="assign-list__info">
                    <span class="assign-list__name">{{ book.title }}</span>
                    <span class="assign-list__meta">{{ book.author }} · {{ book.genre }}</span>
                  </div>
                  <button
                    class="btn btn--primary btn--sm"
                    type="button"
                    (click)="onAssign(book.id)"
                  >
                    Add
                  </button>
                </li>
              }
            </ul>
          }
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .assign-panel__section {
      margin-bottom: 32px;
    }

    .assign-panel__section--add {
      border-top: 1px solid #e4e7ec;
      padding-top: 24px;
    }

    .assign-panel__title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .assign-panel__subtitle {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .assign-panel__count {
      font-weight: 400;
      color: #475467;
      font-size: 0.875rem;
    }

    .assign-panel__search {
      margin-bottom: 12px;
      max-width: 400px;
    }

    .assign-panel__all-added,
    .assign-panel__no-results {
      font-size: 0.875rem;
      color: #475467;
      font-style: italic;
    }

    .assign-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .assign-list__item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border: 1px solid #e4e7ec;
      border-radius: 6px;
      background: #ffffff;
    }

    .assign-list__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .assign-list__name {
      font-weight: 500;
      color: inherit;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &:hover { text-decoration: underline; }
    }

    .assign-list__meta {
      font-size: 0.8125rem;
      color: #475467;
    }

    .btn--sm {
      flex-shrink: 0;
      font-size: 0.875rem;
      padding: 6px 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignBooksPanelComponent implements OnInit {
  private readonly booksFacade = inject(BooksFacade);

  collectionId = input.required<string>();

  private readonly id$ = toObservable(this.collectionId);

  readonly assigned = toSignal(
    this.id$.pipe(switchMap(id => this.booksFacade.getBooksForCollection(id))),
    { initialValue: [] },
  );

  readonly available = toSignal(
    this.id$.pipe(switchMap(id => this.booksFacade.getAvailableForCollection(id))),
    { initialValue: [] },
  );

  readonly loading = toSignal(this.booksFacade.loading$, { initialValue: true });

  readonly assignedCount = computed(() => this.assigned().length);
  readonly availableCount = computed(() => this.available().length);

  readonly searchTerm = signal('');

  readonly filteredAvailable = computed(() => {
    const q = this.searchTerm().toLowerCase();
    if (!q) return this.available();
    return this.available().filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q),
    );
  });

  ngOnInit(): void {
    this.booksFacade.loadAll();
  }

  onAssign(bookId: string): void {
    this.booksFacade.assignToCollection(bookId, this.collectionId());
  }

  onUnassign(bookId: string): void {
    this.booksFacade.unassignFromCollection(bookId, this.collectionId());
  }
}
