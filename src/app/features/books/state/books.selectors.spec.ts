import { Book } from '../../../shared/models/book.model';
import { BookGenre } from '../../../shared/models/book-genre.enum';
import { BooksFilter, BooksSort } from '../../../shared/models/filters.model';
import {
  selectFilteredAndSortedBooks,
  selectBooksForCollection,
  selectAvailableBooksForCollection,
} from './books.selectors';

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

const defaultFilter: BooksFilter = {
  searchTerm: '',
  genre: null,
  yearFrom: null,
  yearTo: null,
  collectionId: null,
};

const defaultSort: BooksSort = { property: 'title', direction: 'asc' };

describe('selectFilteredAndSortedBooks projector', () => {
  const project = selectFilteredAndSortedBooks.projector;

  describe('no filter active', () => {
    it('returns all books when no filter is set', () => {
      const books = [makeBook({ id: 'b1' }), makeBook({ id: 'b2' })];
      const result = project(books, defaultFilter, defaultSort);
      expect(result.length).toBe(2);
    });

    it('sorts by title ascending by default', () => {
      const books = [
        makeBook({ id: 'b1', title: 'Zebra' }),
        makeBook({ id: 'b2', title: 'Apple' }),
      ];
      const result = project(books, defaultFilter, defaultSort);
      expect(result[0].title).toBe('Apple');
      expect(result[1].title).toBe('Zebra');
    });

    it('sorts by title descending', () => {
      const books = [
        makeBook({ id: 'b1', title: 'Apple' }),
        makeBook({ id: 'b2', title: 'Zebra' }),
      ];
      const result = project(books, defaultFilter, { property: 'title', direction: 'desc' });
      expect(result[0].title).toBe('Zebra');
    });
  });

  describe('searchTerm filter', () => {
    const books = [
      makeBook({ id: 'b1', title: 'Dune', author: 'Frank Herbert', genre: BookGenre.ScienceFiction }),
      makeBook({ id: 'b2', title: 'Foundation', author: 'Isaac Asimov', genre: BookGenre.ScienceFiction }),
      makeBook({ id: 'b3', title: 'Hamlet', author: 'William Shakespeare', genre: BookGenre.Classic }),
    ];

    it('filters by title (case-insensitive)', () => {
      const result = project(books, { ...defaultFilter, searchTerm: 'dun' }, defaultSort);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('b1');
    });

    it('filters by author', () => {
      const result = project(books, { ...defaultFilter, searchTerm: 'asimov' }, defaultSort);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('b2');
    });

    it('filters by genre text', () => {
      const result = project(books, { ...defaultFilter, searchTerm: 'classic' }, defaultSort);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('b3');
    });

    it('returns empty array when nothing matches', () => {
      const result = project(books, { ...defaultFilter, searchTerm: 'xyz-nomatch' }, defaultSort);
      expect(result.length).toBe(0);
    });
  });

  describe('genre filter', () => {
    const books = [
      makeBook({ id: 'b1', genre: BookGenre.Classic }),
      makeBook({ id: 'b2', genre: BookGenre.ScienceFiction }),
      makeBook({ id: 'b3', genre: BookGenre.ScienceFiction }),
    ];

    it('keeps only books matching the genre', () => {
      const result = project(books, { ...defaultFilter, genre: BookGenre.ScienceFiction }, defaultSort);
      expect(result.length).toBe(2);
      result.forEach(b => expect(b.genre).toBe(BookGenre.ScienceFiction));
    });

    it('returns all when genre filter is null', () => {
      const result = project(books, defaultFilter, defaultSort);
      expect(result.length).toBe(3);
    });
  });

  describe('year range filter', () => {
    const books = [
      makeBook({ id: 'b1', year: 1900 }),
      makeBook({ id: 'b2', year: 1950 }),
      makeBook({ id: 'b3', year: 2000 }),
    ];

    it('filters out books before yearFrom', () => {
      const result = project(books, { ...defaultFilter, yearFrom: 1950 }, defaultSort);
      expect(result.map(b => b.id)).toEqual(['b2', 'b3']);
    });

    it('filters out books after yearTo', () => {
      const result = project(books, { ...defaultFilter, yearTo: 1950 }, defaultSort);
      expect(result.map(b => b.id)).toEqual(['b1', 'b2']);
    });

    it('applies both yearFrom and yearTo as an inclusive range', () => {
      const result = project(books, { ...defaultFilter, yearFrom: 1950, yearTo: 1950 }, defaultSort);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('b2');
    });
  });

  describe('collectionId filter', () => {
    const books = [
      makeBook({ id: 'b1', collectionIds: ['c1', 'c2'] }),
      makeBook({ id: 'b2', collectionIds: ['c2'] }),
      makeBook({ id: 'b3', collectionIds: [] }),
    ];

    it('returns only books that belong to the given collection', () => {
      const result = project(books, { ...defaultFilter, collectionId: 'c1' }, defaultSort);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('b1');
    });

    it('handles a collection that contains multiple books', () => {
      const result = project(books, { ...defaultFilter, collectionId: 'c2' }, defaultSort);
      expect(result.length).toBe(2);
    });
  });

  describe('sort', () => {
    const books = [
      makeBook({ id: 'b1', title: 'C', author: 'Z', year: 2000 }),
      makeBook({ id: 'b2', title: 'A', author: 'M', year: 1990 }),
      makeBook({ id: 'b3', title: 'B', author: 'A', year: 2010 }),
    ];

    it('sorts by author ascending', () => {
      const result = project(books, defaultFilter, { property: 'author', direction: 'asc' });
      expect(result.map(b => b.author)).toEqual(['A', 'M', 'Z']);
    });

    it('sorts by year descending', () => {
      const result = project(books, defaultFilter, { property: 'year', direction: 'desc' });
      expect(result.map(b => b.year)).toEqual([2010, 2000, 1990]);
    });

    it('does not mutate the input array', () => {
      const input = [...books];
      project(books, defaultFilter, { property: 'year', direction: 'desc' });
      expect(books).toEqual(input);
    });
  });

  describe('combined filters', () => {
    it('applies search and genre filters together', () => {
      const books = [
        makeBook({ id: 'b1', title: 'Dune', genre: BookGenre.ScienceFiction }),
        makeBook({ id: 'b2', title: 'Foundation', genre: BookGenre.ScienceFiction }),
        makeBook({ id: 'b3', title: 'Hamlet', genre: BookGenre.Classic }),
      ];
      const result = project(
        books,
        { ...defaultFilter, searchTerm: 'foundation', genre: BookGenre.ScienceFiction },
        defaultSort,
      );
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('b2');
    });
  });
});

