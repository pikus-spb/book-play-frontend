import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ViewChild,
} from '@angular/core';
import { MatListItem } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/core/modules/material.module';
import { OpenedBookService } from 'src/app/modules/player/services/opened-book.service';
import { UploadFileDirective } from 'src/app/shared/directives/upload-file.directive';
import {
  AppEventNames,
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
    effect(() => {
      if (this.eventStates.get(AppEventNames.runUploadFile)()) {
        this.uploadButton?._elementRef.nativeElement.click();
      }
    });
  }

  fileUploaded(files?: FileList) {
    this.fileService.parseNewFile(files);
  }
}
