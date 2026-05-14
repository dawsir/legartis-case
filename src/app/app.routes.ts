import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'collections', pathMatch: 'full' },
  {
    path: 'collections',
    loadChildren: () =>
      import('./features/collections/collections.routes').then(m => m.COLLECTIONS_ROUTES),
  },
  {
    path: 'books',
    loadChildren: () =>
      import('./features/books/books.routes').then(m => m.BOOKS_ROUTES),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
