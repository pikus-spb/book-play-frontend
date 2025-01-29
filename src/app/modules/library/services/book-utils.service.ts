import { Injectable } from '@angular/core';
import { BookDescription } from 'src/app/modules/library/model/books-model';
import { BookData } from 'src/app/shared/model/fb2-book.types';

@Injectable({
  providedIn: 'root',
})
export class BookUtilsService {
  public getAuthorDisplayName(book: BookDescription): string {
    return `${book.authorFirstName[0]}.${book.authorLastName}`;
  }

  public getBookFullDisplayName(book: BookData): string {
    return `${book.author.first} ${book.author.last} - ${book.bookTitle}`;
  }

  public getAuthorFullDisplayName(book: BookDescription): string {
    return `${book.authorLastName} ${book.authorFirstName}`;
  }
}
