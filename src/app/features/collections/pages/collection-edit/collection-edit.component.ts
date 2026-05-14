import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookCollection, CreateCollectionPayload } from '../../../../shared/models/book-collection.model';
import { CollectionsFacade } from '../../state/collections.facade';
import { CollectionFormComponent } from '../../components/collection-form/collection-form.component';

@Component({
  selector: 'app-collection-edit',
  standalone: true,
  imports: [RouterLink, CollectionFormComponent],
  template: `
    <div class="container page-content">
      <a class="back-link" [routerLink]="['/collections', collection().id]">
        ← {{ collection().name }}
      </a>

      <div class="page-header">
        <h1 class="page-header__title">Edit collection</h1>
      </div>

      <div class="form-card">
        <app-collection-form
          [collection]="collection()"
          submitLabel="Save changes"
          (formSubmit)="onSubmit($event)"
          (cancelRequested)="onCancel()"
        />
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .page-content {
      padding-top: 32px;
      padding-bottom: 48px;
    }

    .form-card {
      max-width: 640px;
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 32px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionEditComponent {
  private readonly facade = inject(CollectionsFacade);
  private readonly router = inject(Router);

  collection = input.required<BookCollection>();

  onSubmit(payload: CreateCollectionPayload): void {
    this.facade.update({ id: this.collection().id, ...payload });
  }

  onCancel(): void {
    this.router.navigate(['/collections', this.collection().id]);
  }
}
