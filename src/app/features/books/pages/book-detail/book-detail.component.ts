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
import { Book } from '../../../../shared/models/book.model';
import { BooksFacade } from '../../state/books.facade';
import { CollectionsFacade } from '../../../collections/state/collections.facade';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, ConfirmDialogComponent, EmptyStateComponent],
  template: `
    <div class="container page-content">
      <a class="back-link" routerLink="/books">← All books</a>

      <div class="page-header">
        <div>
          <h1 class="page-header__title">{{ book().title }}</h1>
          <p class="book-detail__author">{{ book().author }}</p>
        </div>
        <div class="page-header__actions">
          <a [routerLink]="['/books', book().id, 'edit']" class="btn btn--secondary">Edit</a>
          <button class="btn btn--danger" type="button" (click)="openDeleteDialog()">Delete</button>
        </div>
      </div>

      <div class="detail-layout">
        <div>
          @if (book().description) {
            <p class="book-detail__description">{{ book().description }}</p>
          }

          <section class="section">
            <div class="section__header">
              <h2 class="section__title">Collections ({{ collectionsCount() }})</h2>
              <a routerLink="/collections" class="btn btn--secondary btn--sm">
                Browse collections
              </a>
            </div>

            @if (assignedCollections().length === 0) {
              <app-empty-state message="Not assigned to any collection." />
            } @else {
              <ul class="collection-list">
                @for (c of assignedCollections(); track c.id) {
                  <li class="collection-list__item">
                    <a [routerLink]="['/collections', c.id]" class="collection-list__name">
                      {{ c.name }}
                    </a>
                    @if (c.description) {
                      <span class="collection-list__desc">{{ c.description }}</span>
                    }
                  </li>
                }
              </ul>
            }
          </section>
        </div>

        <aside class="book-detail__meta">
          <dl class="meta-list">
            <dt>Genre</dt>
            <dd><span class="badge badge--muted">{{ book().genre }}</span></dd>
            <dt>Year</dt>
            <dd>{{ book().year }}</dd>
            @if (book().isbn) {
              <dt>ISBN</dt>
              <dd>{{ book().isbn }}</dd>
            }
            <dt>Added</dt>
            <dd>{{ book().createdAt | date: 'mediumDate' }}</dd>
            <dt>Updated</dt>
            <dd>{{ book().updatedAt | date: 'mediumDate' }}</dd>
          </dl>
        </aside>
      </div>

      <app-confirm-dialog
        [isOpen]="isDeleteDialogOpen()"
        title="Delete book"
        [message]="'Delete &quot;' + book().title + '&quot;? This action cannot be undone.'"
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

    .book-detail__author {
      font-size: 1.125rem;
      color: #6c757d;
      margin-top: 4px;
    }

    .book-detail__description {
      color: #1a1a2e;
      line-height: 1.7;
      margin-bottom: 32px;
      max-width: 680px;
    }

    .book-detail__meta {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 24px;
      align-self: start;
    }

    .meta-list {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 8px 20px;
      font-size: 0.875rem;
    }

    .meta-list dt {
      font-weight: 500;
      color: #6c757d;
    }

    .collection-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .collection-list__item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 12px 16px;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      background: #fff;
    }

    .collection-list__name {
      font-weight: 500;
      color: inherit;
      text-decoration: none;

      &:hover { text-decoration: underline; }
    }

    .collection-list__desc {
      font-size: 0.8125rem;
      color: #6c757d;
    }

    .btn--sm {
      font-size: 0.875rem;
      padding: 6px 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetailComponent implements OnInit {
  private readonly facade = inject(BooksFacade);
  private readonly collectionsFacade = inject(CollectionsFacade);
  private readonly route = inject(ActivatedRoute);

  book = input.required<Book>();

  private readonly id$ = this.route.paramMap.pipe(map(p => p.get('id')!));

  readonly bookFromStore = toSignal(
    this.id$.pipe(switchMap(id => this.facade.getById(id))),
  );

  readonly allCollections = toSignal(this.collectionsFacade.allCollections$, { initialValue: [] });

  readonly assignedCollections = computed(() => {
    const b = this.bookFromStore() ?? this.book();
    return this.allCollections().filter(c => b.collectionIds.includes(c.id));
  });

  readonly collectionsCount = computed(() => this.assignedCollections().length);
  readonly isDeleteDialogOpen = signal(false);

  ngOnInit(): void {
    this.collectionsFacade.loadAll();
  }

  openDeleteDialog(): void {
    this.isDeleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
  }

  onDeleteConfirmed(): void {
    this.facade.delete(this.book().id);
  }
}
