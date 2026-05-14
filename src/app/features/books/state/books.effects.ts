import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, forkJoin, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { BooksApiService } from '../../../core/services/books-api.service';
import { Book, UpdateBookPayload } from '../../../shared/models/book.model';
import { BooksActions } from './books.actions';
import { selectBookEntities } from './books.selectors';

@Injectable()
export class BooksEffects {
  private readonly actions$ = inject(Actions);
  private readonly booksApiService = inject(BooksApiService);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  loadBooks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.loadBooks),
      switchMap(() =>
        this.booksApiService.getAll().pipe(
          map((books) => BooksActions.loadBooksSuccess({ books })),
          catchError((err) => of(BooksActions.loadBooksFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  loadBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.loadBook),
      switchMap(({ id }) =>
        this.booksApiService.getById(id).pipe(
          map((book) => BooksActions.loadBookSuccess({ book })),
          catchError((err) => of(BooksActions.loadBookFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  createBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.createBook),
      switchMap(({ payload }) =>
        this.booksApiService.create(payload).pipe(
          tap((book) => this.router.navigate(['/books', book.id])),
          map((book) => BooksActions.createBookSuccess({ book })),
          catchError((err) => of(BooksActions.createBookFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  updateBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.updateBook),
      switchMap(({ payload }) =>
        this.booksApiService.update(payload).pipe(
          tap((book) => this.router.navigate(['/books', book.id])),
          map((book) => BooksActions.updateBookSuccess({ book })),
          catchError((err) => of(BooksActions.updateBookFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  deleteBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.deleteBook),
      switchMap(({ id }) =>
        this.booksApiService.delete(id).pipe(
          tap(() => this.router.navigate(['/books'])),
          map(() => BooksActions.deleteBookSuccess({ id })),
          catchError((err) => of(BooksActions.deleteBookFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  assignBookToCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.assignBookToCollection),
      withLatestFrom(this.store.select(selectBookEntities)),
      switchMap(([{ bookId, collectionId }, entities]) => {
        const book = entities[bookId];
        if (!book || book.collectionIds.includes(collectionId)) return EMPTY;
        return this.booksApiService
          .update(
            this.toUpdatePayload(book, { collectionIds: [...book.collectionIds, collectionId] }),
          )
          .pipe(
            map((updated) => BooksActions.assignBookToCollectionSuccess({ book: updated })),
            catchError((err) =>
              of(BooksActions.assignBookToCollectionFailure({ error: err.message })),
            ),
          );
      }),
    ),
  );

  unassignBookFromCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.unassignBookFromCollection),
      withLatestFrom(this.store.select(selectBookEntities)),
      switchMap(([{ bookId, collectionId }, entities]) => {
        const book = entities[bookId];
        if (!book) return EMPTY;
        return this.booksApiService
          .update(
            this.toUpdatePayload(book, {
              collectionIds: book.collectionIds.filter((id) => id !== collectionId),
            }),
          )
          .pipe(
            map((updated) => BooksActions.unassignBookFromCollectionSuccess({ book: updated })),
            catchError((err) =>
              of(BooksActions.unassignBookFromCollectionFailure({ error: err.message })),
            ),
          );
      }),
    ),
  );

  // Called by CollectionsEffects after a collection is deleted to keep books consistent.
  // Not triggered from UI directly; exported so collections effects can dispatch without an action round-trip.
  static toUpdatePayload(
    book: Book,
    overrides: Partial<UpdateBookPayload> = {},
  ): UpdateBookPayload {
    const { id, title, author, genre, year, isbn, description, collectionIds } = book;
    return { id, title, author, genre, year, isbn, description, collectionIds, ...overrides };
  }

  private toUpdatePayload(
    book: Book,
    overrides: Partial<UpdateBookPayload> = {},
  ): UpdateBookPayload {
    return BooksEffects.toUpdatePayload(book, overrides);
  }

  // Called by CollectionsEffects — updates multiple books after a collection is deleted
  static buildBulkUpdate(api: BooksApiService, books: Book[], deletedCollectionId: string) {
    const affected = books.filter((b) => b.collectionIds.includes(deletedCollectionId));
    if (!affected.length) return EMPTY;
    return forkJoin(
      affected.map((book) =>
        api.update(
          BooksEffects.toUpdatePayload(book, {
            collectionIds: book.collectionIds.filter((id) => id !== deletedCollectionId),
          }),
        ),
      ),
    );
  }
}
