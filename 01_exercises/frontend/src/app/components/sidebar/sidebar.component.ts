import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../services/conversations-service/conversations.service';
import { DataService } from '../../services/data.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { Session } from '../../models/session';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  sessions: Session[] = [];
  isLoadingSessions: boolean = false;
  currentSessionId: string = '';
  loggedInUser: string = '';

  constructor(
    private sessionService: SessionService,
    private dataService: DataService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loggedInUser = this.dataService.loggedInUser;
  }

  ngOnInit(): void {
    this.loadSessions();
    
    // Listen for session updates
    this.dataService.sessionData$.subscribe((sessions) => {
      if (sessions) {
        this.sessions = sessions;
      }
    });

    // Listen for current session changes
    this.dataService.currentMessage.subscribe(sessionId => {
      this.currentSessionId = sessionId;
    });
  }

  /**
   * Load all chat sessions for the current user
   */
  loadSessions(): void {
    this.isLoadingSessions = true;
    const tenantId = this.dataService.loggedInTenant || 'Contoso';
    const userId = this.dataService.loggedInUser || 'Mark';

    this.sessionService.getChatSessions(tenantId, userId).subscribe({
      next: (response: Session[]) => {
        this.sessions = response;
        this.dataService.updateSession(response);
        this.isLoadingSessions = false;
        console.log('Sessions loaded:', response);
      },
      error: (error: any) => {
        console.error('Error loading sessions:', error);
        this.isLoadingSessions = false;
        this.toastService.showMessage('Failed to load chat sessions', 'error');
      }
    });
  }

  /**
   * Create a new chat session
   */
  createNewSession(): void {
    this.isLoadingSessions = true;
    const tenantId = this.dataService.loggedInTenant || 'Contoso';
    const userId = this.dataService.loggedInUser || 'Mark';

    this.sessionService.createChatSession(tenantId, userId).subscribe({
      next: (response: Session) => {
        this.dataService.changeMessage(response.sessionId);
        this.loadSessions(); // Refresh the session list
        this.router.navigate(['/chat', response.sessionId]);
        this.toastService.showMessage('New chat session created!', 'success');
        this.isLoadingSessions = false;
      },
      error: (error: any) => {
        console.error('Error creating session:', error);
        this.isLoadingSessions = false;
        this.toastService.showMessage('Failed to create new session', 'error');
      }
    });
  }

  /**
   * Navigate to a specific chat session
   */
  openSession(sessionId: string): void {
    this.dataService.changeMessage(sessionId);
    this.router.navigate(['/chat', sessionId]);
  }

  /**
   * Delete a chat session
   */
  deleteSession(sessionId: string, event: Event): void {
    event.stopPropagation(); // Prevent opening the session when clicking delete
    
    if (confirm('Are you sure you want to delete this chat session?')) {
      const tenantId = this.dataService.loggedInTenant || 'Contoso';
      const userId = this.dataService.loggedInUser || 'Mark';

      this.sessionService.removeSession(tenantId, userId, sessionId).subscribe({
        next: () => {
          this.loadSessions(); // Refresh the session list
          this.toastService.showMessage('Session deleted successfully', 'success');
          
          // If we deleted the current session, navigate to a new one
          if (this.currentSessionId === sessionId) {
            this.router.navigate(['/chat', '']);
          }
        },
        error: (error: any) => {
          console.error('Error deleting session:', error);
          this.toastService.showMessage('Failed to delete session', 'error');
        }
      });
    }
  }

  /**
   * Check if a session is currently active
   */
  isActiveSession(sessionId: string): boolean {
    return this.currentSessionId === sessionId;
  }

  /**
   * Get display name for session (truncate if too long)
   */
  getSessionDisplayName(sessionName: string): string {
    const maxLength = 25;
    return sessionName.length > maxLength 
      ? sessionName.substring(0, maxLength) + '...' 
      : sessionName;
  }

  /**
   * TrackBy function for session list performance
   */
  trackBySessionId(index: number, session: Session): string {
    return session.sessionId;
  }
}
