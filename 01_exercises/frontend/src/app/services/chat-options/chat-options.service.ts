import { Injectable } from '@angular/core';
import { Subject } from '../../models/subject.enum';
import { EventEmitter } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class ChatOptionsService {
  private subjectSelected: string = "";
  public subjectSelectedEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  setSubjectSelected(subject: string) {
    this.subjectSelected = subject;
    console.log(this.subjectSelected);
  }

  getSubjectSelected(): string {
    return this.subjectSelected.toLocaleLowerCase();
  }


}

