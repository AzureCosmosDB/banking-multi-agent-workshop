import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ToastService } from '../toast.service';
import { environment } from '../../../environments/environment';
import { Transaction } from '../../models/transaction';
import { ServiceRequest } from '../../models/service-request';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private toastService: ToastService) { }

  /**
   * Get accounts for a specific tenant and user
   * @param tenantId - The tenant identifier (e.g., 'Contoso')
   * @param userId - The user identifier (e.g., 'Mark')
   * @returns Observable<any> - Observable containing the accounts data
   */
  getAccounts(tenantId: string, userId: string): Observable<any> {
    const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/user/${encodeURIComponent(userId)}/accounts`;
    
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    return this.http.get<any>(url, { headers });
  }

  /**
   * Get specific account details
   * @param tenantId - The tenant identifier
   * @param userId - The user identifier
   * @param accountId - The account identifier
   * @returns Observable<any> - Observable containing the account details
   */
  getAccountDetails(tenantId: string, userId: string, accountId: string): Observable<any> {
    const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/user/${encodeURIComponent(userId)}/accounts/${encodeURIComponent(accountId)}`;
    
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    return this.http.get<any>(url, { headers });
  }

  /**
   * Get transactions for a specific account
   * @param tenantId - The tenant identifier (e.g., 'Contoso')
   * @param userId - The user identifier (e.g., 'Mark')
   * @param accountId - The account identifier (e.g., 'Acc001')
   * @returns Observable<Transaction[]> - Observable containing the transactions data
   */
  getTransactions(tenantId: string, userId: string, accountId: string): Observable<Transaction[]> {
    const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/user/${encodeURIComponent(userId)}/accounts/${encodeURIComponent(accountId)}/transactions`;
    
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    return this.http.get<Transaction[]>(url, { headers });
  }

  /**
   * Get service requests for a specific tenant and user
   * @param tenantId - The tenant identifier (e.g., 'Contoso')
   * @param userId - The user identifier (e.g., 'Mark')
   * @returns Observable<ServiceRequest[]> - Observable containing the service requests data
   */
  getServiceRequests(tenantId: string, userId: string): Observable<ServiceRequest[]> {
    const url = `${this.baseUrl}tenant/${encodeURIComponent(tenantId)}/servicerequests?userId=${encodeURIComponent(userId)}`;
    
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    return this.http.get<ServiceRequest[]>(url, { headers });
  }
}