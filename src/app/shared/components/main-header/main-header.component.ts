import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BehaviorSubject, merge, Subject, tap } from 'rxjs';
import { MaterialModule } from 'src/app/core/modules/material.module';
import { PlayerButtonComponent } from 'src/app/modules/player/components/player-button/player-button.component';
import { OpenedBookService } from 'src/app/modules/player/services/opened-book.service';

@Component({
  selector: 'main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MaterialModule, PlayerButtonComponent],
})
export class MainHeaderComponent {
  @Output() menuClick = new EventEmitter<void>();
  public showPlayerButton$: Subject<boolean> = new BehaviorSubject(false);

  constructor(
    private openedBookService: OpenedBookService,
    private router: Router
  ) {
    merge(toObservable(this.openedBookService.book), this.router.events)
      .pipe(
        takeUntilDestroyed(),
        tap(() => {
          this.showPlayerButton$.next(
            openedBookService.book !== null &&
              router.url.indexOf('/player') !== -1
          );
        })
      )
      .subscribe();
  }
}
