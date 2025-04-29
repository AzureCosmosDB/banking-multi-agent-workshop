import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, QueryList, ViewChildren, Output, EventEmitter } from '@angular/core';
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
  @ViewChildren('latestMessage') latestMessages!: QueryList<ElementRef>;
  @Output() sidebarToggle = new EventEmitter<void>();
  //@ts-ignorets-ignore
  @ViewChild('mainContent') private mainContent: ElementRef;
  message = '';
  showToast = false;
  loggedInUser: string;
  completion: string = "";
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
  conversationContext: string = '';
  summarisedName = "New Chat";
  currentSession: Session = {} as Session;
  sessionRenamed = false;
  constructor(
    private chatOptionsService: ChatOptionsService,
    private dataService: DataService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private router: Router,
    public dialog: MatDialog,
    private toastService: ToastService
  ) {

    this.loggedInUser = this.dataService.loggedInUser;
    this.imagePath = `../assets/${this.loggedInUser}.jpg`;
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
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
    this.scrollToLatestMessage();
  }

  private scrollToLatestMessage() {
    if (this.latestMessages.length > 0) {
      const lastMessage = this.latestMessages.last; // Get the last element
      lastMessage.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
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

    if (this.conversationHistory.length >= 2 && this.sessionRenamed== false) {
      for (const entry of this.conversationHistory) {
        this.conversationContext += `${entry.prompt}: ${entry.completion}\n\n`
      }
      const summaryInput = this.convertToJSON(this.conversationContext);

      this.sessionService.summarizeName(this.dataService.loggedInTenant, this.dataService.loggedInUser, this.sessionId, summaryInput).subscribe({
        next: (response: any) => {
          console.log("Summarize name method called", response)
          this.summarisedName = response;
          let sessionData: Session[] = [];
          this.currentSession.name = response;
          this.sessionRenamed = true;
          this.dataService.sessionData$.subscribe((data) => {
            if (data) {
              data = data.map((t: Session) => 
                t.sessionId === this.sessionId ? { ...t, name: response } : t
              );
              sessionData = data;
            }
          });         
          this.dataService.updateSession(sessionData);
        },
        error: (err: any) => {
          console.error('Error receiving data stream', err);
          this.errorMessage = this.DEFAULT_ERROR_MESSAGE;
        },
        complete: () => {
          this.errorMessage = this.conversationHistory.length === 0 ? this.DEFAULT_ERROR_MESSAGE : "";
        }
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

    
  }

  convertToJSON(malformedString: string): any | null {
    // Step 1: Collapse everything into a single line
    const collapsedString = malformedString.replace(/\s+/g, ' ').trim();

    // Step 2: Convert to a JSON-compatible string (escape quotes)
    const jsonString = JSON.stringify(collapsedString);

    return jsonString;
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
      console.log(message);
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
    this.sessionService.getChatSession(this.dataService.loggedInTenant, this.dataService.loggedInUser, sessionId).subscribe((response: any) => {
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
      })
      this.loadingService.hide();
      this.currentSession = response;
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
    console.log('Navigating to profile...');
  }


}