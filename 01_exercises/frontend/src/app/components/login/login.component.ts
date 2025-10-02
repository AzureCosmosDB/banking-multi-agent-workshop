import { Component, Input , Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent  {
  selectedCompany?: string ;
  selectedUser?: string  ;
  form: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });
 
  constructor(private router: Router , private dataService: DataService) { 
      this.selectedCompany = 'Contoso';
      this.selectedUser ='Mark';
      dataService.updateLoggedinUser( this.selectedUser);
      dataService.updateLoggedinTenant( this.selectedCompany);
  }

  submit() {
    if (this.form.valid) {
      this.submitEM.emit(this.form.value);
      this.router.navigate(['/dashboard']);
    }
  }

  onSelectionChangeUser(event: any): void {
     this.selectedUser = event.value;
     this.dataService.updateLoggedinUser( event.value);
  }
  
  onSelectionChangeCompany(event: any): void {
    this.selectedCompany = event.value;
    this.dataService.updateLoggedinTenant( event.value);
 }
  @Input() error: string | null = null;

  @Output() submitEM = new EventEmitter();
 
}