import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AppEventNames,
  EventsStateService,
} from 'src/app/shared/services/events-state.service';

@Component({
  selector: 'welcome',
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  constructor(private eventStates: EventsStateService) {}

  public runFileUpload(): void {
    this.eventStates.add(AppEventNames.runUploadFile);
  }
}
