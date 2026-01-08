import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopupManagerService {
  private closeAllPopupsSubject = new Subject<string>();
  
  // Observable that components subscribe to
  closeAllPopups$ = this.closeAllPopupsSubject.asObservable();

  constructor() { }

  // Called when a component opens its popup
  requestCloseOthers(componentId: string) {
    this.closeAllPopupsSubject.next(componentId);
  }
}