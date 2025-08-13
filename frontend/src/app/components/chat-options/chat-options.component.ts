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
  loggedInUserName: string;
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
      }else
  { this.currentSession = new Session(this.dataService.loggedInTenant, this.dataService.loggedInUserId,'' );
      }
    });
     this.loggedInUserName = this.dataService.loggedInUserName || this.dataService.loggedInUserId;


  }

  setSubjectSelected(subject: string) {
    this.chatOptionsService.setSubjectSelected(subject);
  }

  isSelected(subject: string): boolean {
    return this.chatOptionsService.getSubjectSelected() === subject.toLocaleLowerCase();
  }

  createNewSession(): void {
    this.loadingService.show();
  this.sessionService.createChatSession(this.dataService.loggedInTenant,this.dataService.loggedInUserId, ).subscribe((response: any) => {
      this.currentSession = response;
       this.getSessions() ;
      this.toastService.showMessage('Session created successfully!', 'success');
      this.router.navigate(['/chat', this.currentSession.sessionId]);
      this.loadingService.hide();
    });
  }


  getSessions() {
    this.loadingService.show();
  this.sessionService.getChatSessions(this.dataService.loggedInTenant, this.dataService.loggedInUserId).subscribe((response: any) => {
      this.sessionHistory = response;
      const updatedSessionList = [...this.sessionHistory];  // Assuming you have the latest array of sessions
      this.dataService.updateSession(updatedSessionList);
      this.loadingService.hide();

    });
  }

}
