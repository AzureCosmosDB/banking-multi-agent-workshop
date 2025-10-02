// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { AssistantComponent } from './components/assistant/assistant.component';
import { LoginComponent } from './components/login/login.component';
import { MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MainContentComponent } from "./components/main-content/main-content.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { MarkdownModule } from 'ngx-markdown';
import { NgFor, NgIf } from '@angular/common';
import { ChatOptionsComponent } from './components/chat-options/chat-options.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import {  HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LoadingSpinnerComponent } from './components/shared/spinner/loading-spinner/loading-spinner.component';
// import { use } from 'marked';
import { LoadingInterceptor } from './services/loading.interceptor';
import { ToastComponent } from './components/shared/toast/toast.component';
import { ToastService } from './services/toast.service';
import { MatMenuModule } from '@angular/material/menu';  // Import MatMenuModule
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import {ReactiveFormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { LogPopupComponent } from './components/log-popup/log-popup.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@NgModule({
  imports: [
    MarkdownModule,
    NgFor,
    MatSidenavModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    UpperCasePipe,
    NgClass,
    BrowserModule,
    NgIf,
    MatIconModule,
    RouterModule.forRoot(appRoutes),
    MatSidenavModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatCardModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDialogContent,
    MatDialogActions,
    MatDividerModule,
    MatProgressSpinnerModule
 
],
  declarations: [AppComponent, LogPopupComponent, AssistantComponent, ChatOptionsComponent, LoginComponent, SidebarComponent, MainContentComponent, DashboardComponent, LoadingSpinnerComponent, ToastComponent],
  providers: [provideHttpClient(), provideAnimations(), { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true  }],

  bootstrap: [AppComponent]
})
export class AppModule { }