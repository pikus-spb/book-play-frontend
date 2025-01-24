import { ScrollingModule as ExperimentalScrollingModule } from '@angular/cdk-experimental/scrolling';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { MaterialModule } from 'src/app/core/modules/material.module';
import { BookParagraphComponent } from 'src/app/modules/player/components/book-paragraph/book-paragraph.component';
import { createViewportScrollerService } from 'src/app/modules/player/services/viewport-scroller.service';
import { BookData } from 'src/app/shared/model/fb2-book.types';
import {
  AppEvents,
  EventsStateService,
} from 'src/app/shared/services/events-state.service';

import { CanvasSkeletonComponent } from '../canvas-skeleton/canvas-skeleton.component';

const PARAGRAPH_TAG = 'book-paragraph';

@Component({
  selector: 'book-canvas',
  templateUrl: './book-canvas.component.html',
  styleUrls: ['./book-canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MaterialModule,
    ScrollingModule,
    ExperimentalScrollingModule,
    BookParagraphComponent,
    CanvasSkeletonComponent,
  ],
})
export class BookCanvasComponent implements AfterViewInit, OnDestroy {
  @Input() book$?: Observable<BookData | null>;
  @Output() paragraphClick: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild('scrollViewport') viewport!: CdkVirtualScrollViewport;

  private destroyed$: Subject<void> = new Subject<void>();

  public scrolling$: Observable<boolean>;

  constructor(
    private el: ElementRef,
    public eventState: EventsStateService
  ) {
    this.scrolling$ = this.eventState.get$(AppEvents.scrollingIntoView);
  }

  public onParagraphClick(index: number): void {
    this.paragraphClick.emit(index);
  }

  ngAfterViewInit() {
    createViewportScrollerService(
      this.el,
      this.viewport,
      PARAGRAPH_TAG,
      this.destroyed$
    );
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }
}
