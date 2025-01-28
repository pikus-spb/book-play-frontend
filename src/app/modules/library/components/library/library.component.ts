import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { MaterialModule } from 'src/app/core/modules/material.module';
import { BooksGroupComponent } from 'src/app/modules/library/components/books-group/books-group.component';
import { BookDescription } from 'src/app/modules/library/model/books-model';
import { BookUtilsService } from 'src/app/modules/library/services/book-utils.service';
import { BooksApiService } from 'src/app/modules/library/services/books-api.service';
import {
  AppEventNames,
  EventsStateService,
} from 'src/app/shared/services/events-state.service';

@Component({
  selector: 'library',
  imports: [RouterModule, MaterialModule, BooksGroupComponent],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryComponent {
  private currentLetter = 'а';
  public AppEvents = AppEventNames;

  constructor(
    public api: BooksApiService,
    public eventStates: EventsStateService,
    private router: Router,
    private route: ActivatedRoute,
    private bookUtils: BookUtilsService
  ) {
    this.route.params.subscribe(params => {
      const letter = params['letter'];
      if (this.currentLetter !== letter) {
        this.eventStates.add(AppEventNames.loading);
      }
    });
  }

  public loadBooks(): Observable<Record<string, BookDescription[]>> {
    return this.api
      .getAuthorsByLetter(
        this.route.snapshot.paramMap.get('letter') ?? this.currentLetter
      )
      .pipe(
        tap(() => {
          this.eventStates.remove(AppEventNames.loading, true);
        }),
        map((books: BookDescription[]) => {
          return books.reduce(
            (memo, book) => {
              const name = this.bookUtils.getAuthorDisplayName(book);

              memo[name] = memo[name] || [];
              memo[name].push(book);

              return memo;
            },
            {} as Record<string, BookDescription[]>
          );
        })
      );
  }

  public loadLetters(): Observable<string[]> {
    return this.api.getAllLetters().pipe(
      map((letters: string[]) => {
        return letters.sort((a, b) => {
          return a.localeCompare(b);
        });
      }),
      tap((letters: string[]) => {
        this.currentLetter = letters[0];
      })
    );
  }

  public isActiveLetter(value: string): Observable<boolean> {
    return this.route.params.pipe(
      map(params => {
        return value === (params['letter'] ?? this.currentLetter);
      })
    );
  }
}
