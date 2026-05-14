import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Book } from '../../../../shared/models/book.model';
import { BooksFacade } from '../../state/books.facade';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AssignCollectionsPanelComponent } from '../../components/assign-collections-panel/assign-collections-panel.component';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, ConfirmDialogComponent, AssignCollectionsPanelComponent],
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
          <button class="btn btn--danger-soft" type="button" (click)="openDeleteDialog()">Delete</button>
        </div>
      </div>

      <div class="detail-layout">
        <div>
          @if (book().description) {
            <p class="book-detail__description">{{ book().description }}</p>
          }

          <app-assign-collections-panel [bookId]="book().id" />
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
      color: #475467;
      margin-top: 4px;
    }

    .book-detail__description {
      color: #101828;
      line-height: 1.7;
      margin-bottom: 32px;
      max-width: 680px;
    }

    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 48px;
      align-items: start;
    }

    .book-detail__meta {
      background: #f9fafb;
      border: 1px solid #e4e7ec;
      border-radius: 10px;
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
      color: #475467;
    }

    @media (max-width: 768px) {
      .detail-layout {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetailComponent {
  private readonly facade = inject(BooksFacade);

  book = input.required<Book>();

  readonly isDeleteDialogOpen = signal(false);

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
