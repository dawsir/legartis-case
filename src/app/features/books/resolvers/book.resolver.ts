import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { EMPTY, race } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs';
import { Book } from '../../../shared/models/book.model';
import { BooksFacade } from '../state/books.facade';
import { BooksActions } from '../state/books.actions';

export const bookResolver: ResolveFn<Book> = (route) => {
  const facade = inject(BooksFacade);
  const actions$ = inject(Actions);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  facade.loadOne(id);

  return race(
    actions$.pipe(
      ofType(BooksActions.loadBookSuccess),
      filter(({ book }) => book.id === id),
      map(({ book }) => book),
    ),
    actions$.pipe(
      ofType(BooksActions.loadBookFailure),
      switchMap(() => {
        router.navigate(['/books']);
        return EMPTY;
      }),
    ),
  ).pipe(take(1));
};
