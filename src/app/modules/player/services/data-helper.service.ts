import { Injectable } from '@angular/core';
import {
  AudioPreloadingService,
  PRELOAD_EXTRA,
} from 'src/app/modules/player/services/audio-preloading.service';
import { AudioStorageService } from 'src/app/modules/player/services/audio-storage.service';
import { CursorPositionStoreService } from 'src/app/modules/player/services/cursor-position-store.service';
import {
  AppEvents,
  EventsStateService,
} from 'src/app/shared/services/events-state.service';

@Injectable({
  providedIn: 'root',
})
export class DataHelperService {
  constructor(
    private audioStorage: AudioStorageService,
    private eventStateService: EventsStateService,
    private cursorService: CursorPositionStoreService,
    private preloadHelper: AudioPreloadingService
  ) {}

  public async ensureAudioDataReady() {
    if (!this.audioStorage.get(this.cursorService.position)) {
      this.eventStateService.add(AppEvents.loading);

      await this.preloadHelper.preloadParagraph(
        this.cursorService.position,
        PRELOAD_EXTRA.min
      );

      this.eventStateService.remove(AppEvents.loading);
    }
  }
}
