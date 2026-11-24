import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppModule } from '../../app.module';
import { LogPopupComponent } from './log-popup.component';

describe('LogPopupComponent', () => {
  it('shows the supplied log and closes the dialog on click', () => {
    const dialog = jasmine.createSpyObj<MatDialogRef<LogPopupComponent>>('dialog', ['close']);
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [
        { provide: MatDialogRef, useValue: dialog },
        { provide: MAT_DIALOG_DATA, useValue: [{ timeStamp: '09:00', key: 'agent', value: 'sales' }] },
      ],
    });
    const fixture = TestBed.createComponent(LogPopupComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.log-key')?.textContent).toBe('agent');
    expect(host.querySelector('.log-value')?.textContent).toBe('sales');

    host.querySelector('button')!.click();
    expect(dialog.close).toHaveBeenCalledTimes(1);
  });
});
