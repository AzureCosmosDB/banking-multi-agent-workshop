import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../../../../services/loading.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-loading-spinner',
  standalone: false,
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css'
})
export class LoadingSpinnerComponent implements OnInit {
  loading$!: Observable<boolean>;
  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loading$ = this.loadingService.loading$;
  }
}