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
import { CollectionsFacade } from '../../../collections/state/collections.facade';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-assign-collections-panel',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="assign-panel">
      <!-- Assigned collections -->
      <div class="assign-panel__section">
        <h2 class="assign-panel__title">
          Collections ({{ assignedCount() }})
        </h2>

        @if (loading()) {
          <app-loading-spinner label="Loading collections…" />
        } @else if (assigned().length === 0) {
          <app-empty-state message="Not assigned to any collection yet. Add some below." />
        } @else {
          <ul class="assign-list">
            @for (col of assigned(); track col.id) {
              <li class="assign-list__item">
                <div class="assign-list__info">
                  <a [routerLink]="['/collections', col.id]" class="assign-list__name">
                    {{ col.name }}
                  </a>
                  @if (col.description) {
                    <span class="assign-list__meta">{{ col.description }}</span>
                  }
                </div>
                <button
                  class="btn btn--secondary btn--sm"
                  type="button"
                  (click)="onUnassign(col.id)"
                >
                  Remove
                </button>
              </li>
            }
          </ul>
        }
      </div>

      <!-- Available collections -->
      <div class="assign-panel__section assign-panel__section--add">
        <h3 class="assign-panel__subtitle">
          Add to collection
          @if (availableCount() > 0) {
            <span class="assign-panel__count">({{ availableCount() }} available)</span>
          }
        </h3>

        @if (!loading() && availableCount() === 0) {
          <p class="assign-panel__all-added">This book is already in all collections.</p>
        } @else if (!loading()) {
          <div class="assign-panel__search">
            <input
              type="search"
              placeholder="Search collections…"
              [value]="searchTerm()"
              (input)="onSearch($event)"
              autocomplete="off"
            />
          </div>

          @if (filteredAvailable().length === 0) {
            <p class="assign-panel__no-results">No collections match your search.</p>
          } @else {
            <ul class="assign-list">
              @for (col of filteredAvailable(); track col.id) {
                <li class="assign-list__item">
                  <div class="assign-list__info">
                    <span class="assign-list__name">{{ col.name }}</span>
                    @if (col.description) {
                      <span class="assign-list__meta">{{ col.description }}</span>
                    }
                  </div>
                  <button
                    class="btn btn--primary btn--sm"
                    type="button"
                    (click)="onAssign(col.id)"
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
      border-top: 1px solid #dee2e6;
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
      color: #6c757d;
      font-size: 0.875rem;
    }

    .assign-panel__search {
      margin-bottom: 12px;
    }

    .assign-panel__search input {
      width: 100%;
      max-width: 400px;
    }

    .assign-panel__all-added,
    .assign-panel__no-results {
      font-size: 0.875rem;
      color: #6c757d;
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
      border: 1px solid #dee2e6;
      border-radius: 6px;
      background: #fff;
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
      color: #6c757d;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn--sm {
      flex-shrink: 0;
      font-size: 0.875rem;
      padding: 6px 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignCollectionsPanelComponent implements OnInit {
  private readonly booksFacade = inject(BooksFacade);
  private readonly collectionsFacade = inject(CollectionsFacade);

  bookId = input.required<string>();

  private readonly id$ = toObservable(this.bookId);

  readonly book = toSignal(
    this.id$.pipe(switchMap(id => this.booksFacade.getById(id))),
  );

  readonly allCollections = toSignal(this.collectionsFacade.allCollections$, {
    initialValue: [],
  });

  readonly loading = toSignal(this.collectionsFacade.loading$, { initialValue: true });

  readonly assigned = computed(() => {
    const b = this.book();
    if (!b) return [];
    return this.allCollections().filter(c => b.collectionIds.includes(c.id));
  });

  readonly available = computed(() => {
    const b = this.book();
    if (!b) return [];
    return this.allCollections().filter(c => !b.collectionIds.includes(c.id));
  });

  readonly assignedCount = computed(() => this.assigned().length);
  readonly availableCount = computed(() => this.available().length);

  readonly searchTerm = signal('');

  readonly filteredAvailable = computed(() => {
    const q = this.searchTerm().toLowerCase();
    if (!q) return this.available();
    return this.available().filter(c => c.name.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.collectionsFacade.loadAll();
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onAssign(collectionId: string): void {
    this.booksFacade.assignToCollection(this.bookId(), collectionId);
  }

  onUnassign(collectionId: string): void {
    this.booksFacade.unassignFromCollection(this.bookId(), collectionId);
  }
}
