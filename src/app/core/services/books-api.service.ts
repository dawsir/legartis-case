import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, CreateBookPayload, UpdateBookPayload } from '../../shared/models/book.model';

@Injectable({ providedIn: 'root' })
export class BooksApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/books';

  getAll(): Observable<Book[]> {
    return this.http.get<Book[]>(this.baseUrl);
  }

  getById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateBookPayload): Observable<Book> {
    const now = new Date().toISOString();
    return this.http.post<Book>(this.baseUrl, {
      ...payload,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(payload: UpdateBookPayload): Observable<Book> {
    return this.http.put<Book>(`${this.baseUrl}/${payload.id}`, {
      ...payload,
      updatedAt: new Date().toISOString(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
