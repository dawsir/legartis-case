import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CollectionsFacade } from '../../state/collections.facade';
import { BooksFacade } from '../../../books/state/books.facade';
import { CollectionCardComponent } from '../../components/collection-card/collection-card.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import {
  SortOption,
  SortSelectComponent,
} from '../../../../shared/components/sort-select/sort-select.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CollectionsSort } from '../../../../shared/models/filters.model';

const SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'booksCount', label: 'Books count' },
  { value: 'createdAt', label: 'Date created' },
];

@Component({
  selector: 'app-collections-list',
  standalone: true,
  imports: [
    RouterLink,
    CollectionCardComponent,
    SearchInputComponent,
    SortSelectComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorMessageComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="container page-content">
      <div class="page-header">
        <h1 class="page-header__title">Collections</h1>
        <div class="page-header__actions">
          <a routerLink="new" class="btn btn--primary">New collection</a>
        </div>
      </div>

      <div class="filter-bar">
        <app-search-input
          label="Search"
          placeholder="Search by name or description…"
          [value]="filter().searchTerm"
          (searchChanged)="onSearch($event)"
        />
        <app-sort-select
          [options]="sortOptions"
          [activeProperty]="sort().property"
          [activeDirection]="sort().direction"
          (sortChanged)="onSort($event)"
        />
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (error()) {
        <app-error-message [message]="error()!" (retry)="onRetry()" />
      } @else if (isEmpty()) {
        @if (noResults()) {
          <app-empty-state message="No collections match your search." />
        } @else {
          <app-empty-state
            message="No collections yet."
            actionLabel="Create your first collection"
            (action)="onCreateFirst()"
          />
        }
      } @else {
        <div class="grid">
          @for (collection of collections(); track collection.id) {
            <app-collection-card
              [collection]="collection"
              (deleteRequested)="openDeleteDialog($event)"
            />
          }
        </div>
      }

      <app-confirm-dialog
        [isOpen]="isDeleteDialogOpen()"
        title="Delete collection"
        [message]="deleteDialogMessage()"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="closeDeleteDialog()"
      />
    </div>
  `,
  styles: `
    :host { display: block; }

    .page-content {
      padding-top: 32px;
      padding-bottom: 48px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsListComponent implements OnInit {
  private readonly facade = inject(CollectionsFacade);
  private readonly booksFacade = inject(BooksFacade);
  private readonly router = inject(Router);

  readonly sortOptions = SORT_OPTIONS;

  readonly collections = toSignal(this.facade.collections$, { initialValue: [] });
  readonly allCollections = toSignal(this.facade.allCollections$, { initialValue: [] });
  readonly loading = toSignal(this.facade.loading$, { initialValue: false });
  readonly error = toSignal(this.facade.error$, { initialValue: null });
  readonly filter = toSignal(this.facade.filter$, { requireSync: true });
  readonly sort = toSignal(this.facade.sort$, { requireSync: true });

  readonly isEmpty = computed(() => !this.loading() && this.collections().length === 0);
  readonly noResults = computed(() => this.isEmpty() && this.allCollections().length > 0);

  readonly pendingDeleteId = signal<string | null>(null);
  readonly isDeleteDialogOpen = computed(() => this.pendingDeleteId() !== null);
  readonly deleteDialogMessage = computed(() => {
    const id = this.pendingDeleteId();
    if (!id) return 'This action cannot be undone.';
    const collection = this.collections().find(c => c.id === id);
    return collection
      ? `Delete "${collection.name}"? This will remove the collection from all associated books.`
      : 'This action cannot be undone.';
  });

  ngOnInit(): void {
    this.facade.loadAll();
    this.booksFacade.loadAll();
  }

  onSearch(searchTerm: string): void {
    this.facade.setFilter({ searchTerm });
  }

  onSort({ property, direction }: { property: string; direction: 'asc' | 'desc' }): void {
    this.facade.setSort({ property, direction } as CollectionsSort);
  }

  onRetry(): void {
    this.facade.loadAll();
    this.booksFacade.loadAll();
  }

  onCreateFirst(): void {
    this.router.navigate(['/collections/new']);
  }

  openDeleteDialog(id: string): void {
    this.pendingDeleteId.set(id);
  }

  closeDeleteDialog(): void {
    this.pendingDeleteId.set(null);
  }

  onDeleteConfirmed(): void {
    const id = this.pendingDeleteId();
    if (id) this.facade.delete(id);
    this.pendingDeleteId.set(null);
  }
}
