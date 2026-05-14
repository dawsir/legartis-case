import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Book, CreateBookPayload } from '../../../../shared/models/book.model';
import { BookGenre, BOOK_GENRE_OPTIONS } from '../../../../shared/models/book-genre.enum';

interface BookFormShape {
  title: FormControl<string>;
  author: FormControl<string>;
  genre: FormControl<string>;
  year: FormControl<number>;
  isbn: FormControl<string | null>;
  description: FormControl<string | null>;
  collectionIds: FormControl<string[]>;
}

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <!-- Title -->
      <div class="form-group">
        <label for="book-title">Title <span class="required">*</span></label>
        <input
          id="book-title"
          type="text"
          formControlName="title"
          placeholder="Book title"
          autocomplete="off"
        />
        @if (form.controls.title.invalid && form.controls.title.touched) {
          <span class="form-error">
            @if (form.controls.title.errors?.['required']) { Title is required. }
            @else if (form.controls.title.errors?.['maxlength']) { Max 100 characters. }
          </span>
        }
      </div>

      <!-- Author -->
      <div class="form-group">
        <label for="book-author">Author <span class="required">*</span></label>
        <input
          id="book-author"
          type="text"
          formControlName="author"
          placeholder="Author name"
          autocomplete="off"
        />
        @if (form.controls.author.invalid && form.controls.author.touched) {
          <span class="form-error">
            @if (form.controls.author.errors?.['required']) { Author is required. }
            @else if (form.controls.author.errors?.['maxlength']) { Max 100 characters. }
          </span>
        }
      </div>

      <!-- Genre + Year (side by side on wider screens) -->
      <div class="book-form__row">
        <div class="form-group">
          <label for="book-genre">Genre <span class="required">*</span></label>
          <select id="book-genre" formControlName="genre">
            <option value="" disabled>Select a genre</option>
            @for (opt of genreOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
          @if (form.controls.genre.invalid && form.controls.genre.touched) {
            <span class="form-error">Genre is required.</span>
          }
        </div>

        <div class="form-group">
          <label for="book-year">Year <span class="required">*</span></label>
          <input
            id="book-year"
            type="number"
            formControlName="year"
            [min]="-3000"
            [max]="currentYear"
            placeholder="Publication year"
          />
          @if (form.controls.year.invalid && form.controls.year.touched) {
            <span class="form-error">
              @if (form.controls.year.errors?.['required']) { Year is required. }
              @else if (form.controls.year.errors?.['min']) { Year cannot be earlier than −3000. }
              @else if (form.controls.year.errors?.['max']) { Year cannot be in the future. }
            </span>
          }
        </div>
      </div>

      <!-- ISBN -->
      <div class="form-group">
        <label for="book-isbn">ISBN</label>
        <input
          id="book-isbn"
          type="text"
          formControlName="isbn"
          placeholder="e.g. 9783161484100"
          autocomplete="off"
        />
        @if (form.controls.isbn.invalid && form.controls.isbn.touched) {
          <span class="form-error">ISBN must be 10 or 13 digits (no hyphens).</span>
        }
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="book-description">Description</label>
        <textarea
          id="book-description"
          formControlName="description"
          placeholder="Optional description…"
          rows="4"
        ></textarea>
        @if (form.controls.description.invalid && form.controls.description.touched) {
          <span class="form-error">Description must be 1000 characters or fewer.</span>
        }
        <span class="form-hint">{{ descriptionLength() }} / 1000</span>
      </div>

      <div class="form-actions">
        <button class="btn btn--secondary" type="button" (click)="cancelRequested.emit()">
          Cancel
        </button>
        <button class="btn btn--primary" type="submit" [disabled]="isSubmitDisabled()">
          {{ submitLabel() }}
        </button>
      </div>
    </form>
  `,
  styles: `
    :host { display: block; }

    .book-form__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookFormComponent {
  book = input<Book | null>(null);
  submitLabel = input<string>('Save');
  formSubmit = output<CreateBookPayload>();
  cancelRequested = output<void>();

  readonly genreOptions = BOOK_GENRE_OPTIONS;
  readonly currentYear = new Date().getFullYear();

  readonly form = new FormGroup<BookFormShape>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    author: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    genre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    year: new FormControl(new Date().getFullYear(), {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(-3000),
        Validators.max(new Date().getFullYear()),
      ],
    }),
    isbn: new FormControl<string | null>(null, [
      Validators.pattern(/^(?:\d{9}[\dX]|\d{13})$/),
    ]),
    description: new FormControl<string | null>(null, [Validators.maxLength(1000)]),
    collectionIds: new FormControl<string[]>([], { nonNullable: true }),
  });

  readonly isSubmitDisabled = toSignal(
    this.form.statusChanges.pipe(map(s => s !== 'VALID')),
    { initialValue: true },
  );

  readonly descriptionLength = toSignal(
    this.form.controls.description.valueChanges.pipe(map(v => (v ?? '').length)),
    { initialValue: 0 },
  );

  constructor() {
    effect(() => {
      const b = this.book();
      if (b) {
        this.form.patchValue({
          title: b.title,
          author: b.author,
          genre: b.genre,
          year: b.year,
          isbn: b.isbn ?? null,
          description: b.description ?? null,
          collectionIds: b.collectionIds,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, author, genre, year, isbn, description, collectionIds } =
      this.form.getRawValue();
    this.formSubmit.emit({
      title,
      author,
      genre: genre as BookGenre,
      year,
      isbn: isbn ?? undefined,
      description: description ?? undefined,
      collectionIds,
    });
  }
}
