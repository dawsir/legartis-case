import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BooksState, selectAll, selectEntities } from './books.reducer';

export const selectBooksState = createFeatureSelector<BooksState>('books');

export const selectAllBooks = createSelector(selectBooksState, selectAll);
export const selectBookEntities = createSelector(selectBooksState, selectEntities);
export const selectBooksLoading = createSelector(selectBooksState, s => s.loading);
export const selectBooksError = createSelector(selectBooksState, s => s.error);
export const selectBooksFilter = createSelector(selectBooksState, s => s.filter);
export const selectBooksSort = createSelector(selectBooksState, s => s.sort);

export const selectBookById = (id: string) =>
  createSelector(selectBookEntities, entities => entities[id]);

export const selectFilteredAndSortedBooks = createSelector(
  selectAllBooks,
  selectBooksFilter,
  selectBooksSort,
  (books, filter, sort) => {
    let result = [...books];

    if (filter.searchTerm) {
      const q = filter.searchTerm.toLowerCase();
      result = result.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q),
      );
    }

    if (filter.genre !== null) {
      result = result.filter(b => b.genre === filter.genre);
    }

    if (filter.yearFrom !== null) {
      result = result.filter(b => b.year >= filter.yearFrom!);
    }

    if (filter.yearTo !== null) {
      result = result.filter(b => b.year <= filter.yearTo!);
    }

    if (filter.collectionId !== null) {
      result = result.filter(b => b.collectionIds.includes(filter.collectionId!));
    }

    return [...result].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      const aVal = a[sort.property] ?? '';
      const bVal = b[sort.property] ?? '';
      if (aVal < bVal) return -dir;
      if (aVal > bVal) return dir;
      return 0;
    });
  },
);

export const selectBooksForCollection = (collectionId: string) =>
  createSelector(selectAllBooks, books =>
    books.filter(b => b.collectionIds.includes(collectionId)),
  );

export const selectAvailableBooksForCollection = (collectionId: string) =>
  createSelector(selectAllBooks, books =>
    books.filter(b => !b.collectionIds.includes(collectionId)),
  );
