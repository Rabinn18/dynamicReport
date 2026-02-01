import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { PopupManagerService } from '../Services/popup-manager.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-generic-multi-select-popover-input-field',
  templateUrl: './generic-multi-select-popover-input-field.component.html',
  styleUrls: ['./generic-multi-select-popover-input-field.component.css']
})
export class GenericMultiSelectPopoverInputFieldComponent implements OnInit {
  selectedValues: string[] = [];
  private componentId = `multiselectpopover-popup-${Math.random().toString(36).substr(2, 9)}`;
  private popupSubscription?: Subscription;

  
  constructor(private elementRef: ElementRef, private popupManagerService: PopupManagerService) { }

  @Input() options: any[] = [];
  @Input() selected: any; 
  @Input() field: any;
  @Input() resetTriggered: boolean = false;

  @Output() selectionChange = new EventEmitter<string>();

  @ViewChild('hoverTarget', { static: false }) hoverTarget!: ElementRef;

  valueArray: string[] = [];
  tempSelectedValues: string[] = [];
  fieldName = 'Item Name';

  showPopup = false;
  showSelectionPopup = false;
  popupStyle: any = {};
  selectionPopupStyle: any = {};
  popupData: string[] = [];
  popupArrowColor = '#FEF5BE';

  // Properties for search and pagination
  searchTerm = '';
  filteredOptions: { name: string; value: string }[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  selectedSingle: string = '';

  ngOnInit(): void {
    this.valueArray = this.options.map(opt => opt.value);
    this.tempSelectedValues = [...this.selected];
    this.selectedValues = this.mapSelectedToValues(this.selected);
    this.fieldName = this.field.fieldName || 'Item Name';
    
    if (this.field.controlType =='multiselect' && this.selected.length === 1 && (this.selected[0] === 'All' || this.selected === '%')) {
      this.tempSelectedValues = [...this.valueArray];
      this.selected = [...this.valueArray];
    }
    if(this.field.controlType =='singleselect'){
      if(this.selected[0] == "%" || this.selectedSingle == "%")this.selectedSingle = '';
      if(typeof this.selected === 'string')this.selectedSingle = this.options.filter(x => x.value === this.selected).map(x => x.name)[0];
    }
    
    this.updateFilteredOptions();
    console.log('Division Array:', this.valueArray, 'Selected:', this.selected, 'whole field:', this.field);

    this.popupSubscription = this.popupManagerService.closeAllPopups$.subscribe(
      (requestingComponentId: string) => {
        // Close this popup if another component requested it
        if (requestingComponentId !== this.componentId) {
          this.hidePopup();
        }
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
        if (changes['selected']) {
      console.log('selected changed:',changes['selected']);
      if(changes['selected'].currentValue == '%' && !this.field.fieldSelectionValues?.apiURL){
        this.selected = this.field.defaultFieldValue || (this.field.controlType =='multiselect' ? [] : '');
        if(this.field.controlType =='multiselect'){
          this.selected === '%';
          this.selectedValues = this.mapSelectedToValues(this.selected);
          this.tempSelectedValues = [...this.valueArray];
          this.selected = [...this.valueArray];
        }
        else{
          this.selectedSingle = 'All';
        }
      }
    }
  }

    ngOnDestroy() {
    if (this.popupSubscription) {
      this.popupSubscription.unsubscribe();
    }
  }

  togglePopup(event: MouseEvent, data: string[], color: string) {
    if(this.field.controlType =='singleselect' || this.showSelectionPopup || data.length == 0){
      return; // Do nothing for single select
    }
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    console.log('data',data,'this.options',this.options,'target gets here',target,'rect information gets here....',rect)
    const matchedNames = this.options.filter(opt => data.includes(opt.value)).map(opt => opt.name);

    console.log('Matched names:', matchedNames);

    this.popupData = matchedNames;
    this.popupArrowColor = color;
    this.popupStyle = {
      position: 'fixed',
      top: `${rect.top + rect.height + 20}px`,
      left: `${rect.right + 30}px`,
      transform: 'translateY(-50%)',
      zIndex: 9999,
      backgroundColor: color,
      '--popup-arrow-color': color
    };
    this.popupManagerService.requestCloseOthers(this.componentId);
    this.showPopup = true;
  }

  toggleSelectionPopup(event: MouseEvent, color: string) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    console.log('target gets here',target,'rect gets here', rect);
    if(this.field.isRequired == true){
      this.selectionPopupStyle = {
      position: 'absolute',
      zIndex: 9999,
      margin: 'auto',
      backgroundColor: color,
    };
    }
    else{
      this.selectionPopupStyle = {
      position: 'fixed',
      top: `${320}px`,
      left: `${24}%`,
      transform: 'translateY(-50%)',
      zIndex: 9999,
      backgroundColor: color,
    };
    }


    console.log('Array', Array.isArray(this.selected),'string', typeof this.selected === 'string')
    this.tempSelectedValues = [...this.selected];
    if(typeof this.selected === 'string'){
this.tempSelectedValues = (this.selected || "").split(',').map(x => x.trim());

    }
    this.searchTerm = '';
    this.currentPage = 1;
    this.updateFilteredOptions();
    this.showSelectionPopup = !this.showSelectionPopup;
    this.showPopup = false;
  }

  hidePopup() {
    this.showPopup = false;
    this.popupData = [];
  }

  toggleTempValueSelection(value: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.tempSelectedValues.includes(value)) {
        this.tempSelectedValues = [...this.tempSelectedValues, value];
      }
      if (value !== '%' && this.tempSelectedValues.includes('%')) {
          this.tempSelectedValues = this.tempSelectedValues.filter(item => item !== '%');
        }
    } else {
      this.tempSelectedValues = this.tempSelectedValues.filter(item => item !== value);
    }
  }

