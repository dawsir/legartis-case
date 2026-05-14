# Book Collections App

A single-page Angular application for managing personal book collections. Built as a frontend interview project demonstrating Angular 21+, NgRx, Signals, typed reactive forms, and custom SCSS — with zero UI library dependencies.

---

## Overview

The app lets a user manage **books** and **collections** in a many-to-many relationship. Books can be added to multiple collections; collections can contain any number of books. All data is served through an in-memory HTTP API seeded with 24 books across 8 collections — no backend required.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Angular 21, standalone components, `bootstrapApplication` |
| Language | TypeScript 5.9, `strict: true` |
| State management | NgRx 21 — Store, Effects, Entity, Selectors, Facades |
| Forms | Typed Reactive Forms (`FormGroup<T>`, `FormControl<T>`) |
| HTTP mock | `angular-in-memory-web-api` 0.21 |
| Reactivity | Angular Signals — `signal()`, `computed()`, `toSignal()`, `effect()` |
| Styling | Custom SCSS only — zero UI libraries |
| Router | Angular Router with lazy-loaded feature routes |
| Change detection | `ChangeDetectionStrategy.OnPush` everywhere |

---

## Installation

**Prerequisites:** Node.js ≥ 20, npm ≥ 9.

```bash
git clone <repo-url>
cd legartis-case-1
npm install
```

---

## Running locally

```bash
npm start
```

