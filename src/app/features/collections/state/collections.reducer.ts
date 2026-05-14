import { createReducer } from '@ngrx/store';
import { BookCollection } from '../../../shared/models/book-collection.model';

export interface CollectionsState {
  ids: string[];
  entities: Record<string, BookCollection>;
  loading: boolean;
  error: string | null;
}

export const initialCollectionsState: CollectionsState = {
  ids: [],
  entities: {},
  loading: false,
  error: null,
};

export const collectionsReducer = createReducer(initialCollectionsState);
