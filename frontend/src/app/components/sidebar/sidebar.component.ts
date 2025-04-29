import { ChangeDetectorRef, Component, OnInit, resolveForwardRef } from '@angular/core';
import { ChatOptionsService } from '../../services/chat-options/chat-options.service';
import { SessionService } from '../../services/conversations-service/conversations.service';
import { Session } from '../../models/session';
import { DataService } from '../../services/data.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  sessionData: any;
  sessionHistory: Session[] = [];
  isSidebarOpen: boolean = false;

  isEditing = false;
  currentEditingSession: Session | null = null;
  constructor(private loadingSpinnerService: LoadingService,
    private chatOptionsService: ChatOptionsService,
    private sessionService: SessionService,
    public dataService: DataService,
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    
  }
  ngOnInit() {
    this.getSessions();
    this.dataService.sessionData$.subscribe((data) => {
      this.sessionData = data;
    
    });
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }


  startEditing(session: Session): void {
    this.isEditing = true;
    this.currentEditingSession = session;

  }

  stopEditing(session: Session): void {
    this.isEditing = false;
    this.currentEditingSession = null;
    this.sessionService.renameSession(this.dataService.loggedInTenant, this.dataService.loggedInUser, session.sessionId, session.name).subscribe((response: any) => {
      this.toastService.showMessage('Session renamed successfully!', 'success');
      this.getSessions();
    });
  }

  getSessions() {
    this.loadingSpinnerService.show();
    this.sessionService.getChatSessions(this.dataService.loggedInTenant, this.dataService.loggedInUser).subscribe((response: any) => {
      this.sessionHistory = response;
      const updatedSessionList = [...this.sessionHistory];  // Assuming you have the latest array of sessions
      this.dataService.updateSession(updatedSessionList);
      if (this.sessionHistory.length == 0) {
        this.router.navigate(['/chat', '']);
      }
      this.loadingSpinnerService.hide();

    });
  }

  isSessionEditing(session: Session): boolean {
    return this.isEditing && this.currentEditingSession === session;
  }


  removeSession(session : Session) {
    this.loadingSpinnerService.show();
    this.sessionService.removeSession(this.dataService.loggedInTenant, this.dataService.loggedInUser, session.sessionId).subscribe((response: any) => {
      this.getSessions();
      this.router.navigate(['/chat', '']);
      this.loadingSpinnerService.hide();
    });
  }



}
