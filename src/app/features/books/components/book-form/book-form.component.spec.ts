import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookFormComponent } from './book-form.component';
import { Book } from '../../../../shared/models/book.model';
import { BookGenre } from '../../../../shared/models/book-genre.enum';

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'b1',
    title: 'Existing Title',
    author: 'Existing Author',
    genre: BookGenre.Classic,
    year: 1990,
    collectionIds: ['c1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('BookFormComponent', () => {
  let fixture: ComponentFixture<BookFormComponent>;
  let component: BookFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initial state', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('form is invalid when empty', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('submit is disabled on a fresh form', () => {
      expect(component.isSubmitDisabled()).toBe(true);
    });

    it('title and author controls start empty', () => {
      expect(component.form.controls.title.value).toBe('');
      expect(component.form.controls.author.value).toBe('');
    });

    it('genre control starts empty', () => {
      expect(component.form.controls.genre.value).toBe('');
    });

    it('collectionIds control starts as empty array', () => {
      expect(component.form.controls.collectionIds.value).toEqual([]);
    });
  });

  describe('title validation', () => {
    it('is invalid when title is empty', () => {
      component.form.controls.title.setValue('');
      expect(component.form.controls.title.errors?.['required']).toBeTruthy();
    });

    it('is invalid when title exceeds 100 characters', () => {
      component.form.controls.title.setValue('a'.repeat(101));
      expect(component.form.controls.title.errors?.['maxlength']).toBeTruthy();
    });

    it('is valid with a normal title', () => {
      component.form.controls.title.setValue('Dune');
      expect(component.form.controls.title.valid).toBe(true);
    });
  });

  describe('author validation', () => {
    it('is invalid when author is empty', () => {
      component.form.controls.author.setValue('');
      expect(component.form.controls.author.errors?.['required']).toBeTruthy();
    });

    it('is invalid when author exceeds 100 characters', () => {
      component.form.controls.author.setValue('a'.repeat(101));
      expect(component.form.controls.author.errors?.['maxlength']).toBeTruthy();
    });

    it('is valid with a normal author name', () => {
      component.form.controls.author.setValue('Frank Herbert');
      expect(component.form.controls.author.valid).toBe(true);
    });
  });

  describe('genre validation', () => {
    it('is invalid when genre is empty string', () => {
      component.form.controls.genre.setValue('');
      expect(component.form.controls.genre.errors?.['required']).toBeTruthy();
    });

    it('is valid when genre is set', () => {
      component.form.controls.genre.setValue(BookGenre.ScienceFiction);
      expect(component.form.controls.genre.valid).toBe(true);
    });
  });

  describe('year validation', () => {
    it('is invalid when year is below minimum (-3000)', () => {
      component.form.controls.year.setValue(-3001);
      expect(component.form.controls.year.errors?.['min']).toBeTruthy();
    });

    it('is valid at the minimum boundary year (-3000)', () => {
      component.form.controls.year.setValue(-3000);
      expect(component.form.controls.year.valid).toBe(true);
    });

    it('is invalid when year exceeds current year', () => {
      component.form.controls.year.setValue(new Date().getFullYear() + 1);
      expect(component.form.controls.year.errors?.['max']).toBeTruthy();
    });

    it('is valid for the current year', () => {
      component.form.controls.year.setValue(new Date().getFullYear());
      expect(component.form.controls.year.valid).toBe(true);
    });

    it('is valid for a historical year', () => {
      component.form.controls.year.setValue(1813);
      expect(component.form.controls.year.valid).toBe(true);
    });
  });

  describe('description validation', () => {
    it('is valid when description is null (optional)', () => {
      component.form.controls.description.setValue(null);
      expect(component.form.controls.description.valid).toBe(true);
    });

    it('is invalid when description exceeds 1000 characters', () => {
      component.form.controls.description.setValue('a'.repeat(1001));
      expect(component.form.controls.description.errors?.['maxlength']).toBeTruthy();
    });

    it('is valid at exactly 1000 characters', () => {
      component.form.controls.description.setValue('a'.repeat(1000));
      expect(component.form.controls.description.valid).toBe(true);
    });
  });

  describe('form submission', () => {
    function fillValidForm(): void {
      component.form.controls.title.setValue('Dune');
      component.form.controls.author.setValue('Frank Herbert');
      component.form.controls.genre.setValue(BookGenre.ScienceFiction);
      component.form.controls.year.setValue(1965);
    }

    it('form is valid when all required fields are filled', () => {
      fillValidForm();
      expect(component.form.valid).toBe(true);
    });

    it('emits formSubmit with correct payload on valid submission', () => {
      fillValidForm();
      const emitted: unknown[] = [];
      component.formSubmit.subscribe(p => emitted.push(p));

      component.onSubmit();

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toMatchObject({
        title: 'Dune',
        author: 'Frank Herbert',
        genre: BookGenre.ScienceFiction,
        year: 1965,
      });
    });

    it('does not emit when form is invalid', () => {
      const emitted: unknown[] = [];
      component.formSubmit.subscribe(p => emitted.push(p));

      component.onSubmit();

      expect(emitted.length).toBe(0);
    });

    it('marks all controls as touched on invalid submission', () => {
      component.onSubmit();

      expect(component.form.controls.title.touched).toBe(true);
      expect(component.form.controls.author.touched).toBe(true);
      expect(component.form.controls.genre.touched).toBe(true);
    });

    it('emits cancelRequested when cancel is called', () => {
      const emitted: unknown[] = [];
      component.cancelRequested.subscribe(() => emitted.push(true));

      component.cancelRequested.emit();

      expect(emitted.length).toBe(1);
    });
  });

  describe('edit mode — patching from book input', () => {
    it('patches form fields when book input is set', async () => {
      const book = makeBook({
        title: 'Foundation',
        author: 'Isaac Asimov',
        genre: BookGenre.ScienceFiction,
        year: 1951,
        collectionIds: ['c1', 'c2'],
      });

      fixture.componentRef.setInput('book', book);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.controls.title.value).toBe('Foundation');
      expect(component.form.controls.author.value).toBe('Isaac Asimov');
      expect(component.form.controls.genre.value).toBe(BookGenre.ScienceFiction);
      expect(component.form.controls.year.value).toBe(1951);
      expect(component.form.controls.collectionIds.value).toEqual(['c1', 'c2']);
    });

    it('form is valid after patching with a complete book', async () => {
      fixture.componentRef.setInput('book', makeBook());
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.valid).toBe(true);
    });
  });
});