describe('selectBooksForCollection projector', () => {
  const books = [
    makeBook({ id: 'b1', collectionIds: ['c1'] }),
    makeBook({ id: 'b2', collectionIds: ['c1', 'c2'] }),
    makeBook({ id: 'b3', collectionIds: ['c2'] }),
    makeBook({ id: 'b4', collectionIds: [] }),
  ];

  it('returns books that belong to the given collection', () => {
    const project = selectBooksForCollection('c1').projector;
    const result = project(books);
    expect(result.map(b => b.id)).toEqual(['b1', 'b2']);
  });

  it('returns empty when no books belong to the collection', () => {
    const project = selectBooksForCollection('c-empty').projector;
    const result = project(books);
    expect(result).toEqual([]);
  });
});

describe('selectAvailableBooksForCollection projector', () => {
  const books = [
    makeBook({ id: 'b1', collectionIds: ['c1'] }),
    makeBook({ id: 'b2', collectionIds: ['c1', 'c2'] }),
    makeBook({ id: 'b3', collectionIds: ['c2'] }),
    makeBook({ id: 'b4', collectionIds: [] }),
  ];

  it('returns books NOT in the given collection', () => {
    const project = selectAvailableBooksForCollection('c1').projector;
    const result = project(books);
    expect(result.map(b => b.id)).toEqual(['b3', 'b4']);
  });

  it('returns all books when collection has no members', () => {
    const project = selectAvailableBooksForCollection('c-empty').projector;
    const result = project(books);
    expect(result.length).toBe(4);
  });
});
