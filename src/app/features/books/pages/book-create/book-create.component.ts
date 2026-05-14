import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BooksFacade } from '../../state/books.facade';
import { BookFormComponent } from '../../components/book-form/book-form.component';
import { CreateBookPayload } from '../../../../shared/models/book.model';

@Component({
  selector: 'app-book-create',
  standalone: true,
  imports: [RouterLink, BookFormComponent],
  template: `
    <div class="container page-content">
      <a class="back-link" routerLink="/books">← All books</a>

      <div class="page-header">
        <h1 class="page-header__title">Add book</h1>
      </div>

      <div class="form-card">
        <app-book-form
          submitLabel="Add book"
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
      max-width: 720px;
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 32px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCreateComponent {
  private readonly facade = inject(BooksFacade);
  private readonly router = inject(Router);

  onSubmit(payload: CreateBookPayload): void {
    this.facade.create(payload);
  }

  onCancel(): void {
    this.router.navigate(['/books']);
  }
}
