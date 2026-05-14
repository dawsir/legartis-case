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

        <div class="filter-field">
          <label class="filter-field__label" for="genre-filter">Genre</label>
          <select
            id="genre-filter"
            class="filter-field__select"
            [value]="filter().genre ?? ''"
            (change)="onGenreChange($event)"
          >
            <option value="">All genres</option>
            @for (opt of genreOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
        </div>

        <div class="filter-field filter-field--narrow">
          <label class="filter-field__label" for="year-from">Year from</label>
          <input
            id="year-from"
            type="number"
            class="filter-field__input"
            [value]="filter().yearFrom ?? ''"
            placeholder="e.g. 1900"
            (change)="onYearFromChange($event)"
          />
        </div>

        <div class="filter-field filter-field--narrow">
          <label class="filter-field__label" for="year-to">Year to</label>
          <input
            id="year-to"
            type="number"
            class="filter-field__input"
            [value]="filter().yearTo ?? ''"
            placeholder="e.g. 2024"
            (change)="onYearToChange($event)"
          />
        </div>

        <div class="filter-field">
          <label class="filter-field__label" for="collection-filter">Collection</label>
          <select
            id="collection-filter"
            class="filter-field__select"
            [value]="filter().collectionId ?? ''"
            (change)="onCollectionChange($event)"
          >
            <option value="">All collections</option>
            @for (c of allCollections(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </div>

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

    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 140px;
    }

    .filter-field--narrow {
      min-width: 110px;
    }

    .filter-field__label {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .filter-field__select,
    .filter-field__input {
      width: 100%;
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
  readonly genreOptions = BOOK_GENRE_OPTIONS;

  readonly books = toSignal(this.facade.books$, { initialValue: [] });
  readonly allBooks = toSignal(this.facade.allBooks$, { initialValue: [] });
  readonly loading = toSignal(this.facade.loading$, { initialValue: false });
  readonly error = toSignal(this.facade.error$, { initialValue: null });
  readonly filter = toSignal(this.facade.filter$, { requireSync: true });
  readonly sort = toSignal(this.facade.sort$, { requireSync: true });
  readonly allCollections = toSignal(this.collectionsFacade.allCollections$, { initialValue: [] });

  readonly isEmpty = computed(() => !this.loading() && this.books().length === 0);
  readonly noResults = computed(() => this.isEmpty() && this.allBooks().length > 0);

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

  onGenreChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.facade.setFilter({ genre: value ? (value as BookGenre) : null });
  }

  onYearFromChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const year = value !== '' ? parseInt(value, 10) : null;
    this.facade.setFilter({ yearFrom: year !== null && !isNaN(year) ? year : null });
  }

  onYearToChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const year = value !== '' ? parseInt(value, 10) : null;
    this.facade.setFilter({ yearTo: year !== null && !isNaN(year) ? year : null });
  }

  onCollectionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
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
