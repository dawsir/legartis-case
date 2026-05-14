import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Book, CreateBookPayload } from '../../../../shared/models/book.model';
import { BooksFacade } from '../../state/books.facade';
import { BookFormComponent } from '../../components/book-form/book-form.component';

@Component({
  selector: 'app-book-edit',
  standalone: true,
  imports: [RouterLink, BookFormComponent],
  template: `
    <div class="container page-content">
      <a class="back-link" [routerLink]="['/books', book().id]">← {{ book().title }}</a>

      <div class="page-header">
        <h1 class="page-header__title">Edit book</h1>
      </div>

      <div class="form-card">
        <app-book-form
          [book]="book()"
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookEditComponent {
  private readonly facade = inject(BooksFacade);
  private readonly router = inject(Router);

  book = input.required<Book>();

  onSubmit(payload: CreateBookPayload): void {
    this.facade.update({ id: this.book().id, ...payload });
  }

  onCancel(): void {
    this.router.navigate(['/books', this.book().id]);
  }
}
