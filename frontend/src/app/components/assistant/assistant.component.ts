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
  loggedInUser: string;
  imagePath: string = '';
  toggleSidebar() {
    this.sidenav.toggle();
    this.isSidebarOpened = !this.isSidebarOpened;  // Track state change
  }
  constructor(private http: HttpClient ,  private dataService: DataService, private router: Router) {
    this.loggedInUser = this.dataService.loggedInUser;
    this.imagePath = `../assets/${this.loggedInUser}.jpg`;
   } // Inject HttpClient in the constructor

   logout() {
    this.router.navigate(['/login']);
  }

  navigateToProfile() {
    // Logic to navigate to the profile page
    console.log('Navigating to profile...');
  }
}
