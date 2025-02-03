import { CommonModule, KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { BookDescription } from 'src/app/modules/library/model/books-model';

const MAX_BOOKS_PER_AUTHOR = 8;

@Component({
  selector: 'author-books',
  imports: [CommonModule, MatCard, MatCardTitle, MatCardHeader, MatCardContent],
  templateUrl: './author-books.component.html',
  styleUrl: './author-books.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorBooksComponent {
  @Input() data!: KeyValue<string, BookDescription[]>;

  protected readonly MAX_BOOKS_PER_AUTHOR = MAX_BOOKS_PER_AUTHOR;
}
