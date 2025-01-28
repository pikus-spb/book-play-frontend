import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry, shareReplay } from 'rxjs';

import { Book, BookDescription } from '../model/books-model';

const protocol = document.location.protocol;
const port = protocol === 'https:' ? 8443 : 8282;
const API_URL = protocol + '//book-play.ru:' + port;
const RETRY_NUMBER = 3;

enum RequestUrlSuffix {
  letters = '/get-author-letters',
  byLetter = '/get-authors-by-letter/',
  byId = '/get-by-id/',
}

@Injectable({
  providedIn: 'root',
})
export class BooksApiService {
  private requestCache: Map<
    string,
    Observable<BookDescription[] | string[] | Book | undefined>
  > = new Map();

  constructor(private http: HttpClient) {}

  public getAllLetters(): Observable<string[]> {
    if (this.requestCache.get(RequestUrlSuffix.letters) === undefined) {
      const observable = this.http
        .get<string[]>(API_URL + RequestUrlSuffix.letters)
        .pipe(retry(RETRY_NUMBER), shareReplay(1));

      this.requestCache.set(RequestUrlSuffix.letters, observable);
    }

    return this.requestCache.get(RequestUrlSuffix.letters) as Observable<
      string[]
    >;
  }

  public getAuthorsByLetter(letter: string): Observable<BookDescription[]> {
    const suffix = RequestUrlSuffix.byLetter + letter;
    if (this.requestCache.get(suffix) === undefined) {
      const observable = this.http
        .get<BookDescription[]>(API_URL + suffix)
        .pipe(retry(RETRY_NUMBER), shareReplay(1));

      this.requestCache.set(suffix, observable);
    }

    return this.requestCache.get(suffix) as Observable<BookDescription[]>;
  }

  public getById(id: string): Observable<Book> {
    const suffix = RequestUrlSuffix.byId + id;

    if (this.requestCache.get(suffix) === undefined) {
      const observable = this.http
        .get<Book>(API_URL + suffix)
        .pipe(retry(RETRY_NUMBER), shareReplay(1));

      this.requestCache.set(suffix, observable);
    }

    return this.requestCache.get(suffix) as Observable<Book>;
  }
}
