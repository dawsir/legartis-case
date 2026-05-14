import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CollectionViewModel } from '../../../shared/models/view-models';
import { selectAllBooks } from '../../books/state/books.selectors';
import { CollectionsState, selectAll, selectEntities } from './collections.reducer';

export const selectCollectionsState = createFeatureSelector<CollectionsState>('collections');

export const selectAllCollections = createSelector(selectCollectionsState, selectAll);
export const selectCollectionEntities = createSelector(selectCollectionsState, selectEntities);
export const selectCollectionsLoading = createSelector(selectCollectionsState, s => s.loading);
export const selectCollectionsError = createSelector(selectCollectionsState, s => s.error);
export const selectCollectionsFilter = createSelector(selectCollectionsState, s => s.filter);
export const selectCollectionsSort = createSelector(selectCollectionsState, s => s.sort);

export const selectCollectionById = (id: string) =>
  createSelector(selectCollectionEntities, entities => entities[id]);

export const selectCollectionViewModels = createSelector(
  selectAllCollections,
  selectAllBooks,
  (collections, books): CollectionViewModel[] =>
    collections.map(c => ({
      ...c,
      booksCount: books.filter(b => b.collectionIds.includes(c.id)).length,
    })),
);

export const selectFilteredAndSortedCollections = createSelector(
  selectCollectionViewModels,
  selectCollectionsFilter,
  selectCollectionsSort,
  (collections, filter, sort) => {
    let result = [...collections];

    if (filter.searchTerm) {
      const q = filter.searchTerm.toLowerCase();
      result = result.filter(
        c => c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q),
      );
    }

    return [...result].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      if (sort.property === 'booksCount') {
        return (a.booksCount - b.booksCount) * dir;
      }
      const aVal = a[sort.property] ?? '';
      const bVal = b[sort.property] ?? '';
      if (aVal < bVal) return -dir;
      if (aVal > bVal) return dir;
      return 0;
    });
  },
);

export const selectCollectionViewModelById = (id: string) =>
  createSelector(selectCollectionViewModels, collections => collections.find(c => c.id === id));
