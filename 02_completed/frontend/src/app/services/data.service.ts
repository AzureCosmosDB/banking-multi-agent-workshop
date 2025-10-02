import { Injectable, NgZone } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private sessionData = new BehaviorSubject<any>(null);
  sessionData$ = this.sessionData.asObservable();
  private messageSource = new BehaviorSubject<string>("Default Message");
  private predefinedMessageSource = new BehaviorSubject<string>("");
  public loggedInUser: string = '';
  public loggedInTenant: string = '';
  currentMessage = this.messageSource.asObservable();
  predefinedMessage$ = this.predefinedMessageSource.asObservable();

  constructor(private ngZone: NgZone) {
    // Load the logged in user and tenant from localStorage if they exist
    this.loggedInUser = localStorage.getItem('loggedInUser') || '';
    this.loggedInTenant = localStorage.getItem('loggedInTenant') || '';
  }

  changeMessage(message: string) {
    this.messageSource.next(message);
  }

  setPredefinedMessage(message: string) {
    this.predefinedMessageSource.next(message);
  }

  updateSession(data: any) {     
      this.sessionData.next(data);
  }

  updateLoggedinUser(data: any) {
    this.loggedInUser = data;
    localStorage.setItem('loggedInUser', data);  // Persist user to localStorage
  }

  updateLoggedinTenant(data: any) {
    this.loggedInTenant = data;
    localStorage.setItem('loggedInTenant', data);  // Persist tenant to localStorage
  }
}
