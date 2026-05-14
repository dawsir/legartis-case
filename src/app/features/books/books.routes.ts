import { Routes } from '@angular/router';
import { bookResolver } from './resolvers/book.resolver';

export const BOOKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/books-list/books-list.component').then(m => m.BooksListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/book-create/book-create.component').then(m => m.BookCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/book-detail/book-detail.component').then(m => m.BookDetailComponent),
    resolve: { book: bookResolver },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/book-edit/book-edit.component').then(m => m.BookEditComponent),
    resolve: { book: bookResolver },
  },
];
