import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, retry, Subscription } from 'rxjs';
import { HttpUtilsService } from 'src/app/shared/services/http-utils.service';

const AUDIO_API_URL = 'http://192.168.31.200:8181/tts';
const AUDIO_HEADERS = new HttpHeaders({
  'Content-Type': 'application/x-www-form-urlencoded',
});
const RETRY_NUMBER = 3;

@Injectable({
  providedIn: 'root',
})
export class TtsApiService {
  private dictionary: Record<string, ReplaySubject<Blob>> = {};
  // http requests subscription list, is needed for an ability to cancel not needed http requests
  private subscriptions: Map<Subscription, ReplaySubject<Blob>> = new Map();

  constructor(
    private http: HttpClient,
    private httpUtils: HttpUtilsService
  ) {}

  private _getVoice(text: string): ReplaySubject<Blob> {
    text = encodeURIComponent(text);

    const options = { text };
    const postParams = this.httpUtils.createQueryParameters(options);
    const result$ = new ReplaySubject<Blob>(1);

    this.subscriptions.set(
      this.http
        .post(AUDIO_API_URL, postParams, {
          headers: AUDIO_HEADERS,
          responseType: 'blob',
        })
        .pipe(retry(RETRY_NUMBER))
        .subscribe((blob: Blob) => {
          result$.next(blob);
        }),
      result$
    );

    return result$;
  }

  public cancelAllVoiceRequests(): void {
    this.subscriptions.forEach(
      (result: ReplaySubject<Blob>, http: Subscription) => {
        http.unsubscribe();
        result.unsubscribe();
      }
    );
    this.subscriptions = new Map();
  }

  public textToSpeech(text: string): Observable<Blob> {
    if (!this.dictionary[text] || this.dictionary[text].closed) {
      this.dictionary[text] = this._getVoice(text);
    }

    return this.dictionary[text];
  }
}
