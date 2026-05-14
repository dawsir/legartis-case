import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BookCollection } from '../../../../shared/models/book-collection.model';
import { CollectionsFacade } from '../../state/collections.facade';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AssignBooksPanelComponent } from '../../components/assign-books-panel/assign-books-panel.component';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, ConfirmDialogComponent, AssignBooksPanelComponent],
  template: `
    <div class="container page-content">
      <a class="back-link" routerLink="/collections">← All collections</a>

      <div class="page-header">
        <h1 class="page-header__title">{{ collection().name }}</h1>
        <div class="page-header__actions">
          <a [routerLink]="['/collections', collection().id, 'edit']" class="btn btn--secondary">
            Edit
          </a>
          <button class="btn btn--danger-soft" type="button" (click)="openDeleteDialog()">Delete</button>
        </div>
      </div>

      @if (collection().description) {
        <p class="collection-detail__description">{{ collection().description }}</p>
      }

      <dl class="meta-list">
        <dt>Created</dt>
        <dd>{{ collection().createdAt | date: 'mediumDate' }}</dd>
        <dt>Last updated</dt>
        <dd>{{ collection().updatedAt | date: 'mediumDate' }}</dd>
      </dl>

      <app-assign-books-panel [collectionId]="collection().id" />

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
      color: #475467;
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
      color: #475467;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionDetailComponent {
  private readonly facade = inject(CollectionsFacade);

  collection = input.required<BookCollection>();

  readonly isDeleteDialogOpen = signal(false);

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
