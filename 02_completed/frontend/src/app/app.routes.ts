import { Routes } from '@angular/router';
import { AssistantComponent } from './components/assistant/assistant.component';
import { LoginComponent } from './components/login/login.component';
import { MainContentComponent } from './components/main-content/main-content.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const appRoutes: Routes = [
  { path: '', component: LoginComponent },  // Set LoginComponent as default page
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AssistantComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'accounts', component: DashboardComponent }, // Placeholder - will show dashboard for now
      { path: 'payments', component: DashboardComponent }, // Placeholder - will show dashboard for now
      { path: 'cards', component: DashboardComponent }, // Placeholder - will show dashboard for now
      { path: 'support', component: DashboardComponent }, // Placeholder - will show dashboard for now
      { path: 'chat/:sessionId', component: MainContentComponent }, // Keep chat functionality
      { path: 'chat', component: MainContentComponent }
    ]
  },
  { path: '**', redirectTo: '/login' }  // Wildcard route for undefined paths
];