import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  resource,
} from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { AuthorBooksComponent } from 'src/app/modules/library/components/author-books/author-books.component';
import { AuthorsBooks } from 'src/app/modules/library/model/books-model';
import { BooksApiService } from 'src/app/modules/library/services/books-api.service';
import {
  AppEventNames,
  EventsStateService,
} from 'src/app/shared/services/events-state.service';

@Component({
  selector: 'library',
  imports: [CommonModule, AuthorBooksComponent, MatProgressBar],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryComponent {
  public data = resource<AuthorsBooks, unknown>({
    loader: () => this.booksApi.getAllGroupedByAuthor(),
  });

  constructor(
    public booksApi: BooksApiService,
    public eventStates: EventsStateService
  ) {
    effect(() => {
      if (this.data.isLoading()) {
        this.eventStates.add(AppEventNames.loading);
      } else {
        this.eventStates.remove(AppEventNames.loading);
      }
    });
  }

  protected readonly AppEventNames = AppEventNames;
}
