import { Book } from '../../../shared/models/book.model';
import { BookGenre } from '../../../shared/models/book-genre.enum';
import { BookCollection } from '../../../shared/models/book-collection.model';
import { CollectionViewModel } from '../../../shared/models/view-models';
import { CollectionsFilter, CollectionsSort } from '../../../shared/models/filters.model';
import {
  selectCollectionViewModels,
  selectFilteredAndSortedCollections,
  selectCollectionViewModelById,
  selectBookCollections,
  selectAvailableCollectionsForBook,
} from './collections.selectors';

function makeCollection(overrides: Partial<BookCollection> = {}): BookCollection {
  return {
    id: 'c1',
    name: 'A Collection',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'b1',
    title: 'A Book',
    author: 'An Author',
    genre: BookGenre.Classic,
    year: 2000,
    collectionIds: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

const defaultFilter: CollectionsFilter = { searchTerm: '' };
const defaultSort: CollectionsSort = { property: 'name', direction: 'asc' };

describe('selectCollectionViewModels projector', () => {
  const project = selectCollectionViewModels.projector;

  it('returns booksCount 0 for a collection with no books', () => {
    const collections = [makeCollection({ id: 'c1' })];
    const books: Book[] = [];
    const result = project(collections, books);
    expect(result[0].booksCount).toBe(0);
  });

  it('counts books that reference the collection id', () => {
    const collections = [makeCollection({ id: 'c1' })];
    const books = [
      makeBook({ id: 'b1', collectionIds: ['c1'] }),
      makeBook({ id: 'b2', collectionIds: ['c1', 'c2'] }),
      makeBook({ id: 'b3', collectionIds: ['c2'] }),
    ];
    const result = project(collections, books);
    expect(result[0].booksCount).toBe(2);
  });

  it('produces a view model for each collection', () => {
    const collections = [
      makeCollection({ id: 'c1', name: 'First' }),
      makeCollection({ id: 'c2', name: 'Second' }),
    ];
    const books = [
      makeBook({ id: 'b1', collectionIds: ['c1'] }),
      makeBook({ id: 'b2', collectionIds: ['c2'] }),
      makeBook({ id: 'b3', collectionIds: ['c2'] }),
    ];
    const result = project(collections, books);
    expect(result.find(c => c.id === 'c1')?.booksCount).toBe(1);
    expect(result.find(c => c.id === 'c2')?.booksCount).toBe(2);
  });

  it('preserves all collection fields in the view model', () => {
    const col = makeCollection({ id: 'c1', name: 'Sci-Fi', description: 'Space books' });
    const result = project([col], []);
    expect(result[0].name).toBe('Sci-Fi');
    expect(result[0].description).toBe('Space books');
  });

  it('returns empty array when there are no collections', () => {
    const result = project([], [makeBook()]);
    expect(result).toEqual([]);
  });
});

describe('selectFilteredAndSortedCollections projector', () => {
  const project = selectFilteredAndSortedCollections.projector;

  function makeViewModel(overrides: Partial<CollectionViewModel> = {}): CollectionViewModel {
    return { ...makeCollection(), booksCount: 0, ...overrides };
  }

  describe('search filter', () => {
    const collections = [
      makeViewModel({ id: 'c1', name: 'Science Fiction' }),
      makeViewModel({ id: 'c2', name: 'History', description: 'Past events' }),
      makeViewModel({ id: 'c3', name: 'Programming' }),
    ];

    it('returns all collections when searchTerm is empty', () => {
      const result = project(collections, defaultFilter, defaultSort);
      expect(result.length).toBe(3);
    });

    it('filters by name (case-insensitive)', () => {
      const result = project(collections, { searchTerm: 'prog' }, defaultSort);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('c3');
    });

    it('filters by description', () => {
      const result = project(collections, { searchTerm: 'past' }, defaultSort);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('c2');
    });

    it('returns empty array when no collection matches', () => {
      const result = project(collections, { searchTerm: 'xyz-nomatch' }, defaultSort);
      expect(result).toEqual([]);
    });
  });

  describe('sort', () => {
    const collections = [
      makeViewModel({ id: 'c1', name: 'Zebra', booksCount: 1, createdAt: '2024-03-01T00:00:00Z' }),
      makeViewModel({ id: 'c2', name: 'Apple', booksCount: 5, createdAt: '2024-01-01T00:00:00Z' }),
      makeViewModel({ id: 'c3', name: 'Mango', booksCount: 3, createdAt: '2024-02-01T00:00:00Z' }),
    ];

    it('sorts by name ascending', () => {
      const result = project(collections, defaultFilter, { property: 'name', direction: 'asc' });
      expect(result.map(c => c.name)).toEqual(['Apple', 'Mango', 'Zebra']);
    });

    it('sorts by name descending', () => {
      const result = project(collections, defaultFilter, { property: 'name', direction: 'desc' });
      expect(result.map(c => c.name)).toEqual(['Zebra', 'Mango', 'Apple']);
    });

    it('sorts by booksCount ascending (numeric)', () => {
      const result = project(collections, defaultFilter, { property: 'booksCount', direction: 'asc' });
      expect(result.map(c => c.booksCount)).toEqual([1, 3, 5]);
    });

    it('sorts by booksCount descending', () => {
      const result = project(collections, defaultFilter, { property: 'booksCount', direction: 'desc' });
      expect(result.map(c => c.booksCount)).toEqual([5, 3, 1]);
    });

    it('sorts by createdAt ascending', () => {
      const result = project(collections, defaultFilter, { property: 'createdAt', direction: 'asc' });
      expect(result[0].id).toBe('c2');
      expect(result[2].id).toBe('c1');
    });

    it('does not mutate the input array', () => {
      const input = [...collections];
      project(collections, defaultFilter, { property: 'booksCount', direction: 'desc' });
      expect(collections).toEqual(input);
    });
  });
});

describe('selectCollectionViewModelById projector', () => {
  it('returns the matching view model', () => {
    const collections: CollectionViewModel[] = [
      { ...makeCollection({ id: 'c1', name: 'First' }), booksCount: 2 },
      { ...makeCollection({ id: 'c2', name: 'Second' }), booksCount: 0 },
    ];
    const project = selectCollectionViewModelById('c1').projector;
    const result = project(collections);
    expect(result?.name).toBe('First');
    expect(result?.booksCount).toBe(2);
  });

  it('returns undefined when no match', () => {
    const collections: CollectionViewModel[] = [
      { ...makeCollection({ id: 'c1' }), booksCount: 0 },
    ];
    const project = selectCollectionViewModelById('missing').projector;
    expect(project(collections)).toBeUndefined();
  });
});

describe('selectBookCollections projector', () => {
  const collections = [
    makeCollection({ id: 'c1', name: 'Sci-Fi' }),
    makeCollection({ id: 'c2', name: 'Classics' }),
    makeCollection({ id: 'c3', name: 'Programming' }),
  ];

  const bookEntities: Record<string, Book> = {
    'b1': makeBook({ id: 'b1', collectionIds: ['c1', 'c3'] }),
    'b2': makeBook({ id: 'b2', collectionIds: ['c2'] }),
  };

  it('returns collections the book belongs to', () => {
    const project = selectBookCollections('b1').projector;
    const result = project(bookEntities, collections);
    expect(result.map(c => c.id)).toEqual(['c1', 'c3']);
  });

  it('returns empty array when book has no collections', () => {
    const entities = { 'b3': makeBook({ id: 'b3', collectionIds: [] }) };
    const project = selectBookCollections('b3').projector;
    expect(project(entities, collections)).toEqual([]);
  });

  it('returns empty array when book entity does not exist', () => {
    const project = selectBookCollections('nonexistent').projector;
    expect(project(bookEntities, collections)).toEqual([]);
  });
});

describe('selectAvailableCollectionsForBook projector', () => {
  const collections = [
    makeCollection({ id: 'c1', name: 'Sci-Fi' }),
    makeCollection({ id: 'c2', name: 'Classics' }),
    makeCollection({ id: 'c3', name: 'Programming' }),
  ];

  const bookEntities: Record<string, Book> = {
    'b1': makeBook({ id: 'b1', collectionIds: ['c1', 'c3'] }),
    'b2': makeBook({ id: 'b2', collectionIds: [] }),
  };

  it('returns collections the book does NOT belong to', () => {
    const project = selectAvailableCollectionsForBook('b1').projector;
    const result = project(bookEntities, collections);
    expect(result.map(c => c.id)).toEqual(['c2']);
  });

  it('returns all collections when book has no assigned collections', () => {
    const project = selectAvailableCollectionsForBook('b2').projector;
    const result = project(bookEntities, collections);
    expect(result.length).toBe(3);
  });

  it('returns all collections when book entity does not exist', () => {
    const project = selectAvailableCollectionsForBook('nonexistent').projector;
    const result = project(bookEntities, collections);
    expect(result).toEqual(collections);
  });
});
