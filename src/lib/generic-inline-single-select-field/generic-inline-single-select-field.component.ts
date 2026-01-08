import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'lib-generic-inline-single-select-field',
  templateUrl: './generic-inline-single-select-field.component.html',
  styleUrls: ['./generic-inline-single-select-field.component.css']
})
export class GenericInlineSingleSelectFieldComponent implements OnInit {
  @Input() field: any;
  @Input() options: any[] = [];
  @Input() selected: any;

  @Output() selectionChange = new EventEmitter<any>();

  showSelectionPopup: boolean = false;
  fieldName: string = 'Select Option';

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
     this.fieldName = this.field.fieldName
  }

  toggleSelectionPopup() {
    this.showSelectionPopup = !this.showSelectionPopup;
  }

  onSelect(option: any) {
    this.selected = option;
    this.selectionChange.emit(option);
    this.showSelectionPopup = false;
  }

  getSelectedLabel(): string {
    const matched = this.options?.find(opt => opt.value === this.selected);
    return matched ? matched.name : 'Select';
  }

      @HostListener('document:click', ['$event'])
    onClick(event: MouseEvent) {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.showSelectionPopup = false;
      }
    }

}
