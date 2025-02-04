import {
  ComponentRef,
  Directive,
  effect,
  EmbeddedViewRef,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { LoadingIndicatorComponent } from 'src/app/shared/components/loading-indicator/loading-indicator.component';
import {
  AppEventNames,
  EventsStateService,
} from 'src/app/shared/services/events-state.service';

@Directive({
  selector: '[loadingThenShow]',
})
export class LoadingThenShowDirective {
  @Input() loadingThenShow!: TemplateRef<unknown>;

  private loadingComponent?: ComponentRef<LoadingIndicatorComponent> | null =
    null;
  private embeddedView?: EmbeddedViewRef<unknown>;
  private embeddedViewThen?: EmbeddedViewRef<unknown>;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private template: TemplateRef<unknown>,
    private eventStates: EventsStateService
  ) {
    effect(async () => {
      if (!this.embeddedView) {
        this.embeddedView = this.viewContainerRef.createEmbeddedView(
          this.template
        );
      }
      if (this.eventStates.get(AppEventNames.loading)()) {
        if (this.loadingComponent !== null) {
          this.loadingComponent = this.viewContainerRef.createComponent(
            LoadingIndicatorComponent
          );
        }
      } else {
        if (this.loadingComponent) {
          this.loadingComponent.destroy();
          this.loadingComponent = null;
        }
        if (!this.embeddedViewThen) {
          this.embeddedViewThen = this.viewContainerRef.createEmbeddedView(
            this.loadingThenShow
          );
        }
      }
    });
  }
}
