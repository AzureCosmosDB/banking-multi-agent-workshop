import { Component, OnInit } from '@angular/core';
import { LoadingService } from './services/loading.service';
import { HttpClient } from '@angular/common/http';
import { ToastService } from './services/toast.service';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  message: string = '';
  showToast: boolean = false;
  type: 'success' | 'error' = 'success'; // Type of toast message

 
  constructor(private loadingService: LoadingService , private toastService: ToastService, private cdr: ChangeDetectorRef) {}

  makeRequest() {
    console.log('Making API request...');
    this.loadingService.show();  // Manually show loading spinner

    // Simulate an HTTP request
    setTimeout(() => {
      console.log('API Response simulated.');
      this.loadingService.hide();  // Hide spinner after the request
    }, 2000); // Simulating 2 seconds request
  }

  ngOnInit() {
    // Subscribe to the toast service to receive messages
    this.toastService.toastMessage$.subscribe((data) => {
      const { message, type } = data;
      this.message = message;
      this.type = type;
      this.showToast = true; // Set showToast to true to display the toast
      this.cdr.detectChanges();

      // Hide toast after 3 seconds
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    });
  }
 
}
