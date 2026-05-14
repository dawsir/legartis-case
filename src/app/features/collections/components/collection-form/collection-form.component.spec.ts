import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionFormComponent } from './collection-form.component';
import { BookCollection } from '../../../../shared/models/book-collection.model';

function makeCollection(overrides: Partial<BookCollection> = {}): BookCollection {
  return {
    id: 'c1',
    name: 'Existing Collection',
    description: 'A description',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('CollectionFormComponent', () => {
  let fixture: ComponentFixture<CollectionFormComponent>;
  let component: CollectionFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initial state', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('form is invalid when name is empty', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('submit is disabled on a fresh form', () => {
      expect(component.isSubmitDisabled()).toBe(true);
    });

    it('name control starts empty', () => {
      expect(component.form.controls.name.value).toBe('');
    });

    it('description control starts null', () => {
      expect(component.form.controls.description.value).toBeNull();
    });
  });

  describe('name validation', () => {
    it('is invalid when name is empty', () => {
      component.form.controls.name.setValue('');
      expect(component.form.controls.name.errors?.['required']).toBeTruthy();
    });

    it('is invalid when name exceeds 80 characters', () => {
      component.form.controls.name.setValue('a'.repeat(81));
      expect(component.form.controls.name.errors?.['maxlength']).toBeTruthy();
    });

    it('is valid at exactly 80 characters', () => {
      component.form.controls.name.setValue('a'.repeat(80));
      expect(component.form.controls.name.valid).toBe(true);
    });

    it('is valid with a normal collection name', () => {
      component.form.controls.name.setValue('Science Fiction');
      expect(component.form.controls.name.valid).toBe(true);
    });
  });

  describe('description validation', () => {
    it('is valid when description is null (optional)', () => {
      component.form.controls.description.setValue(null);
      expect(component.form.controls.description.valid).toBe(true);
    });

    it('is invalid when description exceeds 500 characters', () => {
      component.form.controls.description.setValue('a'.repeat(501));
      expect(component.form.controls.description.errors?.['maxlength']).toBeTruthy();
    });

    it('is valid at exactly 500 characters', () => {
      component.form.controls.description.setValue('a'.repeat(500));
      expect(component.form.controls.description.valid).toBe(true);
    });
  });

  describe('form submission', () => {
    it('form is valid when name is provided', () => {
      component.form.controls.name.setValue('Programming');
      expect(component.form.valid).toBe(true);
    });

    it('emits formSubmit with name and description on valid submission', () => {
      component.form.controls.name.setValue('Programming');
      component.form.controls.description.setValue('Great coding books');
      const emitted: unknown[] = [];
      component.formSubmit.subscribe(p => emitted.push(p));

      component.onSubmit();

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toMatchObject({ name: 'Programming', description: 'Great coding books' });
    });

    it('emits formSubmit with undefined description when description is null', () => {
      component.form.controls.name.setValue('History');
      component.form.controls.description.setValue(null);
      const emitted: Array<{ name: string; description?: string }> = [];
      component.formSubmit.subscribe(p => emitted.push(p));

      component.onSubmit();

      expect(emitted[0].description).toBeUndefined();
    });

    it('does not emit when form is invalid', () => {
      const emitted: unknown[] = [];
      component.formSubmit.subscribe(p => emitted.push(p));

      component.onSubmit();

      expect(emitted.length).toBe(0);
    });

    it('marks name control as touched on invalid submission', () => {
      component.onSubmit();
      expect(component.form.controls.name.touched).toBe(true);
    });
  });

  describe('edit mode — patching from collection input', () => {
    it('patches name and description when collection input is set', async () => {
      const collection = makeCollection({ name: 'Classic Literature', description: 'Timeless works' });
      fixture.componentRef.setInput('collection', collection);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.controls.name.value).toBe('Classic Literature');
      expect(component.form.controls.description.value).toBe('Timeless works');
    });

    it('form is valid after patching a complete collection', async () => {
      fixture.componentRef.setInput('collection', makeCollection());
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.valid).toBe(true);
    });

    it('patches description as null when collection has no description', async () => {
      const collection = makeCollection({ description: undefined });
      fixture.componentRef.setInput('collection', collection);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.controls.description.value).toBeNull();
    });
  });

  describe('description character counter', () => {
    it('starts at 0', () => {
      expect(component.descriptionLength()).toBe(0);
    });

    it('updates after typing', async () => {
      component.form.controls.description.setValue('hello');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.descriptionLength()).toBe(5);
    });
  });
});
