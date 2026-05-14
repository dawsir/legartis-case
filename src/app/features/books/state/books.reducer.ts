import { createReducer } from '@ngrx/store';
import { Book } from '../../../shared/models/book.model';

export interface BooksState {
  ids: string[];
  entities: Record<string, Book>;
  loading: boolean;
  error: string | null;
}

export const initialBooksState: BooksState = {
  ids: [],
  entities: {},
  loading: false,
  error: null,
};

export const booksReducer = createReducer(initialBooksState);
