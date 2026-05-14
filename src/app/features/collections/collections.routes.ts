import { Routes } from '@angular/router';
import { collectionResolver } from './resolvers/collection.resolver';

export const COLLECTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/collections-list/collections-list.component').then(
        m => m.CollectionsListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/collection-create/collection-create.component').then(
        m => m.CollectionCreateComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/collection-detail/collection-detail.component').then(
        m => m.CollectionDetailComponent,
      ),
    resolve: { collection: collectionResolver },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/collection-edit/collection-edit.component').then(
        m => m.CollectionEditComponent,
      ),
    resolve: { collection: collectionResolver },
  },
];
