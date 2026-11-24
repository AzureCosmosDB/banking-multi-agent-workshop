import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AppModule } from '../../app.module';
import { DataService } from '../../services/data.service';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  it('replaces the loading indicator with sessions for the signed-in user', () => {
    TestBed.configureTestingModule({ imports: [AppModule], providers: [provideHttpClientTesting()] });
    const data = TestBed.inject(DataService);
    data.loggedInTenant = 'Contoso';
    data.loggedInUser = 'Sandeep';
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.loading-section')).not.toBeNull();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne({ method: 'GET', url: `${environment.apiUrl}tenant/Contoso/user/Sandeep/sessions` })
      .flush([{ sessionId: 'session-1', name: 'Recent payments' }]);
    fixture.detectChanges();
    expect(host.querySelector('.loading-section')).toBeNull();
    expect(host.querySelector('.session-name')?.textContent?.trim()).toBe('Recent payments');
    http.verify();
  });
});
