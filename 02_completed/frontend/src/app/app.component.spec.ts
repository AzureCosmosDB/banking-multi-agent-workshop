import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { ToastService } from './services/toast.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AppModule] });
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('hosts the routed workshop pages', () => {
    expect(fixture.debugElement.query(By.directive(RouterOutlet))).not.toBeNull();
  });

  it('starts with the toast hidden', () => {
    const toast: HTMLElement = fixture.nativeElement.querySelector('.toast');
    expect(toast.classList.contains('toast-show')).toBeFalse();
  });

  it('shows an error notification and hides it after three seconds', fakeAsync(() => {
    TestBed.inject(ToastService).showMessage('Unable to load sessions', 'error');
    const toast: HTMLElement = fixture.nativeElement.querySelector('.toast');
    expect(toast.textContent).toContain('Unable to load sessions');
    expect(toast.classList.contains('toast-error')).toBeTrue();
    expect(toast.classList.contains('toast-show')).toBeTrue();

    tick(3000);
    fixture.detectChanges();
    expect(toast.classList.contains('toast-show')).toBeFalse();
  }));
});
