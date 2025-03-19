import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Session } from '../../models/session';
import { Message } from '../../models/message';
import { ChatOptionsService } from '../../services/chat-options/chat-options.service';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../services/conversations-service/conversations.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { LogPopupComponent } from '../log-popup/log-popup.component';
@Component({
  selector: 'app-main-content',
  standalone: false,
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.css'
})
export class MainContentComponent implements OnInit, AfterViewChecked {
  //@ts-ignorets-ignore
  @ViewChild('mainContent') private mainContent: ElementRef;
  message = '';
  showToast = false;
  loggedInUser: string;
  completion: string = "";
  summmaryDone = false;
  userInput: string = "";
  conversationHistory: Message[] = [];
  isResponding: boolean = true;
  maxInputLength: number = 150;
  errorMessage: string = "";
  DEFAULT_ERROR_MESSAGE = "Oops!!! It seems that an error occurred while sending your question!!";
  isClicked: boolean = false; // ✅ Declare the property
  isLoading: boolean = false;
  sessionId!: string;
  imagePath: string = '';
  conversationContext : string = ''; 
  summarisedName = "";
  currentSession : Session = {} as Session;
  constructor(
    private chatOptionsService: ChatOptionsService,
    private dataService: DataService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private router: Router,
    public dialog : MatDialog,
    private toastService: ToastService
  ) {

    this.loggedInUser = this.dataService.loggedInUser;
    this.imagePath = `../assets/${this.loggedInUser}.jpg`;
  }

  ngOnInit(): void {

    this.dataService.currentMessage.subscribe(message => this.sessionId = message);

    this.route.paramMap.subscribe(params => {
      this.sessionId = params.get('sessionId') || '';
      this.conversationHistory = [];
      if (this.sessionId != '') {
        this.getSelectedSession(this.sessionId);
      }
    });


  }
  handleSend() {
    this.initCompletion();
    this.isClicked = true;
    setTimeout(() => {
      this.isClicked = false; // Reset after a short delay for effect
    }, 300);
  }

  getSelectedSubject() {
    return this.chatOptionsService.getSubjectSelected();
  }


  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.mainContent.nativeElement.scrollTop = this.mainContent.nativeElement.scrollHeight;
    } catch (err) { }
  }

  initCompletion() {
    this.loadingService.show();
    if (this.userInput.length > this.maxInputLength || this.sessionId === '') {
      this.loadingService.hide();
      this.toastService.showMessage('Please create a new chat session', 'error');
      return;
    }
    this.isLoading = true;
    const question = this.userInput;
    this.userInput = "";
    this.errorMessage = "";

    if (this.conversationHistory.length > 4 && !this.summmaryDone) {
      for (const entry of this.conversationHistory) {
           this.conversationContext += `User: ${entry.prompt}\nAI: ${entry.completion}\n\n`;
        
      }
      this.sessionService.summarizeName(this.dataService.loggedInTenant, this.dataService.loggedInUser, this.sessionId , this.truncateString(this.conversationContext)).subscribe((response: any) => {
         this.summmaryDone = true;
         this.summarisedName = response;
         this.currentSession.name = response;
         this.dataService.sessionData$.subscribe((data) => {
            if (data) {
                this.currentSession = data.filter((t: Session) => t.sessionId === this.sessionId)[0];
                data =  data.filter((t: Session) => t.sessionId === this.sessionId)[0].name = response;            
            }
          } );
          
      });
    }
    this.sessionService.postCompletion(question, this.dataService.loggedInTenant, this.dataService.loggedInUser, this.sessionId)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          // iterate over each  response  object and create a new message object and push to conversationHistory
          response.forEach((message: any) => {
            const newMessage = new Message();
            newMessage.id = message.id;
            newMessage.type = message.type;
            newMessage.tenantId = message.tenantId;
            newMessage.userId = message.userId;
            newMessage.sessionId = message.sessionId;
            newMessage.timeStamp = new Date(message.timeStamp);
            newMessage.prompt = message.text;
            newMessage.debugLogId = message.debugLogId;
            newMessage.senderRole = message.senderRole;
            newMessage.sender = message.sender;
            newMessage.promptTokens = message.promptTokens;
            newMessage.completion = message.text;
            newMessage.completionTokens = message.completionTokens;
            newMessage.generationTokens = message.generationTokens;
            newMessage.cacheHit = message.cacheHit;
            newMessage.elapsedMilliseconds = message.elapsedMilliseconds
            this.conversationHistory.push(newMessage);
            this.loadingService.hide();
            if (newMessage.senderRole === 'Cordinator') {
              this.getDebugInfo(newMessage);
            }
          });
        },
        error: (err: any) => {
          console.error('Error receiving data stream', err);
          this.errorMessage = this.DEFAULT_ERROR_MESSAGE;
          this.toastService.showMessage(err.error.message, 'error');
        },
        complete: () => {
          this.errorMessage = this.conversationHistory.length === 0 ? this.DEFAULT_ERROR_MESSAGE : "";
        }
      });

    setTimeout(() => this.scrollToBottom(), 0);
  }

   truncateString(value: string, limit: number = 150, trail: string = '...'): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }

  getLastConversation(): Message {
    return this.conversationHistory[this.conversationHistory.length - 1];
  }

  getDebugInfo(message: Message) {
    this.sessionService.getCompletionDetails(this.dataService.loggedInTenant, this.dataService.loggedInUser, this.sessionId, message.debugLogId).subscribe((response: any) => {
      message.debugInfo = response.propertyBag;
      this.dialog.open(LogPopupComponent, {
        width: '600px',
        data: response.propertyBag
      });
 
    });
  }


  toggleDebugInfo(conversation: any) {
    conversation.showDebug = !conversation.showDebug;
    this.getDebugInfo(conversation);
  }

  getSelectedSession(sessionId: string) {
    this.loadingService.show();
    if (sessionId === '') {
      this.loadingService.hide();
      return
    }
    this.conversationHistory = [];
    this.sessionService.getChatSession(this.dataService.loggedInTenant, this.dataService.loggedInUser, sessionId).subscribe({
      next: (response: any) => {
        response.forEach((message: any) => {
          const newMessage = new Message();
          newMessage.id = message.id;
          newMessage.type = message.type;
          newMessage.tenantId = message.tenantId;
          newMessage.userId = message.userId;
          newMessage.sessionId = message.sessionId;
          newMessage.timeStamp = new Date(message.timeStamp);
          newMessage.prompt = message.text;
          newMessage.senderRole = message.senderRole;
          newMessage.sender = message.sender;
          newMessage.debugLogId = message.debugLogId;
          newMessage.promptTokens = message.promptTokens;
          newMessage.completion = message.text;
          newMessage.completionTokens = message.completionTokens;
          newMessage.generationTokens = message.generationTokens;
          newMessage.cacheHit = message.cacheHit;
          newMessage.elapsedMilliseconds = message.elapsedMilliseconds;
          this.conversationHistory.push(newMessage);
          
          if (newMessage.sender === 'Cordinator') {
            this.getDebugInfo(newMessage);
          }
        });
        
        this.loadingService.hide(); // Hide loading when the response is successfully processed
        this.currentSession = response;
      },
      error: (error) => {
        console.error('An error occurred:', error);
        this.loadingService.hide(); // Hide loading when an error occurs
      }
    });
  }

  endSession() {
    this.router.navigate(['/chat', '']);
  }
  logout() {
    this.router.navigate(['/login']);
  }

  navigateToProfile() {
    // Logic to navigate to the profile page
 
  }


}