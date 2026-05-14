import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { BookCollection } from '../../../shared/models/book-collection.model';
import { CollectionsFilter, CollectionsSort } from '../../../shared/models/filters.model';
import { CollectionsActions } from './collections.actions';

export interface CollectionsState extends EntityState<BookCollection> {
  loading: boolean;
  error: string | null;
  filter: CollectionsFilter;
  sort: CollectionsSort;
}

export const adapter: EntityAdapter<BookCollection> = createEntityAdapter<BookCollection>();

const initialFilter: CollectionsFilter = {
  searchTerm: '',
};

const initialSort: CollectionsSort = {
  property: 'name',
  direction: 'asc',
};

export const initialCollectionsState: CollectionsState = adapter.getInitialState({
  loading: false,
  error: null,
  filter: initialFilter,
  sort: initialSort,
});

export const collectionsReducer = createReducer(
  initialCollectionsState,

  on(CollectionsActions.loadCollections, state => ({ ...state, loading: true, error: null })),
  on(CollectionsActions.loadCollectionsSuccess, (state, { collections }) =>
    adapter.setAll(collections, { ...state, loading: false, error: null }),
  ),
  on(CollectionsActions.loadCollectionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CollectionsActions.loadCollection, state => ({ ...state, loading: true, error: null })),
  on(CollectionsActions.loadCollectionSuccess, (state, { collection }) =>
    adapter.upsertOne(collection, { ...state, loading: false }),
  ),
  on(CollectionsActions.loadCollectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CollectionsActions.createCollection, state => ({ ...state, loading: true, error: null })),
  on(CollectionsActions.createCollectionSuccess, (state, { collection }) =>
    adapter.addOne(collection, { ...state, loading: false }),
  ),
  on(CollectionsActions.createCollectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CollectionsActions.updateCollection, state => ({ ...state, loading: true, error: null })),
  on(CollectionsActions.updateCollectionSuccess, (state, { collection }) =>
    adapter.upsertOne(collection, { ...state, loading: false }),
  ),
  on(CollectionsActions.updateCollectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CollectionsActions.deleteCollection, state => ({ ...state, loading: true, error: null })),
  on(CollectionsActions.deleteCollectionSuccess, (state, { id }) =>
    adapter.removeOne(id, { ...state, loading: false }),
  ),
  on(CollectionsActions.deleteCollectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CollectionsActions.setCollectionsFilter, (state, { filter }) => ({
    ...state,
    filter: { ...state.filter, ...filter },
  })),
  on(CollectionsActions.clearCollectionsFilter, state => ({
    ...state,
    filter: initialFilter,
  })),
  on(CollectionsActions.setCollectionsSort, (state, { sort }) => ({ ...state, sort })),
);

export const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors();
