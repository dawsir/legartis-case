import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { EMPTY, race } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs';
import { BookCollection } from '../../../shared/models/book-collection.model';
import { CollectionsFacade } from '../state/collections.facade';
import { CollectionsActions } from '../state/collections.actions';

export const collectionResolver: ResolveFn<BookCollection> = (route) => {
  const facade = inject(CollectionsFacade);
  const actions$ = inject(Actions);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  facade.loadOne(id);

  return race(
    actions$.pipe(
      ofType(CollectionsActions.loadCollectionSuccess),
      filter(({ collection }) => collection.id === id),
      map(({ collection }) => collection),
    ),
    actions$.pipe(
      ofType(CollectionsActions.loadCollectionFailure),
      switchMap(() => {
        router.navigate(['/collections']);
        return EMPTY;
      }),
    ),
  ).pipe(take(1));
};