  toggleAllTempValues(event: Event) {
    const input = event.target as HTMLInputElement;
    this.tempSelectedValues = input.checked ? [...this.valueArray] : [];
  }

  // Updated method for search functionality
  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 1;
    this.updateFilteredOptions();
  }

  // Updated method to filter options based on search and pagination
  updateFilteredOptions() {
    let filtered = []
    if(this.field.isRequired == true){
        filtered = this.options;
    }else{
        filtered = this.options.filter(opt => opt.name !== 'All');
    }
    
    if (this.searchTerm) {
      filtered = this.options.filter(option => 
        option.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    this.totalPages = Math.ceil(filtered?.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    this.filteredOptions = filtered.slice(startIndex, endIndex);
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateFilteredOptions();
    }
  }

  // Handle page click including ellipsis
  onPageClick(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
    // Do nothing for ellipsis ('...')
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (this.currentPage <= 3) {
        // Show first few pages
        for (let i = 2; i <= Math.min(4, this.totalPages - 1); i++) {
          pages.push(i);
        }
        if (this.totalPages > 4) {
          pages.push('...');
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        // Show last few pages
        if (this.totalPages > 4) {
          pages.push('...');
        }
        for (let i = Math.max(this.totalPages - 3, 2); i <= this.totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
      }
      
      // Always show last page (if more than 1 page)
      if (this.totalPages > 1) {
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  applyValueSelectionSingle(value: any, name: string){
    if(this.field.controlType =='singleselect'){
      this.selected = value;
      this.selectedSingle = name;
      const passedValue = value;
      this.selectionChange.emit(passedValue);
      this.showSelectionPopup = false;
    }
  }

  applyValueSelection() {
    this.selected = [...this.tempSelectedValues];
    this.selectedValues = this.mapSelectedToValues(this.selected);
    const filteredValues = this.selected.filter(val => val !== '%');
    const passedValues = filteredValues.join(',');
    this.selectionChange.emit(passedValues);
    this.showSelectionPopup = false;
  }

  private mapSelectedToValues(selectedValues: string[]): string[] {
    if (!selectedValues || selectedValues.length === 0) return [];

    if (selectedValues.length === 1 && (selectedValues[0] === 'All' || selectedValues[0] === '%')) {
      return [...this.valueArray];
    }
    console.log('selectedValues gets here..',selectedValues)
    if(this.field.controlType =='singleselect'){
      return selectedValues}else{
        return selectedValues.filter(val => this.valueArray.includes(val));
      }
  }

  cancelValueSelection() {
    this.tempSelectedValues = [];
    this.showSelectionPopup = false;
  }

    isChecked(value: string): boolean {
    return this.tempSelectedValues.includes(value);
  }


    @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  if (!this.showPopup && !this.showSelectionPopup) return;

  const clickedInside = this.elementRef.nativeElement.contains(event.target);
  if (!clickedInside && this.showPopup) {
    this.showPopup = false;
  }
  if (!clickedInside && this.showSelectionPopup) {
    this.showSelectionPopup = false;
  }
}
}