import {
  ChangeDetectionStrategy,
  Component,
  effect,
  OnInit,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, first, map, tap } from 'rxjs';
import { MaterialModule } from 'src/app/core/modules/material.module';
import { BookUtilsService } from 'src/app/modules/library/services/book-utils.service';
import { BooksApiService } from 'src/app/modules/library/services/books-api.service';
import { BookCanvasComponent } from 'src/app/modules/player/components/book-canvas/book-canvas.component';
import { CanvasSkeletonComponent } from 'src/app/modules/player/components/canvas-skeleton/canvas-skeleton.component';
import { AutoPlayService } from 'src/app/modules/player/services/auto-play.service';
import { DomHelperService } from 'src/app/modules/player/services/dom-helper.service';
import { OpenedBookService } from 'src/app/modules/player/services/opened-book.service';
import { BookData } from 'src/app/shared/model/fb2-book.types';
import { DocumentTitleService } from 'src/app/shared/services/document-title.service';
import {
  AppEventNames,
  EventsStateService,
} from 'src/app/shared/services/events-state.service';
import { Fb2ReaderService } from 'src/app/shared/services/fb2-reader.service';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MaterialModule, BookCanvasComponent, CanvasSkeletonComponent],
})
export class PlayerComponent implements OnInit {
  public get book(): Signal<BookData> {
    return this.openedBookService.book;
  }
  public contentLoading: Signal<boolean>;

  constructor(
    public eventState: EventsStateService,
    private openedBookService: OpenedBookService,
    private autoPlay: AutoPlayService,
    private router: Router,
    private route: ActivatedRoute,
    private domHelper: DomHelperService,
    private booksApi: BooksApiService,
    private fb2Reader: Fb2ReaderService,
    private eventStates: EventsStateService,
    private documentTitle: DocumentTitleService,
    private bookUtils: BookUtilsService
  ) {
    this.contentLoading = this.eventState.get(AppEventNames.contentLoading);

    this.router.events
      .pipe(
        takeUntilDestroyed(),
        filter(event => {
          return (
            event instanceof NavigationEnd &&
            this.router.url.match('/player') !== null
          );
        }),
        tap(async () => {
          if (this.route.snapshot.paramMap.get('id')) {
            this.loadBookFromLibrary();
          } else {
            this.domHelper.showActiveParagraph();
          }
        })
      )
      .subscribe();

    effect(() => {
      if (this.book().bookTitle) {
        this.documentTitle.setContextTitle(
          this.bookUtils.getBookFullDisplayName(this.book())
        );
      }
    });
  }

  public playParagraph(index: number): void {
    this.autoPlay.stop();
    this.autoPlay.start(index);
  }

  public ngOnInit() {
    this.loadBookFromLibrary();
  }

  private loadBookFromLibrary() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventStates.add(AppEventNames.loading);
      this.openedBookService.update({} as BookData);
      this.eventStates.add(AppEventNames.contentLoading);

      this.booksApi
        .getById(id)
        .pipe(
          first(),
          map(book => this.fb2Reader.readBookFromString(book.content)),
          tap(bookData => {
            this.eventStates.remove(AppEventNames.contentLoading);
            this.openedBookService.update(bookData);
            this.eventStates.remove(AppEventNames.loading);
          })
        )
        .subscribe();
    }
  }
}
