import { Injectable } from '@angular/core';
import { CursorPositionStoreService } from 'src/app/modules/player/services/cursor-position-store.service';
import { OpenedBookService } from 'src/app/modules/player/services/opened-book.service';
import { viewportScroller } from 'src/app/modules/player/services/viewport-scroller.service';
import {
  AppEvents,
  EventsStateService,
} from 'src/app/shared/services/events-state.service';

@Injectable({
  providedIn: 'root',
})
export class ScrollPositionHelperService {
  constructor(
    private eventStateService: EventsStateService,
    private cursorService: CursorPositionStoreService,
    private openedBook: OpenedBookService
  ) {}

  public cursorPositionIsValid(): boolean {
    return (
      this.cursorService.position <
      (this.openedBook.book().bookTitle
        ? this.openedBook.book().paragraphs.length
        : 0)
    );
  }

  public async scrollToIndex(cursorIndex: number): Promise<void> {
    if (viewportScroller) {
      this.eventStateService.add(AppEvents.scrollingIntoView);
      await viewportScroller.scrollToIndex(cursorIndex);
      this.eventStateService.remove(AppEvents.scrollingIntoView);
    }
  }
}
