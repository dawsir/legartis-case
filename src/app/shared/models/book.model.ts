import { BookGenre } from './book-genre.enum';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: BookGenre;
  year: number;
  isbn?: string;
  description?: string;
  collectionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookPayload {
  title: string;
  author: string;
  genre: BookGenre;
  year: number;
  isbn?: string;
  description?: string;
  collectionIds: string[];
}

export interface UpdateBookPayload extends CreateBookPayload {
  id: string;
}
