import { Book } from '../../../shared/models/book.model';
import { BookGenre } from '../../../shared/models/book-genre.enum';
import { BooksActions } from './books.actions';
import { booksReducer, initialBooksState } from './books.reducer';

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'b1',
    title: 'Test Book',
    author: 'Test Author',
    genre: BookGenre.Classic,
    year: 2000,
    collectionIds: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('booksReducer', () => {
  describe('initial state', () => {
    it('returns initial state for unknown action', () => {
      const state = booksReducer(undefined, { type: '__unknown__' } as never);
      expect(state).toEqual(initialBooksState);
    });

    it('has loading false and no error by default', () => {
      expect(initialBooksState.loading).toBe(false);
      expect(initialBooksState.error).toBeNull();
    });
  });

  describe('load books', () => {
    it('sets loading true on loadBooks', () => {
      const state = booksReducer(initialBooksState, BooksActions.loadBooks());
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('populates entities and clears loading on loadBooksSuccess', () => {
      const books = [makeBook({ id: 'b1' }), makeBook({ id: 'b2', title: 'Second' })];
      const state = booksReducer(initialBooksState, BooksActions.loadBooksSuccess({ books }));
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.ids).toEqual(['b1', 'b2']);
      expect(state.entities['b1']).toEqual(books[0]);
      expect(state.entities['b2']).toEqual(books[1]);
    });

    it('replaces existing entities on loadBooksSuccess', () => {
      const first = booksReducer(initialBooksState, BooksActions.loadBooksSuccess({
        books: [makeBook({ id: 'old' })],
      }));
      const state = booksReducer(first, BooksActions.loadBooksSuccess({
        books: [makeBook({ id: 'new' })],
      }));
      expect(state.ids).toEqual(['new']);
      expect(state.entities['old']).toBeUndefined();
    });

    it('sets error and clears loading on loadBooksFailure', () => {
      const loading = booksReducer(initialBooksState, BooksActions.loadBooks());
      const state = booksReducer(loading, BooksActions.loadBooksFailure({ error: 'Network error' }));
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('create book', () => {
    it('sets loading true on createBook', () => {
      const state = booksReducer(initialBooksState, BooksActions.createBook({
        payload: { title: 'New', author: 'A', genre: BookGenre.Classic, year: 2000, collectionIds: [] },
      }));
      expect(state.loading).toBe(true);
    });

    it('adds entity on createBookSuccess', () => {
      const book = makeBook({ id: 'new-id' });
      const state = booksReducer(initialBooksState, BooksActions.createBookSuccess({ book }));
      expect(state.ids).toContain('new-id');
      expect(state.entities['new-id']).toEqual(book);
      expect(state.loading).toBe(false);
    });

    it('sets error on createBookFailure', () => {
      const state = booksReducer(initialBooksState, BooksActions.createBookFailure({ error: 'Failed' }));
      expect(state.error).toBe('Failed');
      expect(state.loading).toBe(false);
    });
  });

  describe('update book', () => {
    it('upserts entity with new title on updateBookSuccess', () => {
      const existing = makeBook({ id: 'b1', title: 'Old Title' });
      const withBook = booksReducer(initialBooksState, BooksActions.loadBooksSuccess({ books: [existing] }));
      const updated = makeBook({ id: 'b1', title: 'New Title' });
      const state = booksReducer(withBook, BooksActions.updateBookSuccess({ book: updated }));
      expect(state.entities['b1']?.title).toBe('New Title');
      expect(state.loading).toBe(false);
    });
  });

  describe('delete book', () => {
    it('removes entity by id on deleteBookSuccess', () => {
      const withBooks = booksReducer(initialBooksState, BooksActions.loadBooksSuccess({
        books: [makeBook({ id: 'b1' }), makeBook({ id: 'b2' })],
      }));
      const state = booksReducer(withBooks, BooksActions.deleteBookSuccess({ id: 'b1' }));
      expect(state.ids).not.toContain('b1');
      expect(state.ids).toContain('b2');
      expect(state.loading).toBe(false);
    });
  });

  describe('assign / unassign', () => {
    it('upserts book with new collectionIds on assignBookToCollectionSuccess', () => {
      const book = makeBook({ id: 'b1', collectionIds: ['c1'] });
      const state = booksReducer(initialBooksState, BooksActions.assignBookToCollectionSuccess({ book }));
      expect(state.entities['b1']?.collectionIds).toContain('c1');
    });

    it('upserts book with removed collectionId on unassignBookFromCollectionSuccess', () => {
      const withBook = booksReducer(initialBooksState, BooksActions.loadBooksSuccess({
        books: [makeBook({ id: 'b1', collectionIds: ['c1', 'c2'] })],
      }));
      const updated = makeBook({ id: 'b1', collectionIds: ['c2'] });
      const state = booksReducer(withBook, BooksActions.unassignBookFromCollectionSuccess({ book: updated }));
      expect(state.entities['b1']?.collectionIds).toEqual(['c2']);
    });

    it('stores error on assignBookToCollectionFailure', () => {
      const state = booksReducer(initialBooksState, BooksActions.assignBookToCollectionFailure({ error: 'err' }));
      expect(state.error).toBe('err');
    });
  });

  describe('filter', () => {
    it('merges partial filter fields on setBooksFilter', () => {
      const state = booksReducer(initialBooksState, BooksActions.setBooksFilter({
        filter: { searchTerm: 'dune' },
      }));
      expect(state.filter.searchTerm).toBe('dune');
      expect(state.filter.genre).toBeNull();
      expect(state.filter.yearFrom).toBeNull();
    });

    it('overwrites a single field without touching others on setBooksFilter', () => {
      const withGenre = booksReducer(initialBooksState, BooksActions.setBooksFilter({
        filter: { genre: BookGenre.Classic },
      }));
      const state = booksReducer(withGenre, BooksActions.setBooksFilter({
        filter: { searchTerm: 'austen' },
      }));
      expect(state.filter.genre).toBe(BookGenre.Classic);
      expect(state.filter.searchTerm).toBe('austen');
    });

    it('resets all filter fields on clearBooksFilter', () => {
      const withFilter = booksReducer(initialBooksState, BooksActions.setBooksFilter({
        filter: { searchTerm: 'foo', genre: BookGenre.Thriller, yearFrom: 2000, yearTo: 2020, collectionId: 'c1' },
      }));
      const state = booksReducer(withFilter, BooksActions.clearBooksFilter());
      expect(state.filter).toEqual({
        searchTerm: '',
        genre: null,
        yearFrom: null,
        yearTo: null,
        collectionId: null,
      });
    });
  });

  describe('sort', () => {
    it('sets sort property and direction on setBooksSort', () => {
      const state = booksReducer(initialBooksState, BooksActions.setBooksSort({
        sort: { property: 'year', direction: 'desc' },
      }));
      expect(state.sort.property).toBe('year');
      expect(state.sort.direction).toBe('desc');
    });

    it('replaces the entire sort object', () => {
      const first = booksReducer(initialBooksState, BooksActions.setBooksSort({
        sort: { property: 'author', direction: 'asc' },
      }));
      const state = booksReducer(first, BooksActions.setBooksSort({
        sort: { property: 'createdAt', direction: 'desc' },
      }));
      expect(state.sort.property).toBe('createdAt');
    });
  });
});
