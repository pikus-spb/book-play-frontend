import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, first, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { MaterialModule } from 'src/app/core/modules/material.module';
import { BookCanvasComponent } from 'src/app/modules/library/components/book-canvas/book-canvas.component';
import { CanvasSkeletonComponent } from 'src/app/modules/library/components/canvas-skeleton/canvas-skeleton.component';
import { BookUtilsService } from 'src/app/modules/library/services/book-utils.service';
import { BooksApiService } from 'src/app/modules/library/services/books-api.service';
import { AutoPlayService } from 'src/app/modules/player/services/auto-play.service';
import { DomHelperService } from 'src/app/modules/player/services/dom-helper.service';
import { OpenedBookService } from 'src/app/modules/player/services/opened-book.service';
import { BookData } from 'src/app/shared/model/fb2-book.types';
import { DocumentTitleService } from 'src/app/shared/services/document-title.service';
import {
  AppEvents,
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
export class PlayerComponent implements OnInit, OnDestroy {
  private _destroyed$: Subject<void> = new Subject<void>();
  public book$?: Observable<BookData | null>;
  public contentLoading$: Observable<boolean>;

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
    this.contentLoading$ = this.eventState.get$(AppEvents.contentLoading);

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

    this.book$ = this.openedBookService.book$;
  }

  private loadBookFromLibrary() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventStates.add(AppEvents.loading);
      this.openedBookService.update(null);
      this.eventStates.add(AppEvents.contentLoading);

      this.booksApi
        .getById(id)
        .pipe(
          first(),
          map(book => this.fb2Reader.readBookFromString(book.content)),
          tap(bookData => {
            this.eventStates.remove(AppEvents.contentLoading);
            this.openedBookService.update(bookData);
            this.eventStates.remove(AppEvents.loading);
          })
        )
        .subscribe();
    }
  }

  public playParagraph(index: number): void {
    this.autoPlay.stop();
    this.autoPlay.start(index);
  }

  ngOnInit() {
    this.book$ = this.openedBookService.book$;
    this.loadBookFromLibrary();
    this.book$
      .pipe(
        takeUntil(this._destroyed$),
        tap(book => {
          if (book) {
            this.documentTitle.setContextTitle(
              this.bookUtils.getBookFullDisplayName(book)
            );
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this._destroyed$.next();
  }
}
