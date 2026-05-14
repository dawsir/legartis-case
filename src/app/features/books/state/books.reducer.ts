import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Book } from '../../../shared/models/book.model';
import { BooksFilter, BooksSort } from '../../../shared/models/filters.model';
import { BooksActions } from './books.actions';

export interface BooksState extends EntityState<Book> {
  loading: boolean;
  error: string | null;
  filter: BooksFilter;
  sort: BooksSort;
}

export const adapter: EntityAdapter<Book> = createEntityAdapter<Book>();

const initialFilter: BooksFilter = {
  searchTerm: '',
  genre: null,
  yearFrom: null,
  yearTo: null,
  collectionId: null,
};

const initialSort: BooksSort = {
  property: 'title',
  direction: 'asc',
};

export const initialBooksState: BooksState = adapter.getInitialState({
  loading: false,
  error: null,
  filter: initialFilter,
  sort: initialSort,
});

export const booksReducer = createReducer(
  initialBooksState,

  on(BooksActions.loadBooks, state => ({ ...state, loading: true, error: null })),
  on(BooksActions.loadBooksSuccess, (state, { books }) =>
    adapter.setAll(books, { ...state, loading: false, error: null }),
  ),
  on(BooksActions.loadBooksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(BooksActions.loadBook, state => ({ ...state, loading: true, error: null })),
  on(BooksActions.loadBookSuccess, (state, { book }) =>
    adapter.upsertOne(book, { ...state, loading: false }),
  ),
  on(BooksActions.loadBookFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(BooksActions.createBook, state => ({ ...state, loading: true, error: null })),
  on(BooksActions.createBookSuccess, (state, { book }) =>
    adapter.addOne(book, { ...state, loading: false }),
  ),
  on(BooksActions.createBookFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(BooksActions.updateBook, state => ({ ...state, loading: true, error: null })),
  on(BooksActions.updateBookSuccess, (state, { book }) =>
    adapter.upsertOne(book, { ...state, loading: false }),
  ),
  on(BooksActions.updateBookFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(BooksActions.deleteBook, state => ({ ...state, loading: true, error: null })),
  on(BooksActions.deleteBookSuccess, (state, { id }) =>
    adapter.removeOne(id, { ...state, loading: false }),
  ),
  on(BooksActions.deleteBookFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(BooksActions.assignBookToCollectionSuccess, (state, { book }) =>
    adapter.upsertOne(book, state),
  ),
  on(BooksActions.assignBookToCollectionFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(BooksActions.unassignBookFromCollectionSuccess, (state, { book }) =>
    adapter.upsertOne(book, state),
  ),
  on(BooksActions.unassignBookFromCollectionFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(BooksActions.setBooksFilter, (state, { filter }) => ({
    ...state,
    filter: { ...state.filter, ...filter },
  })),
  on(BooksActions.clearBooksFilter, state => ({
    ...state,
    filter: initialFilter,
  })),
  on(BooksActions.setBooksSort, (state, { sort }) => ({ ...state, sort })),
);

export const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors();
