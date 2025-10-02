import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChatOptionsService } from '../../services/chat-options/chat-options.service';
import { Subject } from '../../models/subject.enum';
import { SessionService } from '../../services/conversations-service/conversations.service';
import { DataService } from '../../services/data.service';
import { Session } from '../../models/session';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-chat-options',
  standalone: false,
  templateUrl: './chat-options.component.html',
  styleUrl: './chat-options.component.css'
})
export class ChatOptionsComponent {
  loggedInUser: string;
  Subject = Subject;
  currentSession!: Session;
  sessionHistory: Session[] = [];
  
  constructor(
    private chatOptionsService: ChatOptionsService,
    private sessionService: SessionService,
    private dataService: DataService,
    private router: Router,
    private toastService: ToastService,
    private loadingService: LoadingService) {
    dataService.sessionData$.subscribe((data) => {
      if (data) {
        this.currentSession = data;
      } else {
        this.currentSession = new Session(this.dataService.loggedInTenant, this.dataService.loggedInUser, '');
      }
    });
    this.loggedInUser = this.dataService.loggedInUser;
  }

  setSubjectSelected(subject: string) {
    this.chatOptionsService.setSubjectSelected(subject);
  }

  isSelected(subject: string): boolean {
    return this.chatOptionsService.getSubjectSelected() === subject.toLocaleLowerCase();
  }

  createNewSession(): void {
    this.loadingService.show();
    this.sessionService.createChatSession(this.dataService.loggedInTenant, this.dataService.loggedInUser).subscribe((response: any) => {
      this.currentSession = response;
      this.dataService.changeMessage(response.sessionId);
      this.getSessions();
      this.toastService.showMessage('Chat session ready!', 'success');
      this.loadingService.hide();
    });
  }

  sendPredefinedMessage(message: string): void {
    // Set the message in data service for the main-content component to use
    this.dataService.setPredefinedMessage(message);
  }

  getSessions() {
    this.loadingService.show();
    this.sessionService.getChatSessions(this.dataService.loggedInTenant, this.dataService.loggedInUser).subscribe((response: any) => {
      this.sessionHistory = response;
      const updatedSessionList = [...this.sessionHistory];
      this.dataService.updateSession(updatedSessionList);
      this.loadingService.hide();
    });
  }
}