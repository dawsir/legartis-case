import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { CollectionsFilter, CollectionsSort } from '../../../shared/models/filters.model';
import {
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from '../../../shared/models/book-collection.model';
import { CollectionsActions } from './collections.actions';
import {
  selectAllCollections,
  selectCollectionById,
  selectCollectionViewModelById,
  selectCollectionViewModels,
  selectCollectionsError,
  selectCollectionsFilter,
  selectCollectionsLoading,
  selectCollectionsSort,
  selectFilteredAndSortedCollections,
} from './collections.selectors';

@Injectable({ providedIn: 'root' })
export class CollectionsFacade {
  private readonly store = inject(Store);

  readonly collections$ = this.store.select(selectFilteredAndSortedCollections);
  readonly allCollections$ = this.store.select(selectAllCollections);
  readonly collectionViewModels$ = this.store.select(selectCollectionViewModels);
  readonly loading$ = this.store.select(selectCollectionsLoading);
  readonly error$ = this.store.select(selectCollectionsError);
  readonly filter$ = this.store.select(selectCollectionsFilter);
  readonly sort$ = this.store.select(selectCollectionsSort);

  getById(id: string) {
    return this.store.select(selectCollectionById(id));
  }

  getViewModelById(id: string) {
    return this.store.select(selectCollectionViewModelById(id));
  }

  loadAll(): void {
    this.store.dispatch(CollectionsActions.loadCollections());
  }

  loadOne(id: string): void {
    this.store.dispatch(CollectionsActions.loadCollection({ id }));
  }

  create(payload: CreateCollectionPayload): void {
    this.store.dispatch(CollectionsActions.createCollection({ payload }));
  }

  update(payload: UpdateCollectionPayload): void {
    this.store.dispatch(CollectionsActions.updateCollection({ payload }));
  }

  delete(id: string): void {
    this.store.dispatch(CollectionsActions.deleteCollection({ id }));
  }

  setFilter(filter: Partial<CollectionsFilter>): void {
    this.store.dispatch(CollectionsActions.setCollectionsFilter({ filter }));
  }

  clearFilter(): void {
    this.store.dispatch(CollectionsActions.clearCollectionsFilter());
  }

  setSort(sort: CollectionsSort): void {
    this.store.dispatch(CollectionsActions.setCollectionsSort({ sort }));
  }
}
