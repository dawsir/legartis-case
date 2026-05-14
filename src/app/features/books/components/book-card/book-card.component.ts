import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book } from '../../../../shared/models/book.model';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterLink, TruncatePipe],
  template: `
    <article class="card book-card">
      <div class="card__header">
        <h2 class="card__title">
          <a [routerLink]="['/books', book().id]" class="book-card__title-link">
            {{ book().title }}
          </a>
        </h2>
        <span class="badge badge--muted">{{ book().genre }}</span>
      </div>

      <p class="book-card__author">{{ book().author }} · {{ book().year }}</p>

      @if (book().description) {
        <p class="card__description">{{ book().description | truncate: 100 }}</p>
      }

      @if (collectionsCount() > 0) {
        <p class="book-card__collections">
          <span class="badge">{{ collectionsCount() }} {{ collectionsLabel() }}</span>
        </p>
      }

      <div class="card__actions">
        <a [routerLink]="['/books', book().id]" class="btn btn--secondary">View</a>
        <a [routerLink]="['/books', book().id, 'edit']" class="btn btn--secondary">Edit</a>
        <button
          class="btn btn--danger"
          type="button"
          (click)="deleteRequested.emit(book().id)"
        >
          Delete
        </button>
      </div>
    </article>
  `,
  styles: `
    :host { display: block; }

    .book-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .book-card__title-link {
      color: inherit;
      text-decoration: none;

      &:hover { text-decoration: underline; }
    }

    .book-card__author {
      font-size: 0.875rem;
      color: #6c757d;
      margin-bottom: 8px;
    }

    .book-card__collections {
      margin-top: auto;
      padding-top: 8px;
    }

    .card__actions {
      margin-top: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCardComponent {
  book = input.required<Book>();
  deleteRequested = output<string>();

  collectionsCount = computed(() => this.book().collectionIds.length);
  collectionsLabel = computed(() => (this.collectionsCount() === 1 ? 'collection' : 'collections'));
}
