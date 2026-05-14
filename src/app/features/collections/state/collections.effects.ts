import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { BooksApiService } from '../../../core/services/books-api.service';
import { CollectionsApiService } from '../../../core/services/collections-api.service';
import { BooksEffects } from '../../books/state/books.effects';
import { selectAllBooks } from '../../books/state/books.selectors';
import { CollectionsActions } from './collections.actions';

@Injectable()
export class CollectionsEffects {
  private readonly actions$ = inject(Actions);
  private readonly collectionsApiService = inject(CollectionsApiService);
  private readonly booksApiService = inject(BooksApiService);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  loadCollections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionsActions.loadCollections),
      switchMap(() =>
        this.collectionsApiService.getAll().pipe(
          map((collections) => CollectionsActions.loadCollectionsSuccess({ collections })),
          catchError((err) =>
            of(CollectionsActions.loadCollectionsFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  loadCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionsActions.loadCollection),
      switchMap(({ id }) =>
        this.collectionsApiService.getById(id).pipe(
          map((collection) => CollectionsActions.loadCollectionSuccess({ collection })),
          catchError((err) => of(CollectionsActions.loadCollectionFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  createCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionsActions.createCollection),
      switchMap(({ payload }) =>
        this.collectionsApiService.create(payload).pipe(
          tap((collection) => this.router.navigate(['/collections', collection.id])),
          map((collection) => CollectionsActions.createCollectionSuccess({ collection })),
          catchError((err) =>
            of(CollectionsActions.createCollectionFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  updateCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionsActions.updateCollection),
      switchMap(({ payload }) =>
        this.collectionsApiService.update(payload).pipe(
          tap((collection) => this.router.navigate(['/collections', collection.id])),
          map((collection) => CollectionsActions.updateCollectionSuccess({ collection })),
          catchError((err) =>
            of(CollectionsActions.updateCollectionFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  deleteCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionsActions.deleteCollection),
      withLatestFrom(this.store.select(selectAllBooks)),
      switchMap(([{ id }, books]) => {
        const bulkUpdate$ = BooksEffects.buildBulkUpdate(this.booksApiService, books, id);
        const deleteSource$ =
          bulkUpdate$ === EMPTY
            ? this.collectionsApiService.delete(id)
            : bulkUpdate$.pipe(switchMap(() => this.collectionsApiService.delete(id)));

        return deleteSource$.pipe(
          tap(() => this.router.navigate(['/collections'])),
          map(() => CollectionsActions.deleteCollectionSuccess({ id })),
          catchError((err) =>
            of(CollectionsActions.deleteCollectionFailure({ error: err.message })),
          ),
        );
      }),
    ),
  );
}
