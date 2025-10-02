import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { DataService } from '../../services/data.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
 
@Component({
  selector: 'app-assistant',
  standalone: false,
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css',
})
export class AssistantComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isSidebarOpened: boolean = true;
  assistantExpanded: boolean = false;
  showAssistantPanel: boolean = false;
  loggedInUser: string;
  imagePath: string = '';
  private routeSubscription: Subscription = new Subscription();
  
  toggleSidebar() {
    this.sidenav.toggle();
    this.isSidebarOpened = !this.isSidebarOpened;  // Track state change
  }

  toggleAssistant() {
    this.assistantExpanded = !this.assistantExpanded;
  }
  
  constructor(private http: HttpClient, private dataService: DataService, private router: Router) {
    this.loggedInUser = this.dataService.loggedInUser;
    this.imagePath = `../assets/${this.loggedInUser}.jpg`;
  }

  ngOnInit() {
    // Subscribe to router events to detect navigation
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.handleRouteChange(event.url);
      });

    // Check initial route
    this.handleRouteChange(this.router.url);
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private handleRouteChange(url: string): void {
    // Show assistant panel only for dashboard-related routes, hide for chat routes
    const dashboardRoutes = ['/dashboard', '/accounts', '/payments', '/cards', '/support'];
    this.showAssistantPanel = dashboardRoutes.some(route => url.includes(route)) || url === '/' || url === '';
    
    // If navigating to chat, collapse the assistant panel
    if (!this.showAssistantPanel && this.assistantExpanded) {
      this.assistantExpanded = false;
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }

  navigateToProfile() {
    // Logic to navigate to the profile page
    console.log('Navigating to profile...');
  }
}
