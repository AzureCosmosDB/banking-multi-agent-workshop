import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../../models/session';
import { ToastService } from '../toast.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private baseUrl = environment.apiUrl;  ;
  httpClient = inject(HttpClient);

constructor( private http : HttpClient, private toastService: ToastService) { }

postCompletion(userInput: string, tenantId: string, userId: string, sessionId: string) {
  const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/user/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/completion`;

  // Creating the request body and headers
  const body =  JSON.stringify(userInput.toString()) ;
  const headers = new HttpHeaders()
    .set('Accept', 'application/json')
   .set('Content-Type', 'application/json');

  return this.http.post<any>(url, body, { headers });
}


  getChatSessions(tenantId: string, userId: string): Observable<any> {
      const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/user/${encodeURIComponent(userId)}/sessions`;
    
        const headers = new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json');
    
        return this.http.get<any>(url, { headers });
  }

  getChatSession(tenantId: string, userId: string, sessionId: string): Observable<any> {
    const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/user/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/messages`; 
  
      const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
  
      return this.http.get<any>(url, { headers });
}


  createChatSession(tenantId: string, userId: string): Observable<any> {
    const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/user/${encodeURIComponent(userId)}/sessions`;
    
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
 

    return this.http.post<any>(url, { headers });
  }

  removeSession(tenantId: string, userId: string, sessionId: string): Observable<any> {
    const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/user/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`;
  
      const headers = new HttpHeaders()
      .set('Accept', 'application/json')
       .set('Content-Type', 'application/json')
 
  
      return this.http.delete<any>(url, { headers });
  }

  renameSession(tenantId: string, userId: string, sessionId: string, newName: string): Observable<any> {
    const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/user/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/rename?newChatSessionName=${encodeURIComponent(newName)}`;
  
      const headers = new HttpHeaders()
        .set('Accept', 'application/json')
 
  
      return this.http.post<any>(url, { headers });
  }

  summarizeName(tenantId: string, userId: string, sessionId: string, conversationContext : string): Observable<any> {
    const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/user/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/summarize-name`;
  
      // Creating the request body and headers
      const body =  conversationContext ;
      const headers = new HttpHeaders()
        .set('Accept', 'application/json')
       .set('Content-Type', 'application/json')
       .set('Response-Type', 'text');
  
       return this.http.post(url, body, { headers, responseType: 'text' }); 
  }

  getCompletionDetails(tenantId: string, userId: string, sessionId: string, debugId: string): Observable<any> {
    const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/user/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/completiondetails/${encodeURIComponent(debugId)}`;
  
      const headers = new HttpHeaders()
        .set('Accept', 'application/json')
  
      return this.http.get<any>(url, { headers });
  }


}
