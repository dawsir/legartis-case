import { Book } from './book.model';
import { BookCollection } from './book-collection.model';

export interface CollectionViewModel extends BookCollection {
  booksCount: number;
}

export interface BookViewModel extends Book {
  collectionNames: string[];
}

export interface FilterState {
  query: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}
