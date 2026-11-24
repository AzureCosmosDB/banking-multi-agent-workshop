import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  it('shows the overlay only while loading', () => {
    TestBed.configureTestingModule({ declarations: [LoadingSpinnerComponent], imports: [CommonModule] });
    const fixture = TestBed.createComponent(LoadingSpinnerComponent);
    const loading = TestBed.inject(LoadingService);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.loading-overlay')).toBeNull();

    loading.show();
    fixture.detectChanges();
    expect(host.querySelector('.loading-overlay')).not.toBeNull();

    loading.hide();
    fixture.detectChanges();
    expect(host.querySelector('.loading-overlay')).toBeNull();
  });
});
