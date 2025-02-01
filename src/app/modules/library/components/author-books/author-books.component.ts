import { CommonModule, KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BookDescription } from 'src/app/modules/library/model/books-model';

@Component({
  selector: 'author-books',
  imports: [CommonModule],
  templateUrl: './author-books.component.html',
  styleUrl: './author-books.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorBooksComponent {
  @Input() data!: KeyValue<string, BookDescription[]>;
}
