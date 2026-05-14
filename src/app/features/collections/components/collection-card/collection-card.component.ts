import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CollectionViewModel } from '../../../../shared/models/view-models';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-collection-card',
  standalone: true,
  imports: [RouterLink, TruncatePipe],
  template: `
    <article class="card collection-card">
      <div class="card__header">
        <h2 class="card__title">
          <a [routerLink]="['/collections', collection().id]" class="card__title-link">
            {{ collection().name }}
          </a>
        </h2>
        <span class="badge">{{ collection().booksCount }} {{ booksLabel() }}</span>
      </div>

      @if (collection().description) {
        <p class="card__description">{{ collection().description | truncate: 120 }}</p>
      } @else {
        <p class="card__description card__description--empty">No description provided.</p>
      }

      <div class="card__actions">
        <a [routerLink]="['/collections', collection().id]" class="btn btn--secondary">View</a>
        <a [routerLink]="['/collections', collection().id, 'edit']" class="btn btn--secondary">Edit</a>
        <button
          class="btn btn--danger"
          type="button"
          (click)="deleteRequested.emit(collection().id)"
        >
          Delete
        </button>
      </div>
    </article>
  `,
  styles: `
    :host { display: block; }

    .collection-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card__title-link {
      color: inherit;
      text-decoration: none;

      &:hover { text-decoration: underline; }
    }

    .card__description--empty {
      font-style: italic;
      color: #6c757d;
    }

    .card__actions {
      margin-top: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionCardComponent {
  collection = input.required<CollectionViewModel>();
  deleteRequested = output<string>();

  booksLabel = computed(() => (this.collection().booksCount === 1 ? 'book' : 'books'));
}
