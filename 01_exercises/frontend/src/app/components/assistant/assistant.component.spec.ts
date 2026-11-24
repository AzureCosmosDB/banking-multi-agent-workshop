import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppModule } from '../../app.module';
import { SessionService } from '../../services/conversations-service/conversations.service';
import { DataService } from '../../services/data.service';
import { AssistantComponent } from './assistant.component';

describe('AssistantComponent', () => {
  it('expands the assistant panel when its header is clicked', () => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{ provide: SessionService, useValue: { getChatSessions: () => of([]) } }],
    });
    TestBed.inject(DataService).loggedInUser = 'Mark';
    const fixture = TestBed.createComponent(AssistantComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('app-main-content')).toBeNull();

    host.querySelector<HTMLElement>('.assistant-header')!.click();
    fixture.detectChanges();
    expect(host.querySelector('app-main-content')).not.toBeNull();
  });
});
