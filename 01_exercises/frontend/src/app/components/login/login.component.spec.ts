import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppModule } from '../../app.module';
import { DataService } from '../../services/data.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  it('selects the default user and company and opens the dashboard on submit', () => {
    const data = jasmine.createSpyObj<DataService>('data', ['updateLoggedinUser', 'updateLoggedinTenant']);
    TestBed.configureTestingModule({ imports: [AppModule], providers: [{ provide: DataService, useValue: data }] });
    const navigate = spyOn(TestBed.inject(Router), 'navigate');
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(data.updateLoggedinUser).toHaveBeenCalledOnceWith('Mark');
    expect(data.updateLoggedinTenant).toHaveBeenCalledOnceWith('Contoso');

    const host: HTMLElement = fixture.nativeElement;
    host.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    expect(navigate).toHaveBeenCalledOnceWith(['/dashboard']);
  });
});
