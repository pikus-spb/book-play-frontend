import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import {
  BehaviorSubject,
  debounceTime,
  filter,
  firstValueFrom,
  fromEvent,
  Observable,
  shareReplay,
  tap,
} from 'rxjs';
import { AudioPlayerService } from 'src/app/modules/player/services/audio-player.service';
import { AudioStorageService } from 'src/app/modules/player/services/audio-storage.service';
import { CursorPositionStoreService } from 'src/app/modules/player/services/cursor-position-store.service';
import { DomHelperService } from 'src/app/modules/player/services/dom-helper.service';
import { OpenedBookService } from 'src/app/modules/player/services/opened-book.service';
import { SpeechService } from 'src/app/modules/voice/services/speech.service';
import {
  AppEvents,
  EventsStateService,
} from 'src/app/shared/services/events-state.service';
import { AudioPreloadingService } from './audio-preloading.service';
import { DataHelperService } from './data-helper.service';
import { ScrollPositionHelperService } from './scroll-position-helper.service';

@Injectable({
  providedIn: 'root',
})
export class AutoPlayService {
  private _paused$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true
  );

  public paused$: Observable<boolean> = this._paused$.pipe(shareReplay(1));

  constructor(
    private router: Router,
    private openedBook: OpenedBookService,
    private audioPlayer: AudioPlayerService,
    private speechService: SpeechService,
    private audioStorage: AudioStorageService,
    private eventStateService: EventsStateService,
    private dataHelper: DataHelperService,
    private preloadingService: AudioPreloadingService,
    private scrollPositionHelper: ScrollPositionHelperService,
    private cursorService: CursorPositionStoreService,
    private domHelper: DomHelperService,
    private preloadHelper: AudioPreloadingService
  ) {
    this.router.events
      .pipe(
        takeUntilDestroyed(),
        filter(event => {
          return event instanceof NavigationEnd;
        }),
        tap(async () => {
          if (!this.router.url.match('player')) {
            this.stop();
          }
        })
      )
      .subscribe();

    this.cursorService.position$
      .pipe(
        takeUntilDestroyed(),
        tap(async () => {
          this.domHelper.showActiveParagraph();
          this.preloadHelper.preloadParagraph(this.cursorService.position);
        })
      )
      .subscribe();

    fromEvent(window, 'resize')
      .pipe(
        takeUntilDestroyed(),
        tap(() => {
          this.domHelper.showActiveParagraph();
        })
      )
      .subscribe();

    this.openedBook.book$
      .pipe(
        takeUntilDestroyed(),
        filter(book => Boolean(book)),
        debounceTime(300),
        tap(() => {
          this.stop();
          this.domHelper.showActiveParagraph();
        })
      )
      .subscribe();
  }

  private resume(): void {
    this.audioPlayer.play();
    this._paused$.next(false);
  }

  private pause(): void {
    this.audioPlayer.pause();
    this._paused$.next(true);
  }

  public stop(): void {
    this.audioPlayer.stop();
    this._paused$.next(true);
  }

  public toggle(): void {
    if (this.audioPlayer.paused) {
      if (this.audioPlayer.stopped) {
        this.start();
      } else {
        this.resume();
      }
    } else {
      this.pause();
    }
  }

  public async start(index = -1) {
    if (this.preloadingService.initialized) {
      this.speechService.cancelAllVoiceRequests();
    }
    if (index >= 0) {
      this.cursorService.position = index;
    }
    this._paused$.next(false);
    this.eventStateService.remove(AppEvents.loading, true);

    do {
      const isScrollingNow = await firstValueFrom(
        this.eventStateService.get$(AppEvents.scrollingIntoView)
      );
      if (isScrollingNow) {
        // wait until scrolling is false
        await firstValueFrom(
          this.eventStateService
            .get$(AppEvents.scrollingIntoView)
            .pipe(filter(value => !value))
        );
      }

      await this.dataHelper.ensureAudioDataReady();

      this.audioPlayer.setAudio(
        this.audioStorage.get(this.cursorService.position)
      );

      if (await this.audioPlayer.play()) {
        this.cursorService.position++;
      }
    } while (
      this.scrollPositionHelper.cursorPositionIsValid() &&
      !this.audioPlayer.stopped
    );
  }
}
