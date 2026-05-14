import { BookGenre } from './book-genre.enum';

export interface BooksFilter {
  searchTerm: string;
  genre: BookGenre | null;
  yearFrom: number | null;
  yearTo: number | null;
  collectionId: string | null;
}

export interface CollectionsFilter {
  searchTerm: string;
}

export type SortDirection = 'asc' | 'desc';

export interface BooksSort {
  property: 'title' | 'author' | 'genre' | 'year' | 'createdAt';
  direction: SortDirection;
}

export interface CollectionsSort {
  property: 'name' | 'createdAt' | 'booksCount';
  direction: SortDirection;
}
