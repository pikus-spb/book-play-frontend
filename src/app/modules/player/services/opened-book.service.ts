import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { CursorPositionStoreService } from 'src/app/modules/player/services/cursor-position-store.service';
import { BookData } from 'src/app/shared/model/fb2-book.types';
import { BookHelperService } from 'src/app/shared/services/book-helper.service';
import { IndexedDbBookManagerService } from './indexed-db-book-manager.service';
import { IndexedDbStorageService } from './indexed-db-storage.service';

@Injectable({
  providedIn: 'root',
})
export class OpenedBookService {
  private indexedDBBookManager: IndexedDbBookManagerService;

  public book: WritableSignal<BookData> = signal<BookData>({} as BookData);

  constructor(
    private cursorService: CursorPositionStoreService,
    private bookHelper: BookHelperService
  ) {
    this.indexedDBBookManager = new IndexedDbBookManagerService(
      inject(IndexedDbStorageService),
      this
    );
    this.indexedDBBookManager.watchOpenedBook();
  }

  update(value: BookData): void {
    this.book.set(value);

    if (value.bookTitle) {
      this.cursorService.setCursorName(this.bookHelper.getBookHashKey(value));
    }
  }
}
