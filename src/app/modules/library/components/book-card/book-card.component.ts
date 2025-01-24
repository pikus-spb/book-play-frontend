import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/core/modules/material.module';
import { BookDescription } from 'src/app/modules/library/model/books-model';

const DEFAULT_IMAGE = '/assets/images/no-photo.jpg';

@Component({
  selector: 'book-card',
  imports: [MaterialModule, RouterModule],
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
})
export class BookCardComponent {
  @Input() book!: BookDescription;

  public getBookLogo(book: BookDescription): string {
    return book.logo || DEFAULT_IMAGE;
  }
}
