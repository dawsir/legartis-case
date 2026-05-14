import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BooksFilter, BooksSort } from '../../../shared/models/filters.model';
import { CreateBookPayload, UpdateBookPayload } from '../../../shared/models/book.model';
import { BooksActions } from './books.actions';
import {
  selectAllBooks,
  selectAvailableBooksForCollection,
  selectBookById,
  selectBooksError,
  selectBooksFilter,
  selectBooksForCollection,
  selectBooksLoading,
  selectBooksSort,
  selectFilteredAndSortedBooks,
} from './books.selectors';

@Injectable({ providedIn: 'root' })
export class BooksFacade {
  private readonly store = inject(Store);

  readonly books$ = this.store.select(selectFilteredAndSortedBooks);
  readonly allBooks$ = this.store.select(selectAllBooks);
  readonly loading$ = this.store.select(selectBooksLoading);
  readonly error$ = this.store.select(selectBooksError);
  readonly filter$ = this.store.select(selectBooksFilter);
  readonly sort$ = this.store.select(selectBooksSort);

  getById(id: string) {
    return this.store.select(selectBookById(id));
  }

  getBooksForCollection(collectionId: string) {
    return this.store.select(selectBooksForCollection(collectionId));
  }

  getAvailableForCollection(collectionId: string) {
    return this.store.select(selectAvailableBooksForCollection(collectionId));
  }

  loadAll(): void {
    this.store.dispatch(BooksActions.loadBooks());
  }

  loadOne(id: string): void {
    this.store.dispatch(BooksActions.loadBook({ id }));
  }

  create(payload: CreateBookPayload): void {
    this.store.dispatch(BooksActions.createBook({ payload }));
  }

  update(payload: UpdateBookPayload): void {
    this.store.dispatch(BooksActions.updateBook({ payload }));
  }

  delete(id: string): void {
    this.store.dispatch(BooksActions.deleteBook({ id }));
  }

  assignToCollection(bookId: string, collectionId: string): void {
    this.store.dispatch(BooksActions.assignBookToCollection({ bookId, collectionId }));
  }

  unassignFromCollection(bookId: string, collectionId: string): void {
    this.store.dispatch(BooksActions.unassignBookFromCollection({ bookId, collectionId }));
  }

  setFilter(filter: Partial<BooksFilter>): void {
    this.store.dispatch(BooksActions.setBooksFilter({ filter }));
  }

  clearFilter(): void {
    this.store.dispatch(BooksActions.clearBooksFilter());
  }

  setSort(sort: BooksSort): void {
    this.store.dispatch(BooksActions.setBooksSort({ sort }));
  }
}
