import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  firstValueFrom,
  fromEvent,
  map,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { MaterialModule } from 'src/app/core/modules/material.module';
import { TtsApiService } from 'src/app/modules/player/services/tts-api.service';
import { Base64HelperService } from 'src/app/shared/services/base64-helper.service';
import {
  AppEventNames,
  EventsStateService,
} from 'src/app/shared/services/events-state.service';

@Component({
  selector: 'voice',
  imports: [MaterialModule],
  templateUrl: './voice.component.html',
  styleUrls: ['./voice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VoiceComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('input') input!: ElementRef;

  public text = '';
  public valid$: Subject<boolean> = new BehaviorSubject(false);

  constructor(
    private speechService: TtsApiService,
    private base64Helper: Base64HelperService,
    private eventsState: EventsStateService
  ) {}

  private addAudioElement(base64Data: string, text: string): void {
    const audio = document.createElement('audio');
    audio.setAttribute('controls', 'true');
    audio.setAttribute('autoplay', 'true');
    audio.setAttribute('class', 'preview');
    audio.src = base64Data;

    const textNode = document.createElement('span');
    textNode.innerText = text;

    this.container.nativeElement.appendChild(textNode);
    this.container.nativeElement.appendChild(audio);
  }

  async voice() {
    this.eventsState.add(AppEventNames.loading);

    const data = await firstValueFrom(
      this.speechService.textToSpeech(this.text).pipe(
        switchMap((blob: Blob) => {
          return this.base64Helper.blobToBase64(blob);
        })
      )
    );
    this.addAudioElement(data, this.text);

    this.eventsState.remove(AppEventNames.loading);
  }

  ngAfterViewInit() {
    fromEvent<KeyboardEvent>(this.input.nativeElement, 'input')
      .pipe(
        map(event => (event.target as HTMLInputElement).value),
        distinctUntilChanged(),
        tap((value: string) => {
          value = value.trim();
          this.text = value;
          this.valid$.next(value.length > 0);
        })
      )
      .subscribe();
  }
}
