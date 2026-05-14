import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BookCollection,
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from '../../shared/models/book-collection.model';

@Injectable({ providedIn: 'root' })
export class CollectionsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/collections';

  getAll(): Observable<BookCollection[]> {
    return this.http.get<BookCollection[]>(this.baseUrl);
  }

  getById(id: string): Observable<BookCollection> {
    return this.http.get<BookCollection>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateCollectionPayload): Observable<BookCollection> {
    const now = new Date().toISOString();
    return this.http.post<BookCollection>(this.baseUrl, {
      ...payload,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(payload: UpdateCollectionPayload): Observable<BookCollection> {
    return this.http.put<BookCollection>(`${this.baseUrl}/${payload.id}`, {
      ...payload,
      updatedAt: new Date().toISOString(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
