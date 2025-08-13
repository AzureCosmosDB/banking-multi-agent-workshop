import { Injectable, NgZone } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private sessionData = new BehaviorSubject<any>(null);
  sessionData$ = this.sessionData.asObservable();
  private messageSource = new BehaviorSubject<string>("Default Message");
  // Store user id (technical identifier) and user display name separately
  public loggedInUserId: string = '';
  public loggedInUserName: string = '';
  public loggedInTenant: string = '';
  currentMessage = this.messageSource.asObservable();

  constructor(private ngZone: NgZone) {
    // Load the logged in user and tenant from localStorage if they exist
  this.loggedInUserId = localStorage.getItem('loggedInUserId') || '';
  this.loggedInUserName = localStorage.getItem('loggedInUserName') || '';
    this.loggedInTenant = localStorage.getItem('loggedInTenant') || '';
  }

  changeMessage(message: string) {
    this.messageSource.next(message);
  }

  updateSession(data: any) {
      this.sessionData.next(data);
  }

  updateLoggedinUser(user: { id: string; name: string }) {
    this.loggedInUserId = user.id;
    this.loggedInUserName = user.name;
    localStorage.setItem('loggedInUserId', user.id);
    localStorage.setItem('loggedInUserName', user.name);
  }

  updateLoggedinTenant(data: any) {
    this.loggedInTenant = data;
    localStorage.setItem('loggedInTenant', data);  // Persist tenant to localStorage
  }
}
