import { effect } from '@angular/core';
import {
  DBBookData,
  IndexedDbStorageService,
} from './indexed-db-storage.service';
import { OpenedBookService } from './opened-book.service';

export class IndexedDbBookManagerService {
  constructor(
    private indexedDbStorage: IndexedDbStorageService,
    private openedBook: OpenedBookService
  ) {
    effect(() => {
      if (this.openedBook.book()) {
        this.indexedDbStorage.set(JSON.stringify(this.openedBook.book()));
      }
    });
  }

  public watchOpenedBook() {
    this.indexedDbStorage.get().then((data: DBBookData) => {
      if (data && data.content.length > 0) {
        const bookData = JSON.parse(data.content);
        this.openedBook.update(bookData);
      }
    });
  }
}
