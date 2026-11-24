import { TestBed } from '@angular/core/testing';
import { AppModule } from '../../app.module';
import { DataService } from '../../services/data.service';
import { MainContentComponent } from './main-content.component';

describe('MainContentComponent', () => {
  it('welcomes the signed-in user and offers a new chat when there is no history', () => {
    TestBed.configureTestingModule({ imports: [AppModule] });
    TestBed.inject(DataService).loggedInUser = 'Sandeep';
    const fixture = TestBed.createComponent(MainContentComponent);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.welcome-message')?.textContent).toContain('Hello Sandeep!');
    expect(host.querySelector('app-chat-options')).not.toBeNull();
    expect(host.querySelector('.chat-header')).toBeNull();
  });
});
