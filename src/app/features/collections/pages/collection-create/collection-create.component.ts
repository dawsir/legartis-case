import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CollectionsFacade } from '../../state/collections.facade';
import { CollectionFormComponent } from '../../components/collection-form/collection-form.component';
import { CreateCollectionPayload } from '../../../../shared/models/book-collection.model';

@Component({
  selector: 'app-collection-create',
  standalone: true,
  imports: [RouterLink, CollectionFormComponent],
  template: `
    <div class="container page-content">
      <a class="back-link" routerLink="/collections">← All collections</a>

      <div class="page-header">
        <h1 class="page-header__title">New collection</h1>
      </div>

      <div class="form-card">
        <app-collection-form
          submitLabel="Create collection"
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
export class CollectionCreateComponent {
  private readonly facade = inject(CollectionsFacade);
  private readonly router = inject(Router);

  onSubmit(payload: CreateCollectionPayload): void {
    this.facade.create(payload);
  }

  onCancel(): void {
    this.router.navigate(['/collections']);
  }
}
