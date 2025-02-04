import {
  Component,
  DebugElement,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EventsStateService } from 'src/app/shared/services/events-state.service';
import { LoadingThenShowDirective } from './loading-then-show.directive';

@Component({
  selector: 'test-component',
  template:
    '<ng-template #test1 [loadingThenShow]="test2"></ng-template><ng-template #test2></ng-template><div *ngIf="false; else test1"></div>',
  standalone: true,
  imports: [LoadingThenShowDirective],
})
class TestComponent {}

// Learn hor to test structural directives

xdescribe('LoadingThenShowDirective', () => {
  let directive: LoadingThenShowDirective;
  let directiveEl: DebugElement;
  let fixture: ComponentFixture<unknown>;
  let viewContainerRefMock: unknown;
  let templateMock: TemplateRef<unknown>;
  let eventsStateServiceMock: unknown;

  beforeEach(() => {
    // Mock the dependencies
    viewContainerRefMock = {
      createEmbeddedView: jasmine.createSpy('createEmbeddedView'),
      clear: jasmine.createSpy('clear'),
      createComponent: jasmine
        .createSpy('createComponent')
        .and.returnValue({ destroy: jasmine.createSpy('destroy') }),
    };

    templateMock = {} as TemplateRef<unknown>;

    eventsStateServiceMock = {
      get: jasmine.createSpy('get').and.returnValue(false),
    };

    TestBed.configureTestingModule({
      imports: [LoadingThenShowDirective, TestComponent],
      providers: [
        { provide: ViewContainerRef, useValue: viewContainerRefMock },
        { provide: TemplateRef, useValue: templateMock },
        { provide: EventsStateService, useValue: eventsStateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    directiveEl = fixture.debugElement.query(
      By.directive(LoadingThenShowDirective)
    );
    directive = directiveEl.injector.get(LoadingThenShowDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  // it('should initialize the embedded view when not loading', () => {
  //   eventsStateServiceMock.get.and.returnValue(false);
  //   directive.loadingThenShow = templateMock;
  //   fixture.detectChanges();
  //   expect(viewContainerRefMock.createEmbeddedView).toHaveBeenCalledWith(
  //     templateMock
  //   );
  // });
  //
  // it('should create a loading component when loading', () => {
  //   eventsStateServiceMock.get.and.returnValue(true);
  //   directive.loadingThenShow = templateMock;
  //   fixture.detectChanges();
  //   expect(viewContainerRefMock.createComponent).toHaveBeenCalledWith(
  //     LoadingIndicatorComponent
  //   );
  // });
  //
  // it('should clear the view and destroy loading component when not loading', () => {
  //   eventsStateServiceMock.get.and.returnValue(false);
  //   directive.loadingThenShow = templateMock;
  //   fixture.detectChanges();
  //   expect(viewContainerRefMock.clear).not.toHaveBeenCalled();
  // });
  //
  // it('should clear the loading component when not loading and view is already created', () => {
  //   eventsStateServiceMock.get.and.returnValue(false);
  //   directive.loadingThenShow = templateMock;
  //   fixture.detectChanges();
  //   expect(viewContainerRefMock.clear).not.toHaveBeenCalled();
  // });
});
