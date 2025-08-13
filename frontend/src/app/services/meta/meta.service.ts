import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MetaUser {
  id: string;
  name: string;
  tenantId: string;
}

@Injectable({ providedIn: 'root' })
export class MetaService {
  // Use environment.apiUrl (e.g. http://localhost:8000/) to hit Python backend directly
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<MetaUser[]> {
  return this.http.get<MetaUser[]>(`${this.baseUrl}meta/users`).pipe(
      map(users => users.sort((a,b) => a.name.localeCompare(b.name)))
    );
  }

  getTenants(): Observable<string[]> {
  return this.http.get<string[]>(`${this.baseUrl}meta/tenants`).pipe(
      map(list => list.sort())
    );
  }
}
