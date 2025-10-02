import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-log-popup',
  standalone: false,
  templateUrl: './log-popup.component.html',
  styleUrl: './log-popup.component.css'
})
export class LogPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<LogPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public logs: any[]
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
