import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';

// PHASE-1 PLACEHOLDER — replace in Phase 2
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="container"><h1>Books</h1><p>List — coming soon.</p></section>`,
})
class BooksListPlaceholder {}

// PHASE-1 PLACEHOLDER — replace in Phase 2
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="container"><h1>New Book</h1><p>Create form — coming soon.</p></section>`,
})
class BookCreatePlaceholder {}

// PHASE-1 PLACEHOLDER — replace in Phase 2
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="container"><h1>Book Detail</h1><p>Detail — coming soon.</p></section>`,
})
class BookDetailPlaceholder {}

// PHASE-1 PLACEHOLDER — replace in Phase 2
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="container"><h1>Edit Book</h1><p>Edit form — coming soon.</p></section>`,
})
class BookEditPlaceholder {}

export const BOOKS_ROUTES: Routes = [
  { path: '', component: BooksListPlaceholder },
  { path: 'new', component: BookCreatePlaceholder },
  { path: ':id', component: BookDetailPlaceholder },
  { path: ':id/edit', component: BookEditPlaceholder },
];
