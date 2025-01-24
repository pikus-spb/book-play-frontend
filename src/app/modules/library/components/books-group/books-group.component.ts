import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BookCardComponent } from 'src/app/modules/library/components/book-card/book-card.component';
import { BookDescription } from 'src/app/modules/library/model/books-model';
import { BookUtilsService } from 'src/app/modules/library/services/book-utils.service';

@Component({
  selector: 'books-group',
  imports: [BookCardComponent, CommonModule],
  templateUrl: './books-group.component.html',
  styleUrls: ['./books-group.component.scss'],
})
export class BooksGroupComponent {
  @Input() books!: BookDescription[];

  constructor(public bookUtils: BookUtilsService) {}
}
