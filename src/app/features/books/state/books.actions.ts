import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Book, CreateBookPayload, UpdateBookPayload } from '../../../shared/models/book.model';
import { BooksFilter, BooksSort } from '../../../shared/models/filters.model';

export const BooksActions = createActionGroup({
  source: 'Books',
  events: {
    'Load Books': emptyProps(),
    'Load Books Success': props<{ books: Book[] }>(),
    'Load Books Failure': props<{ error: string }>(),

    'Load Book': props<{ id: string }>(),
    'Load Book Success': props<{ book: Book }>(),
    'Load Book Failure': props<{ error: string }>(),

    'Create Book': props<{ payload: CreateBookPayload }>(),
    'Create Book Success': props<{ book: Book }>(),
    'Create Book Failure': props<{ error: string }>(),

    'Update Book': props<{ payload: UpdateBookPayload }>(),
    'Update Book Success': props<{ book: Book }>(),
    'Update Book Failure': props<{ error: string }>(),

    'Delete Book': props<{ id: string }>(),
    'Delete Book Success': props<{ id: string }>(),
    'Delete Book Failure': props<{ error: string }>(),

    'Assign Book To Collection': props<{ bookId: string; collectionId: string }>(),
    'Assign Book To Collection Success': props<{ book: Book }>(),
    'Assign Book To Collection Failure': props<{ error: string }>(),

    'Unassign Book From Collection': props<{ bookId: string; collectionId: string }>(),
    'Unassign Book From Collection Success': props<{ book: Book }>(),
    'Unassign Book From Collection Failure': props<{ error: string }>(),

    'Set Books Filter': props<{ filter: Partial<BooksFilter> }>(),
    'Clear Books Filter': emptyProps(),
    'Set Books Sort': props<{ sort: BooksSort }>(),
  },
});
