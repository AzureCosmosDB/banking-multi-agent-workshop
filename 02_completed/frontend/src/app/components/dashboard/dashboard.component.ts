import { Component, OnInit } from '@angular/core';
import { AccountsService } from '../../services/accounts/accounts.service';
import { DataService } from '../../services/data.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { CardLogoService } from '../../services/card-logo.service';
import { Account, AccountCard, CardType } from '../../models/account';
import { Transaction, TransactionDisplay } from '../../models/transaction';
import { ServiceRequest, ServiceRequestDisplay } from '../../models/service-request';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  accountCards: AccountCard[] = [
    {
      id: 'ACC001',
      accountNumber: '1234567890123456',
      balance: '$5,200.78',
      cardNumber: '4234 5678 9012 3456',
      name : 'John Doe',
      accountId: 'ACC001',
      accountType: 'Checking',
      limit: '$10,000.00',
      accountStatus: 'Active',
      cardType: CardType.Visa
    },
    {
      id: 'ACC002',
      accountNumber: '1224567890123458',
      balance: '$8,750.32',
      cardNumber: '5224 5678 9012 3458',
      name: 'John Doe',
      accountId: 'ACC002',
      accountType: 'Savings',
      limit: '$5,000.00',
      accountStatus: 'Active',
      cardType: CardType.MasterCard
    }
  ];

  accounts: Account[] = [];
  isLoadingAccounts: boolean = false;
  isLoadingTransactions: boolean = false;
  isLoadingServiceRequests: boolean = false;

  latestTransactions: TransactionDisplay[] = [
    { 
      id: 'TXN001', 
      description: 'Grocery Shopping', 
      amount: '-$125.99', 
      type: 'debit', 
      date: '02/08/2025',
      balance: '$52,000.00',
      transactionDateTime: '2025-02-08T18:10:00Z'
    },
    { 
      id: 'TXN002', 
      description: 'Salary Deposit', 
      amount: '+$2,500.00', 
      type: 'credit', 
      date: '02/07/2025',
      balance: '$52,125.99',
      transactionDateTime: '2025-02-07T09:00:00Z'
    },
    { 
      id: 'TXN003', 
      description: 'Online Transfer', 
      amount: '-$300.00', 
      type: 'debit', 
      date: '02/06/2025',
      balance: '$49,625.99',
      transactionDateTime: '2025-02-06T14:30:00Z'
    },
    { 
      id: 'TXN004', 
      description: 'ATM Withdrawal', 
      amount: '-$100.00', 
      type: 'debit', 
      date: '02/05/2025',
      balance: '$49,925.99',
      transactionDateTime: '2025-02-05T16:45:00Z'
    },
    { 
      id: 'TXN005', 
      description: 'Interest Credit', 
      amount: '+$15.50', 
      type: 'credit', 
      date: '02/01/2025',
      balance: '$50,025.99',
      transactionDateTime: '2025-02-01T00:00:00Z'
    }
  ];

  serviceRequests: ServiceRequestDisplay[] = [
    { 
      id: '61071436-2cf2-402b-8dec-da11c9f7d857',
      type: 'ServiceRequest',
      requestedOn: '04/24/2025',
      scheduledDateTime: 'Not scheduled',
      srType: 'FundTransfer',
      recipientEmail: 'foo@bar.com',
      isComplete: false,
      requestAnnotations: ['Transfer to friend'],
      debitAmount: '$50.00',
      accountId: 'Acc001'
    },
    { 
      id: '72081547-3df3-513c-9eec-eb22d8f8e858',
      type: 'ServiceRequest',
      requestedOn: '04/20/2025',
      scheduledDateTime: '04/25/2025, 2:00:00 PM',
      srType: 'AccountClosure',
      recipientEmail: 'john@example.com',
      isComplete: true,
      requestAnnotations: ['Account no longer needed', 'Transfer remaining funds'],
      debitAmount: '$0.00',
      accountId: 'Acc002'
    }
  ];

  constructor(
    private accountsService: AccountsService,
    private dataService: DataService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private cardLogoService: CardLogoService
  ) {}

  ngOnInit(): void {
    // Initialize dashboard data
    console.log('Dashboard initialized with mock account cards:', this.accountCards);
    this.loadAccounts();
    this.loadTransactions();
    this.loadServiceRequests();
  }

  /**
   * Load accounts from the API
   */
  loadAccounts(): void {
    this.isLoadingAccounts = true;
    this.loadingService.show();

    const tenantId = this.dataService.loggedInTenant || 'Contoso';
    const userId = this.dataService.loggedInUser || 'Mark';

    this.accountsService.getAccounts(tenantId, userId).subscribe({
      next: (response: any) => {
        this.accounts = response;
        // Transform API response to account cards format
        this.transformAccountsToCards(response);
        this.isLoadingAccounts = false;
        this.loadingService.hide();
        console.log('Accounts loaded successfully:', response);
      },
      error: (error: any) => {
        console.error('Error loading accounts:', error);
        console.log('Keeping mock account cards:', this.accountCards);
        this.isLoadingAccounts = false;
        this.loadingService.hide();
        this.toastService.showMessage('Failed to load accounts', 'error');
        // Keep the default mock data if API fails
      },
      complete: () => {
        this.isLoadingAccounts = false;
        this.loadingService.hide();
      }
    });
  }

  /**
   * Load latest transactions from the API
   */
  loadTransactions(): void {
    this.isLoadingTransactions = true;
    
    // Using hardcoded values as requested
    const tenantId = 'Contoso';
    const userId = 'Mark';
    const accountId = 'Acc001';

    this.accountsService.getTransactions(tenantId, userId, accountId).subscribe({
      next: (response: Transaction[]) => {
        this.transformTransactionsToDisplay(response);
        this.isLoadingTransactions = false;
        console.log('Transactions loaded successfully:', response);
      },
      error: (error: any) => {
        console.error('Error loading transactions:', error);
        this.isLoadingTransactions = false;
        this.toastService.showMessage('Failed to load transactions', 'error');
        // Keep the default mock data if API fails
      },
      complete: () => {
        this.isLoadingTransactions = false;
      }
    });
  }

  /**
   * Load service requests from the API
   */
  loadServiceRequests(): void {
    this.isLoadingServiceRequests = true;
    
    // Using hardcoded values as requested
    const tenantId = 'Contoso';
    const userId = 'Mark';

    this.accountsService.getServiceRequests(tenantId, userId).subscribe({
      next: (response: ServiceRequest[]) => {
        this.transformServiceRequestsToDisplay(response);
        this.isLoadingServiceRequests = false;
        console.log('Service requests loaded successfully:', response);
      },
      error: (error: any) => {
        console.error('Error loading service requests:', error);
        this.isLoadingServiceRequests = false;
        this.toastService.showMessage('Failed to load service requests', 'error');
        // Keep the default mock data if API fails
      },
      complete: () => {
        this.isLoadingServiceRequests = false;
      }
    });
  }

  /**
   * Transform accounts data from API to AccountCard format for display
   */
  private transformAccountsToCards(accounts: Account[]): void {
    if (accounts && accounts.length > 0) {
      console.log('Transforming accounts to cards:', accounts);
      
      // Check if the API data is complete, if not, keep mock data
      const hasValidData = accounts.some(account => 
        account.accountHolder && account.accountNumber && account.balance !== undefined
      );
      
      if (!hasValidData) {
        console.warn('API returned incomplete account data, keeping mock data');
        return;
      }
      
      this.accountCards = accounts.map(account => {
        const cardNumber = account.cardNumber || this.maskAccountNumber(account.accountNumber);
        
        // Try multiple possible field names for the account holder
        const accountHolderName = account.accountHolder || 
                                 (account as any).name || 
                                 (account as any).holderName || 
                                 (account as any).customerName || 
                                 'Account Holder';

        // Detect card type from card number if not provided
        const cardType = account.cardType !== undefined 
          ? account.cardType 
          : this.cardLogoService.detectCardTypeFromNumber(cardNumber);
        
        console.log(`Account ${account.id}: accountHolder=${account.accountHolder}, resolved name=${accountHolderName}, cardNumber=${account.cardNumber}, generated=${cardNumber}, cardType=${cardType}`);
        return {
          id: account.id,
          accountNumber: account.accountNumber,
          balance: this.formatCurrency(account.balance, account.currency),
          cardNumber: cardNumber,
          name: accountHolderName,
          accountId: account.id,
          accountType: account.accountType,
          limit: account.limit ? this.formatCurrency(account.limit, account.currency) : 'N/A',
          accountStatus: account.accountStatus,
          cardType: cardType
        };
      });
      console.log('Transformed account cards:', this.accountCards);
    }
  }

  /**
   * Transform transactions data from API to TransactionDisplay format for display
   */
  private transformTransactionsToDisplay(transactions: Transaction[]): void {
    if (transactions && transactions.length > 0) {
      this.latestTransactions = transactions.slice(0, 5).map(transaction => {
        // Determine transaction type and amount
        const isCredit = transaction.creditAmount > 0;
        const amount = isCredit ? transaction.creditAmount : transaction.debitAmount;
        const type: 'credit' | 'debit' = isCredit ? 'credit' : 'debit';
        
        return {
          id: transaction.id,
          description: transaction.details,
          amount: this.formatTransactionAmount(amount, type),
          type: type,
          date: new Date(transaction.transactionDateTime).toLocaleDateString(),
          balance: this.formatCurrency(transaction.accountBalance),
          transactionDateTime: transaction.transactionDateTime
        };
      });
    }
  }

  /**
   * Transform service requests data from API to ServiceRequestDisplay format for display
   */
  private transformServiceRequestsToDisplay(serviceRequests: ServiceRequest[]): void {
    if (serviceRequests && serviceRequests.length > 0) {
      this.serviceRequests = serviceRequests.map(request => ({
        id: request.id,
        type: request.type,
        requestedOn: new Date(request.requestedOn).toLocaleDateString(),
        scheduledDateTime: request.scheduledDateTime === "0001-01-01T00:00:00" 
          ? "Not scheduled" 
          : new Date(request.scheduledDateTime).toLocaleString(),
        srType: request.srType,
        recipientEmail: request.recipientEmail,
        isComplete: request.isComplete,
        requestAnnotations: request.requestAnnotations,
        debitAmount: this.formatCurrency(request.debitAmount),
        accountId: request.accountId
      }));
    }
  }

  /**
   * Format currency amount
   */
  private formatCurrency(amount: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount);
  }

  /**
   * Format transaction amount with proper sign and currency
   */
  private formatTransactionAmount(amount: number, type: 'credit' | 'debit', currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    });
    const formattedAmount = formatter.format(Math.abs(amount));
    return type === 'debit' ? `-${formattedAmount}` : `+${formattedAmount}`;
  }

  /**
   * Mask account number for security
   */
  private maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 4) {
      return accountNumber;
    }
    
    const lastFour = accountNumber.slice(-4);
    const masked = '**** **** **** ' + lastFour;
    return masked;
  }

  /**
   * Refresh accounts and transactions data
   */
  refreshAccounts(): void {
    this.loadAccounts();
    this.loadTransactions();
    this.loadServiceRequests();
  }

  /**
   * Refresh only transactions data
   */
  refreshTransactions(): void {
    this.loadTransactions();
  }

  /**
   * Refresh only service requests data
   */
  refreshServiceRequests(): void {
    this.loadServiceRequests();
  }

  /**
   * Get card logo for display
   */
  getCardLogo(cardType: CardType) {
    return this.cardLogoService.getCardLogo(cardType);
  }

  /**
   * Get card type name
   */
  getCardTypeName(cardType: CardType): string {
    return this.cardLogoService.getCardTypeName(cardType);
  }

  /**
   * Check if card has logo
   */
  hasCardLogo(cardType: CardType): boolean {
    return this.cardLogoService.hasLogo(cardType);
  }
}