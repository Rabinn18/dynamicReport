import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PopupManagerService } from '../Services/popup-manager.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-generic-inline-select-popup-field',
  templateUrl: './generic-inline-select-popup-field.component.html',
  styleUrls: ['./generic-inline-select-popup-field.component.css']
})
export class GenericInlineSelectPopupFieldComponent implements OnInit {

  selectedDatas: string[] = []; // Names for display
  private componentId = `inlinemultiselect-popup-${Math.random().toString(36).substr(2, 9)}`;
  private popupSubscription?: Subscription;
  constructor(private elementRef: ElementRef,private popupManagerService: PopupManagerService) { }

  @Input() options: { name: string; value: string }[] = [];
  @Input() selected: string | string[] = []; // Can be string or array
  @Input() field: any;

  @Output() selectionChange = new EventEmitter<string>();

  @ViewChild('hoverTarget', { static: false }) hoverTarget!: ElementRef;

  dataArray: { name: string; value: string }[] = []; // Store both name and value
  tempSelectedValues: string[] = []; // Store values only
  fieldName = 'Data Selection';

  showPopup = false;
  showDivSelectionPopup = false;
  popupStyle: any = {};
  popupData: string[] = [];
  popupArrowColor = '#FEF5BE';

  ngOnInit(): void {
    console.log('Options:', this.options, 'Selected:', this.selected, 'Field:', this.field);
    this.dataArray = this.options.filter(opt => opt.name.toUpperCase() !== 'ALL');
    this.fieldName = this.field.fieldName || 'Data Selection';
    
    // Handle initial selection
    const selectedStr = Array.isArray(this.selected) ? this.selected[0] : this.selected;
    if (selectedStr === '%' || selectedStr === 'All') {
      // Select all
      this.tempSelectedValues = this.dataArray.map(opt => opt.value);
    } else if (selectedStr) {
      // Parse comma-separated values
      this.tempSelectedValues = selectedStr.split(',').map(v => v.trim()).filter(v => v);
    } else {
      this.tempSelectedValues = [];
    }
    
    // Update display names
    this.selectedDatas = this.getNamesByValues(this.tempSelectedValues);
    
    console.log('Initialized - Values:', this.tempSelectedValues, 'Display Names:', this.selectedDatas);

        this.popupSubscription = this.popupManagerService.closeAllPopups$.subscribe(
      (requestingComponentId: string) => {
        // Close this popup if another component requested it
        if (requestingComponentId !== this.componentId) {
          this.hidePopup();
        }
      }
    );
  }

    ngOnDestroy() {
    // Clean up subscription
    if (this.popupSubscription) {
      this.popupSubscription.unsubscribe();
    }
  }


  // Convert values to names for display
  private getNamesByValues(values: string[]): string[] {
    return values
      .map(val => this.dataArray.find(opt => opt.value === val)?.name)
      .filter(name => name !== undefined) as string[];
  }

  togglePopup(event: MouseEvent, data: string[], color: string) {
    if(data.length == 0 || this.showDivSelectionPopup){
      return; // Do nothing if no data to show
    }
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.popupData = data;
    this.popupArrowColor = color;
    console.log('Popup data:', this.popupData,'rect info:',rect);
    this.popupStyle = {
      position: 'fixed',
      top: `${rect.top + rect.height + 20}px`,
      left: `${rect.right + 20}px`,
      transform: 'translateY(-50%)',
      zIndex: 9999,
      backgroundColor: color,
      '--popup-arrow-color': color
    };
    this.popupManagerService.requestCloseOthers(this.componentId);
    this.showPopup = true;
  }

  hidePopup() {
    this.showPopup = false;
    this.popupData = [];
  }

  toggleDivSelectionPopup() {
    this.showDivSelectionPopup = !this.showDivSelectionPopup;
    this.showPopup = false;
  }

  toggleTempDataSelection(option: { name: string; value: string }, event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.checked) {
      if (!this.tempSelectedValues.includes(option.value)) {
        this.tempSelectedValues = [...this.tempSelectedValues, option.value];
      }
    } else {
      this.tempSelectedValues = this.tempSelectedValues.filter(val => val !== option.value);
    }
  }

  toggleAllTempDatas(event: Event) {
    const input = event.target as HTMLInputElement;
    this.tempSelectedValues = input.checked ? this.dataArray.map(opt => opt.value) : [];
  }

  isChecked(value: string): boolean {
    return this.tempSelectedValues.includes(value);
  }

  isAllChecked(): boolean {
    return this.tempSelectedValues.length === this.dataArray.length && this.dataArray.length > 0;
  }

  applyDataSelection() {
    console.log('Applying selection - Values:', this.tempSelectedValues);
    
    // Update display names
    this.selectedDatas = this.getNamesByValues(this.tempSelectedValues);
    
    // Emit values (not names) to backend as comma-separated string
    const passedValues = this.tempSelectedValues.join(',');
    console.log('Emitting to backend:', passedValues);
    
    this.selectionChange.emit(passedValues);
    this.showDivSelectionPopup = false;
  }

  cancelDataSelection() {
    // Reset temp selection to current selection
    const selectedStr = Array.isArray(this.selected) ? this.selected[0] : this.selected;
    if (selectedStr === '%' || selectedStr === 'All') {
      this.tempSelectedValues = this.dataArray.map(opt => opt.value);
    } else if (selectedStr) {
      this.tempSelectedValues = selectedStr.split(',').map(v => v.trim()).filter(v => v);
    }
    this.showDivSelectionPopup = false;
  }


      @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  if (!this.showPopup && !this.showDivSelectionPopup) return;

  const clickedInside = this.elementRef.nativeElement.contains(event.target);
  if (!clickedInside && this.showPopup) {
    this.showPopup = false;
  }
  if (!clickedInside && this.showDivSelectionPopup) {
    this.showDivSelectionPopup = false;
  }
}
}