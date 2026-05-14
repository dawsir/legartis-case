import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  BookCollection,
  CreateCollectionPayload,
} from '../../../../shared/models/book-collection.model';

interface CollectionFormShape {
  name: FormControl<string>;
  description: FormControl<string | null>;
}

@Component({
  selector: 'app-collection-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="col-name">Name <span class="required">*</span></label>
        <input
          id="col-name"
          type="text"
          formControlName="name"
          placeholder="Collection name"
          autocomplete="off"
        />
        @if (form.controls.name.invalid && form.controls.name.touched) {
          <span class="form-error">
            @if (form.controls.name.errors?.['required']) {
              Name is required.
            } @else if (form.controls.name.errors?.['maxlength']) {
              Name must be 80 characters or fewer.
            }
          </span>
        }
      </div>

      <div class="form-group">
        <label for="col-description">Description</label>
        <textarea
          id="col-description"
          formControlName="description"
          placeholder="Optional description…"
          rows="4"
        ></textarea>
        @if (form.controls.description.invalid && form.controls.description.touched) {
          <span class="form-error">Description must be 500 characters or fewer.</span>
        }
        <span class="form-hint">
          {{ descriptionLength() }} / 500
        </span>
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
  styles: `:host { display: block; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionFormComponent {
  collection = input<BookCollection | null>(null);
  submitLabel = input<string>('Save');
  formSubmit = output<CreateCollectionPayload>();
  cancelRequested = output<void>();

  readonly form = new FormGroup<CollectionFormShape>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    description: new FormControl<string | null>(null, [Validators.maxLength(500)]),
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
      const c = this.collection();
      if (c) {
        this.form.patchValue({ name: c.name, description: c.description ?? null });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, description } = this.form.getRawValue();
    this.formSubmit.emit({ name, description: description ?? undefined });
  }
}
