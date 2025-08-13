import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assistant',
  standalone: false,
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css',
})
export class AssistantComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isSidebarOpened: boolean = true;
  loggedInUserName: string;
  loggedInUserId: string;
  imagePath: string = '';
  toggleSidebar() {
    this.sidenav.toggle();
    this.isSidebarOpened = !this.isSidebarOpened;  // Track state change
  }
  constructor(private http: HttpClient ,  private dataService: DataService, private router: Router) {
  this.loggedInUserName = this.dataService.loggedInUserName || this.dataService.loggedInUserId;
  this.loggedInUserId = this.dataService.loggedInUserId;
  this.imagePath = `../assets/${this.loggedInUserId}.jpg`;
   } // Inject HttpClient in the constructor

   logout() {
    this.router.navigate(['/login']);
  }

  navigateToProfile() {
    // Logic to navigate to the profile page
    console.log('Navigating to profile...');
  }
}
