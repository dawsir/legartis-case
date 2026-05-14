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
import { BooksFacade } from '../../state/books.facade';
import { CollectionsFacade } from '../../../collections/state/collections.facade';
import { BookCardComponent } from '../../components/book-card/book-card.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { FilterNumberInputComponent } from '../../../../shared/components/filter-number-input/filter-number-input.component';
import { FilterSelectComponent } from '../../../../shared/components/filter-select/filter-select.component';
import {
  SortOption,
  SortSelectComponent,
} from '../../../../shared/components/sort-select/sort-select.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BOOK_GENRE_OPTIONS } from '../../../../shared/models/book-genre.enum';
import { BookGenre } from '../../../../shared/models/book-genre.enum';
import { BooksSort } from '../../../../shared/models/filters.model';

const SORT_OPTIONS: SortOption[] = [
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'genre', label: 'Genre' },
  { value: 'year', label: 'Year' },
  { value: 'createdAt', label: 'Date added' },
];

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [
    RouterLink,
    BookCardComponent,
    SearchInputComponent,
    FilterNumberInputComponent,
    FilterSelectComponent,
    SortSelectComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorMessageComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="container page-content">
      <div class="page-header">
        <h1 class="page-header__title">Books</h1>
        <div class="page-header__actions">
          <a routerLink="new" class="btn btn--primary">Add book</a>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar">
        <app-search-input
          label="Search"
          placeholder="Search title, author or genre…"
          [value]="filter().searchTerm"
          (searchChanged)="onSearch($event)"
        />

        <app-filter-select
          label="Genre"
          inputId="genre-filter"
          [value]="filter().genre ?? ''"
          [options]="genreOptions"
          defaultLabel="All genres"
          (valueChanged)="onGenreChange($event)"
        />

        <div class="filter-year-group">
          <div class="filter-year-group__fields">
            <app-filter-number-input
              label="Year from"
              inputId="year-from"
              placeholder="e.g. 1900"
              [value]="filter().yearFrom"
              [hasError]="yearRangeError() !== null"
              (valueChanged)="onYearFromChange($event)"
            />
            <app-filter-number-input
              label="Year to"
              inputId="year-to"
              placeholder="e.g. 2024"
              [value]="filter().yearTo"
              [hasError]="yearRangeError() !== null"
              (valueChanged)="onYearToChange($event)"
            />
          </div>
          @if (yearRangeError()) {
            <span class="filter-year-group__error">{{ yearRangeError() }}</span>
          }
        </div>

        <app-filter-select
          label="Collection"
          inputId="collection-filter"
          [value]="filter().collectionId ?? ''"
          [options]="collectionOptions()"
          defaultLabel="All collections"
          (valueChanged)="onCollectionChange($event)"
        />

        <app-sort-select
          [options]="sortOptions"
          [activeProperty]="sort().property"
          [activeDirection]="sort().direction"
          (sortChanged)="onSort($event)"
        />

        @if (isFilterActive()) {
          <button class="btn btn--secondary" type="button" (click)="onClearFilters()">
            Clear filters
          </button>
        }
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (error()) {
        <app-error-message [message]="error()!" (retry)="onRetry()" />
      } @else if (isEmpty()) {
        @if (noResults()) {
          <app-empty-state
            title="No books match your filters"
            message="Try changing the search, genre, year, or collection filter."
          />
        } @else {
          <app-empty-state
            title="No books yet"
            message="Add your first book to get started."
            actionLabel="Add book"
            (action)="onAddFirst()"
          />
        }
      } @else {
        <p class="books-list__count">{{ books().length }} book{{ books().length === 1 ? '' : 's' }}</p>
        <div class="grid">
          @for (book of books(); track book.id) {
            <app-book-card [book]="book" (deleteRequested)="openDeleteDialog($event)" />
          }
        </div>
      }

      <app-confirm-dialog
        [isOpen]="isDeleteDialogOpen()"
        title="Delete book"
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

    .filter-bar {
      align-items: flex-end;
    }

    .filter-year-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .filter-year-group__fields {
      display: flex;
      gap: 8px;
    }

    .filter-year-group__error {
      font-size: 0.75rem;
      color: #d92d20;
      white-space: nowrap;
    }

    .books-list__count {
      font-size: 0.875rem;
      color: #475467;
      margin-bottom: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooksListComponent implements OnInit {
  private readonly facade = inject(BooksFacade);
  private readonly collectionsFacade = inject(CollectionsFacade);
  private readonly router = inject(Router);

  readonly sortOptions = SORT_OPTIONS;
  readonly genreOptions = BOOK_GENRE_OPTIONS as Array<{ value: string; label: string }>;

  readonly books = toSignal(this.facade.books$, { initialValue: [] });
  readonly allBooks = toSignal(this.facade.allBooks$, { initialValue: [] });
  readonly loading = toSignal(this.facade.loading$, { initialValue: false });
  readonly error = toSignal(this.facade.error$, { initialValue: null });
  readonly filter = toSignal(this.facade.filter$, { requireSync: true });
  readonly sort = toSignal(this.facade.sort$, { requireSync: true });
  readonly allCollections = toSignal(this.collectionsFacade.allCollections$, { initialValue: [] });

  readonly collectionOptions = computed(() =>
    this.allCollections().map(c => ({ value: c.id, label: c.name })),
  );

  readonly isEmpty = computed(() => !this.loading() && this.books().length === 0);
  readonly noResults = computed(() => this.isEmpty() && this.allBooks().length > 0);

  readonly yearRangeError = computed(() => {
    const f = this.filter();
    return f.yearFrom !== null && f.yearTo !== null && f.yearFrom > f.yearTo
      ? '"Year from" must be ≤ "Year to"'
      : null;
  });

  readonly isFilterActive = computed(() => {
    const f = this.filter();
    return (
      f.searchTerm !== '' ||
      f.genre !== null ||
      f.yearFrom !== null ||
      f.yearTo !== null ||
      f.collectionId !== null
    );
  });

  readonly pendingDeleteId = signal<string | null>(null);
  readonly isDeleteDialogOpen = computed(() => this.pendingDeleteId() !== null);
  readonly deleteDialogMessage = computed(() => {
    const id = this.pendingDeleteId();
    if (!id) return 'This action cannot be undone.';
    const book = this.allBooks().find(b => b.id === id);
    return book
      ? `Delete "${book.title}" by ${book.author}? This action cannot be undone.`
      : 'This action cannot be undone.';
  });

  ngOnInit(): void {
    this.facade.loadAll();
    this.collectionsFacade.loadAll();
  }

  onSearch(searchTerm: string): void {
    this.facade.setFilter({ searchTerm });
  }

  onGenreChange(value: string): void {
    this.facade.setFilter({ genre: value ? (value as BookGenre) : null });
  }

  onYearFromChange(value: number | null): void {
    this.facade.setFilter({ yearFrom: value });
  }

  onYearToChange(value: number | null): void {
    this.facade.setFilter({ yearTo: value });
  }

  onCollectionChange(value: string): void {
    this.facade.setFilter({ collectionId: value || null });
  }

  onSort({ property, direction }: { property: string; direction: 'asc' | 'desc' }): void {
    this.facade.setSort({ property, direction } as BooksSort);
  }

  onClearFilters(): void {
    this.facade.clearFilter();
  }

  onRetry(): void {
    this.facade.loadAll();
  }

  onAddFirst(): void {
    this.router.navigate(['/books/new']);
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
