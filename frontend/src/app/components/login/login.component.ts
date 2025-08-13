import { Component, Input , Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { MetaService, MetaUser } from '../../services/meta/meta.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit  {
  selectedCompany?: string ;
  selectedUser?: string  ;
  users: MetaUser[] = [];
  tenants: string[] = [];
  loadingUsers = false;
  loadingTenants = false;
  loadError?: string;
  form: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(private router: Router , private dataService: DataService, private meta: MetaService) {
      // try restore from localStorage via dataService
      this.selectedUser = this.dataService.loggedInUserId || undefined;
      this.selectedCompany = this.dataService.loggedInTenant || undefined;
  }

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchTenants();
  }

  private fetchUsers() {
    this.loadingUsers = true;
    this.meta.getUsers().subscribe({
      next: data => {
        this.users = data;
        // default selection if none
        if (!this.selectedUser && this.users.length) {
          const first = this.users[0];
          this.selectedUser = first.id;
          this.dataService.updateLoggedinUser({ id: first.id, name: first.name });
        }
        this.loadingUsers = false;
      },
      error: err => {
        this.loadError = 'Failed to load users';
        console.error(err);
        this.loadingUsers = false;
      }
    });
  }

  private fetchTenants() {
    this.loadingTenants = true;
    this.meta.getTenants().subscribe({
      next: data => {
        this.tenants = data;
        if (!this.selectedCompany && this.tenants.length) {
          this.selectedCompany = this.tenants[0];
          this.dataService.updateLoggedinTenant(this.selectedCompany);
        }
        this.loadingTenants = false;
      },
      error: err => {
        this.loadError = 'Failed to load tenants';
        console.error(err);
        this.loadingTenants = false;
      }
    });
  }

  submit() {
    if (this.form.valid) {
      this.submitEM.emit(this.form.value);
      this.router.navigate(['/chat', '']);
    }
  }

  onSelectionChangeUser(event: any): void {
    this.selectedUser = event.value;
    const selected = this.users.find(u => u.id === event.value);
    if (selected) {
      this.dataService.updateLoggedinUser({ id: selected.id, name: selected.name });
    }
  }

  onSelectionChangeCompany(event: any): void {
    this.selectedCompany = event.value;
    this.dataService.updateLoggedinTenant(event.value);
 }
  @Input() error: string | null = null;

  @Output() submitEM = new EventEmitter();

}
