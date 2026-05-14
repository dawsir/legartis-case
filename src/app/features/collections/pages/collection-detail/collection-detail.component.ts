import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { BookCollection } from '../../../../shared/models/book-collection.model';
import { CollectionsFacade } from '../../state/collections.facade';
import { BooksFacade } from '../../../books/state/books.facade';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, ConfirmDialogComponent, EmptyStateComponent, LoadingSpinnerComponent],
  template: `
    <div class="container page-content">
      <a class="back-link" routerLink="/collections">← All collections</a>

      <div class="page-header">
        <h1 class="page-header__title">{{ collection().name }}</h1>
        <div class="page-header__actions">
          <a [routerLink]="['/collections', collection().id, 'edit']" class="btn btn--secondary">
            Edit
          </a>
          <button class="btn btn--danger" type="button" (click)="openDeleteDialog()">Delete</button>
        </div>
      </div>

      @if (collection().description) {
        <p class="collection-detail__description">{{ collection().description }}</p>
      }

      <dl class="meta-list">
        <dt>Books</dt>
        <dd>{{ booksCount() }}</dd>
        <dt>Created</dt>
        <dd>{{ collection().createdAt | date: 'mediumDate' }}</dd>
        <dt>Last updated</dt>
        <dd>{{ collection().updatedAt | date: 'mediumDate' }}</dd>
      </dl>

      <section class="section">
        <div class="section__header">
          <h2 class="section__title">Books in this collection ({{ booksCount() }})</h2>
          <a routerLink="/books" class="btn btn--secondary btn--sm">Browse all books</a>
        </div>

        @if (booksLoading()) {
          <app-loading-spinner label="Loading books…" />
        } @else if (noBooksInCollection()) {
          <app-empty-state message="No books in this collection yet." />
        } @else {
          <ul class="book-list">
            @for (book of books(); track book.id) {
              <li class="book-list__item">
                <a [routerLink]="['/books', book.id]" class="book-list__title">{{ book.title }}</a>
                <span class="book-list__meta">{{ book.author }} · {{ book.year }}</span>
                <span class="badge badge--muted">{{ book.genre }}</span>
              </li>
            }
          </ul>
        }
      </section>

      <app-confirm-dialog
        [isOpen]="isDeleteDialogOpen()"
        title="Delete collection"
        [message]="'Delete &quot;' + collection().name + '&quot;? This will remove it from all associated books.'"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="closeDeleteDialog()"
      />
    </div>
  `,
  styles: `
    :host { display: block; }

    .page-content {
      padding-top: 32px;
      padding-bottom: 48px;
    }

    .collection-detail__description {
      color: #6c757d;
      margin-bottom: 24px;
      max-width: 720px;
      line-height: 1.6;
    }

    .meta-list {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 4px 24px;
      margin-bottom: 32px;
      font-size: 0.875rem;
    }

    .meta-list dt {
      font-weight: 500;
      color: #6c757d;
    }

    .book-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .book-list__item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      background: #fff;
    }

    .book-list__title {
      font-weight: 500;
      flex: 1;
      color: inherit;
      text-decoration: none;

      &:hover { text-decoration: underline; }
    }

    .book-list__meta {
      font-size: 0.875rem;
      color: #6c757d;
    }

    .btn--sm {
      font-size: 0.875rem;
      padding: 6px 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionDetailComponent implements OnInit {
  private readonly facade = inject(CollectionsFacade);
  private readonly booksFacade = inject(BooksFacade);
  private readonly route = inject(ActivatedRoute);

  collection = input.required<BookCollection>();

  private readonly id$ = this.route.paramMap.pipe(map(p => p.get('id')!));

  readonly viewModel = toSignal(
    this.id$.pipe(switchMap(id => this.facade.getViewModelById(id))),
  );

  readonly books = toSignal(
    this.id$.pipe(switchMap(id => this.booksFacade.getBooksForCollection(id))),
    { initialValue: [] },
  );

  readonly booksLoading = toSignal(this.booksFacade.loading$, { initialValue: false });

  readonly booksCount = computed(() => this.viewModel()?.booksCount ?? 0);
  readonly noBooksInCollection = computed(() => !this.booksLoading() && this.books().length === 0);

  readonly isDeleteDialogOpen = signal(false);

  ngOnInit(): void {
    this.booksFacade.loadAll();
  }

  openDeleteDialog(): void {
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
  }

  onDeleteConfirmed(): void {
    this.facade.delete(this.collection().id);
  }
}
