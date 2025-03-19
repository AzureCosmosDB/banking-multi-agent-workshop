import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: false,
  providers: [ToastService],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent implements OnChanges {
  @Input() message: string = '';
  @Input() show: boolean = false;
  @Input() type: 'success' | 'error' = 'success';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && this.show) {
      // Log to see if the properties are updating
 
    }
  }
}
