import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { MOCK_BOOKS } from './mock-data/mock-books';
import { MOCK_COLLECTIONS } from './mock-data/mock-collections';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    return {
      books: MOCK_BOOKS,
      collections: MOCK_COLLECTIONS,
    };
  }

  genId<T extends { id: string }>(_collection: T[]): string {
    return crypto.randomUUID();
  }
}
