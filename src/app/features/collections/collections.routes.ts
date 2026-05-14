import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';

// PHASE-1 PLACEHOLDER — replace in Phase 2
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="container"><h1>Collections</h1><p>List — coming soon.</p></section>`,
})
class CollectionsListPlaceholder {}

// PHASE-1 PLACEHOLDER — replace in Phase 2
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="container"><h1>New Collection</h1><p>Create form — coming soon.</p></section>`,
})
class CollectionCreatePlaceholder {}

// PHASE-1 PLACEHOLDER — replace in Phase 2
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="container"><h1>Collection Detail</h1><p>Detail — coming soon.</p></section>`,
})
class CollectionDetailPlaceholder {}

// PHASE-1 PLACEHOLDER — replace in Phase 2
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="container"><h1>Edit Collection</h1><p>Edit form — coming soon.</p></section>`,
})
class CollectionEditPlaceholder {}

export const COLLECTIONS_ROUTES: Routes = [
  { path: '', component: CollectionsListPlaceholder },
  { path: 'new', component: CollectionCreatePlaceholder },
  { path: ':id', component: CollectionDetailPlaceholder },
  { path: ':id/edit', component: CollectionEditPlaceholder },
];
