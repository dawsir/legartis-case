import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  BookCollection,
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from '../../../shared/models/book-collection.model';
import { CollectionsFilter, CollectionsSort } from '../../../shared/models/filters.model';

export const CollectionsActions = createActionGroup({
  source: 'Collections',
  events: {
    'Load Collections': emptyProps(),
    'Load Collections Success': props<{ collections: BookCollection[] }>(),
    'Load Collections Failure': props<{ error: string }>(),

    'Load Collection': props<{ id: string }>(),
    'Load Collection Success': props<{ collection: BookCollection }>(),
    'Load Collection Failure': props<{ error: string }>(),

    'Create Collection': props<{ payload: CreateCollectionPayload }>(),
    'Create Collection Success': props<{ collection: BookCollection }>(),
    'Create Collection Failure': props<{ error: string }>(),

    'Update Collection': props<{ payload: UpdateCollectionPayload }>(),
    'Update Collection Success': props<{ collection: BookCollection }>(),
    'Update Collection Failure': props<{ error: string }>(),

    'Delete Collection': props<{ id: string }>(),
    'Delete Collection Success': props<{ id: string }>(),
    'Delete Collection Failure': props<{ error: string }>(),

    'Set Collections Filter': props<{ filter: Partial<CollectionsFilter> }>(),
    'Clear Collections Filter': emptyProps(),
    'Set Collections Sort': props<{ sort: CollectionsSort }>(),
  },
});
