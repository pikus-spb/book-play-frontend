import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatListItem } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { MaterialModule } from 'src/app/core/modules/material.module';
import { OpenedBookService } from 'src/app/modules/player/services/opened-book.service';
import { UploadFileDirective } from 'src/app/shared/directives/upload-file.directive';
import {
  AppEvents,
  EventsStateService,
} from 'src/app/shared/services/events-state.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, MaterialModule, UploadFileDirective],
})
export class MainMenuComponent {
  @ViewChild('uploadButton') uploadButton?: MatListItem;

  constructor(
    private fileService: FileUploadService,
    private eventStates: EventsStateService,
    public openedBookService: OpenedBookService
  ) {
    this.eventStates
      .get$(AppEvents.runUploadFile)
      .pipe(
        takeUntilDestroyed(),
        filter(value => value)
      )
      .subscribe(() => {
        this.uploadButton?._elementRef.nativeElement.click();
      });
  }

  fileUploaded(files?: FileList) {
    this.fileService.parseNewFile(files);
  }
}
