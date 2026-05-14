import { BookCollection } from '../../../shared/models/book-collection.model';
import { CollectionsActions } from './collections.actions';
import { collectionsReducer, initialCollectionsState } from './collections.reducer';

function makeCollection(overrides: Partial<BookCollection> = {}): BookCollection {
  return {
    id: 'c1',
    name: 'Test Collection',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('collectionsReducer', () => {
  describe('initial state', () => {
    it('returns initial state for unknown action', () => {
      const state = collectionsReducer(undefined, { type: '__unknown__' } as never);
      expect(state).toEqual(initialCollectionsState);
    });

    it('has loading false and no error by default', () => {
      expect(initialCollectionsState.loading).toBe(false);
      expect(initialCollectionsState.error).toBeNull();
    });
  });

  describe('load collections', () => {
    it('sets loading true on loadCollections', () => {
      const state = collectionsReducer(initialCollectionsState, CollectionsActions.loadCollections());
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('populates entities on loadCollectionsSuccess', () => {
      const collections = [
        makeCollection({ id: 'c1' }),
        makeCollection({ id: 'c2', name: 'Second' }),
      ];
      const state = collectionsReducer(
        initialCollectionsState,
        CollectionsActions.loadCollectionsSuccess({ collections }),
      );
      expect(state.loading).toBe(false);
      expect(state.ids).toEqual(['c1', 'c2']);
      expect(state.entities['c1']).toEqual(collections[0]);
    });

    it('replaces all entities on loadCollectionsSuccess', () => {
      const first = collectionsReducer(initialCollectionsState,
        CollectionsActions.loadCollectionsSuccess({ collections: [makeCollection({ id: 'old' })] }),
      );
      const state = collectionsReducer(first,
        CollectionsActions.loadCollectionsSuccess({ collections: [makeCollection({ id: 'new' })] }),
      );
      expect(state.ids).toEqual(['new']);
      expect(state.entities['old']).toBeUndefined();
    });

    it('sets error on loadCollectionsFailure', () => {
      const state = collectionsReducer(
        initialCollectionsState,
        CollectionsActions.loadCollectionsFailure({ error: 'API down' }),
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('API down');
    });
  });

  describe('load single collection', () => {
    it('sets loading on loadCollection', () => {
      const state = collectionsReducer(initialCollectionsState, CollectionsActions.loadCollection({ id: 'c1' }));
      expect(state.loading).toBe(true);
    });

    it('upserts entity on loadCollectionSuccess', () => {
      const collection = makeCollection({ id: 'c1', name: 'Fetched' });
      const state = collectionsReducer(initialCollectionsState,
        CollectionsActions.loadCollectionSuccess({ collection }),
      );
      expect(state.entities['c1']?.name).toBe('Fetched');
      expect(state.loading).toBe(false);
    });
  });

  describe('create collection', () => {
    it('adds entity on createCollectionSuccess', () => {
      const collection = makeCollection({ id: 'new-id', name: 'My List' });
      const state = collectionsReducer(initialCollectionsState,
        CollectionsActions.createCollectionSuccess({ collection }),
      );
      expect(state.ids).toContain('new-id');
      expect(state.entities['new-id']?.name).toBe('My List');
      expect(state.loading).toBe(false);
    });

    it('sets error on createCollectionFailure', () => {
      const state = collectionsReducer(initialCollectionsState,
        CollectionsActions.createCollectionFailure({ error: 'Conflict' }),
      );
      expect(state.error).toBe('Conflict');
    });
  });

  describe('update collection', () => {
    it('upserts entity with updated name on updateCollectionSuccess', () => {
      const existing = makeCollection({ id: 'c1', name: 'Old' });
      const withItem = collectionsReducer(initialCollectionsState,
        CollectionsActions.loadCollectionsSuccess({ collections: [existing] }),
      );
      const updated = makeCollection({ id: 'c1', name: 'Updated' });
      const state = collectionsReducer(withItem, CollectionsActions.updateCollectionSuccess({ collection: updated }));
      expect(state.entities['c1']?.name).toBe('Updated');
    });
  });

  describe('delete collection', () => {
    it('removes entity by id on deleteCollectionSuccess', () => {
      const withItems = collectionsReducer(initialCollectionsState,
        CollectionsActions.loadCollectionsSuccess({
          collections: [makeCollection({ id: 'c1' }), makeCollection({ id: 'c2' })],
        }),
      );
      const state = collectionsReducer(withItems, CollectionsActions.deleteCollectionSuccess({ id: 'c1' }));
      expect(state.ids).not.toContain('c1');
      expect(state.ids).toContain('c2');
      expect(state.loading).toBe(false);
    });

    it('sets error on deleteCollectionFailure', () => {
      const state = collectionsReducer(initialCollectionsState,
        CollectionsActions.deleteCollectionFailure({ error: 'Not found' }),
      );
      expect(state.error).toBe('Not found');
    });
  });

  describe('filter', () => {
    it('merges search term on setCollectionsFilter', () => {
      const state = collectionsReducer(initialCollectionsState,
        CollectionsActions.setCollectionsFilter({ filter: { searchTerm: 'sci-fi' } }),
      );
      expect(state.filter.searchTerm).toBe('sci-fi');
    });

    it('resets filter on clearCollectionsFilter', () => {
      const withFilter = collectionsReducer(initialCollectionsState,
        CollectionsActions.setCollectionsFilter({ filter: { searchTerm: 'history' } }),
      );
      const state = collectionsReducer(withFilter, CollectionsActions.clearCollectionsFilter());
      expect(state.filter.searchTerm).toBe('');
    });
  });

  describe('sort', () => {
    it('updates sort property and direction on setCollectionsSort', () => {
      const state = collectionsReducer(initialCollectionsState,
        CollectionsActions.setCollectionsSort({ sort: { property: 'createdAt', direction: 'desc' } }),
      );
      expect(state.sort.property).toBe('createdAt');
      expect(state.sort.direction).toBe('desc');
    });

    it('replaces the entire sort when called again', () => {
      const first = collectionsReducer(initialCollectionsState,
        CollectionsActions.setCollectionsSort({ sort: { property: 'name', direction: 'asc' } }),
      );
      const state = collectionsReducer(first,
        CollectionsActions.setCollectionsSort({ sort: { property: 'booksCount', direction: 'desc' } }),
      );
      expect(state.sort.property).toBe('booksCount');
      expect(state.sort.direction).toBe('desc');
    });
  });
});
