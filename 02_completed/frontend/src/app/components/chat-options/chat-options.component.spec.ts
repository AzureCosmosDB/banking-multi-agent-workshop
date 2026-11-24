import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AppModule } from '../../app.module';
import { DataService } from '../../services/data.service';
import { ChatOptionsComponent } from './chat-options.component';

describe('ChatOptionsComponent', () => {
  it('creates a session and selects the prompt for a suggested topic', () => {
    TestBed.configureTestingModule({ imports: [AppModule], providers: [provideHttpClientTesting()] });
    const data = TestBed.inject(DataService);
    data.loggedInTenant = 'Contoso';
    data.loggedInUser = 'Mark';
    const selectPrompt = spyOn(data, 'setPredefinedMessage');
    const fixture = TestBed.createComponent(ChatOptionsComponent);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    host.querySelector<HTMLButtonElement>('.topic-btn')!.click();
    const http = TestBed.inject(HttpTestingController);
    const url = `${environment.apiUrl}tenant/Contoso/user/Mark/sessions`;
    http.expectOne({ method: 'POST', url }).flush({ sessionId: 'chat-1' });
    http.expectOne({ method: 'GET', url }).flush([]);
    expect(selectPrompt).toHaveBeenCalledOnceWith('What is my account balance?');
    http.verify();
  });
});