Opens at [http://localhost:4200](http://localhost:4200). The app redirects `/` to `/collections` on load.

```bash
npm run build      # production build to dist/
npm test           # karma unit tests
```

The in-memory API intercepts all `fetch`/`HttpClient` calls. Seed data is reset on every page reload — there is no persistence layer.

---

## Product assumptions

- A user can create, view, edit, and delete both **books** and **collections**.
- A collection can exist without books.
- A book can belong to **multiple** collections (many-to-many via `collectionIds` array on `Book`).
- Users assign and unassign books from a collection's detail page via the **Assign Books Panel**.
- Users assign and unassign collections from a book's detail page via the **Assign Collections Panel**.
- All list views support **filtering** and **sorting** via state held in the NgRx store.
- Dialogs/popups are used **only** for confirming destructive actions (delete). Forms live on their own routes.
- Deleting a collection removes that `collectionId` from every affected book (handled in a NgRx effect).
- Data is served through Angular in-memory web API with seeded mock data; no backend is required.

---

## Features

### Collections
- List with search and sort (name, date created, book count)
- Create, edit, delete
- Detail page with inline assign/unassign books panel
- Delete prompts a confirmation dialog and cascades removal from all books

### Books
- List with search, genre filter, year-range filter, collection filter, and sort (title, author, genre, year, date added)
- Create, edit, delete
- Detail page with metadata sidebar (genre, year, ISBN, dates) and inline assign/unassign collections panel
- Book cards show collection membership count

### UX
- Keyboard accessible: skip-to-main link, `:focus-visible` rings on all interactive elements
- Scroll position restored on every route navigation
- Empty states with icon for all zero-result scenarios
- Loading spinners during async fetches
- Inline validation messages on touched form fields
- Responsive grid: 3 columns → 2 → 1; filter bar collapses to full-width at ≤480px
- 404 page for unmatched routes

---

## Routing structure

| Path | Component | Guard / Resolver |
|---|---|---|
| `/` | — | Redirects to `/collections` |
| `/collections` | `CollectionsListComponent` | — |
| `/collections/new` | `CollectionCreateComponent` | — |
| `/collections/:id` | `CollectionDetailComponent` | `collectionResolver` |
| `/collections/:id/edit` | `CollectionEditComponent` | `collectionResolver` |
| `/books` | `BooksListComponent` | — |
| `/books/new` | `BookCreateComponent` | — |
| `/books/:id` | `BookDetailComponent` | `bookResolver` |
| `/books/:id/edit` | `BookEditComponent` | `bookResolver` |
| `**` | `NotFoundComponent` | — |

All feature routes are **lazy-loaded** via `loadChildren` / `loadComponent`. Resolvers use a `race(successAction$, failureAction$)` pattern against the NgRx action stream — they redirect to the list page when an entity is not found (404 behaviour without a real backend).

---

## Architecture overview

```
src/
  app/
    core/
      services/          # BooksApiService, CollectionsApiService (HttpClient wrappers)
      in-memory-data.service.ts  # InMemoryDbService — seeds mock data
      mock-data/         # Seed constants (mock-books.ts, mock-collections.ts)
    features/
      books/
        pages/           # BooksListComponent, BookDetailComponent, BookCreateComponent, BookEditComponent
        components/      # BookCardComponent, BookFormComponent, AssignCollectionsPanelComponent
        state/           # actions, reducer, effects, selectors, facade
        resolvers/       # bookResolver
        books.routes.ts
      collections/
        pages/           # CollectionsListComponent, CollectionDetailComponent, ...
        components/      # CollectionCardComponent, CollectionFormComponent, AssignBooksPanelComponent
        state/           # actions, reducer, effects, selectors, facade
        resolvers/       # collectionResolver
        collections.routes.ts
      not-found/
    shared/
      components/
        search-input/        # SearchInputComponent — debounced search field with × clear button
        filter-number-input/ # FilterNumberInputComponent — number field with × between text and spinners
        filter-select/       # FilterSelectComponent — select with × left of chevron arrow
        sort-select/         # SortSelectComponent — property + direction toggle
        confirm-dialog/      # ConfirmDialogComponent — destructive-action confirmation modal
        empty-state/         # EmptyStateComponent — zero-result placeholder with icon
        loading-spinner/     # LoadingSpinnerComponent
        error-message/       # ErrorMessageComponent — retry-able error banner
      models/            # Book, BookCollection, view-models, filters, BookGenre enum
      pipes/             # TruncatePipe
    app.ts               # App shell (header + router-outlet)
    app.config.ts
    app.routes.ts
  styles/
    _variables.scss      # Design tokens
    _mixins.scss         # SCSS mixins (breakpoint, focus-ring, truncate)
    _reset.scss, _typography.scss, _buttons.scss, _forms.scss,
    _cards.scss, _layout.scss, _dialogs.scss, _empty-state.scss, _loading.scss
    styles.scss          # Entry point — @use all partials
```

### Shared input components

All interactive filter controls live in `src/app/shared/components/` and are reused across every feature that needs filtering or search.

| Component | Selector | Purpose |
|---|---|---|
| `SearchInputComponent` | `<app-search-input>` | Text search with debounce (default 300 ms) and a × clear button. Label is optional — when omitted the input falls back to `aria-label` for accessibility. Used in the books list, collections list, and both assign panels. |
| `FilterNumberInputComponent` | `<app-filter-number-input>` | Number field for range filters. The × clear button is positioned **between** the typed value and the browser's native spin buttons so neither overlaps. Accepts a `hasError` boolean for cross-field validation styling (red border + focus ring). |
| `FilterSelectComponent` | `<app-filter-select>` | Select field that renders a typed `options` array. The × clear button sits **left of the chevron arrow** so both remain clickable. Emits `''` when cleared, matching the "all" empty-option value. |
| `SortSelectComponent` | `<app-sort-select>` | Combines a sort-property select with an asc/desc direction toggle into a single output event. |

All three filter components:
- Are standalone with `ChangeDetectionStrategy.OnPush`
- Use `input()` / `output()` signal API — no `@Input()` / `@Output()` decorators
- Auto-generate an accessible `id` (overridable via `inputId` input) and associate it to the label via `[for]`
- Contain their own wrapper + positioning styles — consumers need no CSS to make the × appear correctly

### Data flow

```
Component
  → calls Facade method
    → Facade dispatches NgRx Action
      → Effect calls API Service
        → API Service calls HttpClient (intercepted by in-memory API)
          → Effect dispatches Success / Failure Action
            → Reducer updates normalised entity state
              → Selector computes derived data
                → Component receives via toSignal()
```

Components never touch `HttpClient`, API services, or `store.dispatch` directly. All store access goes through facades.

---

## State management

### State shape

```ts
interface BooksState extends EntityState<Book> {
  loading: boolean;
  error: string | null;
  filter: BooksFilter;
  sort: BooksSort;
}

interface CollectionsState extends EntityState<BookCollection> {
  loading: boolean;
  error: string | null;
  filter: CollectionsFilter;
  sort: CollectionsSort;
}
```

Entity state is normalised via `@ngrx/entity` (`EntityAdapter`) — books and collections are stored as `ids: string[]` + `entities: Record<string, T>`. No derived data (e.g. `booksCount`, `collectionNames`) is stored in state; it is computed in selectors.

### Key selectors

| Selector | Description |
|---|---|
| `selectFilteredAndSortedBooks` | Applies all filter fields + sort to `selectAllBooks` |
| `selectBooksForCollection(id)` | Books whose `collectionIds` includes `id` |
| `selectAvailableBooksForCollection(id)` | Books NOT yet in the given collection |
| `selectFilteredAndSortedCollections` | Applies search + sort (including numeric `booksCount` sort) |
| `selectCollectionViewModels` | Cross-joins books state to produce `booksCount` per collection |
| `selectCollectionViewModelById(id)` | Single collection with live `booksCount` |

`selectCollectionViewModels` is the only cross-feature selector — it imports `selectAllBooks` from the books feature (one-way dependency; books selectors do not import from collections).

### Collection delete cascade

Deleting a collection dispatches `CollectionsActions.deleteCollection`. The effect:

1. Runs `BooksEffects.buildBulkUpdate()` — a static helper that fires `PUT /api/books/:id` for every book that references the deleted collection, removing the `collectionId` from their arrays.
2. Only after all book updates succeed does it call `DELETE /api/collections/:id`.
3. On success dispatches `deleteCollectionSuccess`, which navigates to `/collections` and triggers Redux DevTools to show the cleaned-up state.

---

## Data models

```ts
interface Book {
  id: string;
  title: string;
  author: string;
  genre: BookGenre;       // typed enum — 38 values
  year: number;           // allows negative values for ancient texts (e.g. Plato: −375)
  isbn?: string;
  description?: string;
  collectionIds: string[];
  createdAt: string;      // ISO 8601
  updatedAt: string;
}

interface BookCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

`createdAt` / `updatedAt` are injected by the API service layer on `create()` and `update()` calls — the in-memory API does not compute timestamps.

### Seed data

- **24 books** (IDs `book-001` to `book-024`) spanning genres: Science Fiction, Dystopian, Classic, Programming, Philosophy, History, Self-Help, Psychology, Business, Technology.
- **8 collections**: Science Fiction, Classic Literature, Programming, Philosophy, History, Personal Development, Business & Technology, To Read Later (intentionally empty).

---

## Form validation rules

### Book form

| Field | Rules |
|---|---|
| Title | Required, max 100 characters |
| Author | Required, max 100 characters |
| Genre | Required (select from `BookGenre` enum) |
| Year | Required, min −3000, max current year |
| ISBN | Optional; when provided must be exactly 10 digits (ISBN-10, last digit may be `X`) or 13 digits (ISBN-13, no hyphens) — validated via `Validators.pattern(/^(?:\d{9}[\dX]|\d{13})$/)` |
| Description | Optional, max 1000 characters |

### Collection form

| Field | Rules |
|---|---|
| Name | Required, max 80 characters |
| Description | Optional, max 500 characters |

### Year-range cross-field validation (books list filter)

The "Year from" and "Year to" filter inputs use `FilterNumberInputComponent` and are validated together as a group: if both values are set and `yearFrom > yearTo`, both inputs receive a red border and an error message is shown below the pair — `"Year from" must be ≤ "Year to"`. The filter still dispatches to the store (producing zero results is the natural consequence of an inverted range); no silent state mutation occurs.

Validation messages appear inline on each field once it has been **touched**. Submitting an invalid form marks all controls as touched to reveal all errors at once. The submit button is disabled while the form status is not `VALID`.

---

## Known trade-offs

**No real persistence.** The in-memory API resets on every page reload. This is by design for the interview context but means no data survives a refresh.

**`angular-in-memory-web-api` does not support `PUT` returning a fresh timestamp.** `updatedAt` is therefore stamped in the API service (`new Date().toISOString()`) rather than on the server. In production, timestamps would be server-authoritative.

**Cross-feature selector coupling.** `collections.selectors.ts` imports `selectAllBooks` to compute `booksCount`. This is a deliberate one-way dependency (books → no dependency on collections; collections → reads books). A stricter alternative would be a separate `stats` feature slice, but that adds complexity for little benefit at this scale.

**Resolver redirects on load failure.** If the in-memory API returns a 404 (e.g. navigating to a deleted entity via browser history), the resolver redirects to the list page. The user loses the URL context; a toast notification would be a better user experience.

**No optimistic updates.** All mutations wait for the API response before reflecting in the UI. For a local in-memory API with a 300ms simulated delay this is fine; a production app over a real network would benefit from optimistic updates for assign/unassign operations.

---

## Future improvements

- **Optimistic UI** for assign/unassign operations — update state immediately, roll back on failure.
- **Pagination or virtual scrolling** for the book/collection lists — currently loads all entities at once.
- **Bulk operations** — select multiple books to assign/remove from a collection in one action.
- **Toast notifications** for CRUD success/failure — currently the UI relies on loading/error states only.
- **Deep-link filter state** — persist filter and sort state to query params so URLs are shareable.
- **Book cover images** — add an optional `coverUrl` field to `Book` and display thumbnails on cards.
- **Export** — download the collection as a CSV or JSON file.
- **Real backend** — replace `angular-in-memory-web-api` with a REST or GraphQL API; server-side timestamps and IDs.
- **E2E tests** — add Playwright tests for the critical user flows (create collection, assign book, delete with cascade).
- **Unit tests** — expand coverage for selectors (filtering logic, sort by booksCount), effects (cascade delete), and form components.
