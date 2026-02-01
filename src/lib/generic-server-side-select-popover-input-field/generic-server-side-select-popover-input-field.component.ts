import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, OnDestroy, SimpleChanges } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PopupManagerService } from '../Services/popup-manager.service';

interface ColumnConfig {
  field: string;
  header: string;
  searchable: boolean;
}

interface ServerResponse {
  data: any[];
  totalCount: number;
}

@Component({
  selector: 'lib-generic-server-side-select-popover-input-field',
  templateUrl: './generic-server-side-select-popover-input-field.component.html',
  styleUrls: ['./generic-server-side-select-popover-input-field.component.css']
})
export class GenericServerSideSelectPopoverInputFieldComponent implements OnInit, OnDestroy {
  @Input() field: any;
  @Input() selected: any;
  @Input() apiUrlPOS: any;
  @Input() resetTriggered: boolean = false;

  @Output() selectionChange = new EventEmitter<string>();

  // Make Math available in template
  Math = Math;

  // UI State
  showPopup = false;
  showSelectionPopup = false;
  selectionPopupStyle: any = {};
  fieldName = 'Selection';
  selectedSingle: string = '';
  selectedValues: string[] = [];
  tempSelectedValues: string[] = [];
  popupStyle: any = {};
  popupData: string[] = [];
  popupArrowColor = '#FEF5BE';
  // Server-side data
  filteredOptions: any[] = [];
  currentPage = 1;
  itemsPerPage = 15;
  totalPages = 1;
  totalCount = 0;
  isLoading = false;

  // Search
  searchTerm = '';
  searchField = 'ACNAME'; // Default search field
  searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Column configuration - customizable based on data type
  columns: ColumnConfig[] = [];
  searchableColumns: ColumnConfig[] = [];

    private componentId = `multiselectpopover-popup-${Math.random().toString(36).substr(2, 9)}`;
  private popupSubscription?: Subscription;

  constructor(
    private elementRef: ElementRef,
    private http: HttpClient,
    private popupManagerService: PopupManagerService
  ) {}

  ngOnInit(): void {
    this.fieldName = this.field.fieldName || 'Selection';
    this.setupColumns();
    this.setupSearch();
    
    // Initialize selected values
    if (this.field.controlType === 'singleselect') {
      if (this.selected && this.selected !== '%') {
        this.selectedSingle = this.selected;
      }
    } else if (this.field.controlType === 'multiselect') {
      this.selectedValues = Array.isArray(this.selected) ? [...this.selected] : [];
      this.tempSelectedValues = [...this.selectedValues];
    }

    //popup manage
        this.popupSubscription = this.popupManagerService.closeAllPopups$.subscribe(
      (requestingComponentId: string) => {
        // Close this popup if another component requested it
        if (requestingComponentId !== this.componentId) {
          this.hidePopup();
        }
      }
    );

    // Load initial data
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
        if (changes['selected']) {
      console.log('selected changed:',changes['selected']);
      if(changes['selected'].currentValue == '%'){
        this.selected = this.field.defaultFieldValue || (this.field.controlType =='multiselect' ? [] : '');
        if(this.field.controlType =='multiselect'){
          // this.tempSelectedValues = [...this.valueArray];
        }
        else{
          this.selectedSingle = '';
          this.getDisplayValue();
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  setupColumns() {
    // Determine columns based on field configuration or data type
    // You can customize this based on different field types
    const fieldId = this.field.fieldId;
    if (fieldId == 'CUSTID' || fieldId == 'VENDORID') {
      // Account/Customer/Vendor columns
      this.columns = [
        { field: 'ACNAME', header: 'Name', searchable: true },
        { field: 'CUSTID', header: 'Code', searchable: true },
        { field: 'ADDRESS', header: 'Address', searchable: true },
        { field: 'VATNO', header: 'VAT No', searchable: true }
      ];
    }else if (fieldId == 'ACID') {
      // Account/Customer/Vendor columns
      this.columns = [
        { field: 'ACNAME', header: 'Name', searchable: true },
        { field: 'ACID', header: 'Code', searchable: true },
        { field: 'ADDRESS', header: 'Address', searchable: true },
        { field: 'VATNO', header: 'VAT No', searchable: true }
      ];
    } else if (fieldId === 'MCODE' || fieldId.includes('ITEM')) {
      // Item columns
      this.columns = [
        { field: 'MCODE', header: 'Item Code', searchable: true },
        { field: 'DESCA', header: 'Description', searchable: true },
      ];
    } else {
      // Default columns - will adapt based on first data received
      this.columns = [
        { field: 'name', header: 'Name', searchable: true },
        { field: 'value', header: 'Value', searchable: true }
      ];
    }

    this.searchableColumns = this.columns.filter(col => col.searchable);
    this.searchField = this.searchableColumns[0]?.field || 'ACNAME';
  }

  setupSearch() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadData();
    });
  }

  loadData() {
    if (!this.field.fieldSelectionValues?.apiURL) {
      console.error('API URL not configured');
      this.filteredOptions = [];
      this.totalCount = 0;
      this.totalPages = 0;
      return;
    }

    this.isLoading = true;
    const apiUrl = this.buildApiUrl();

    this.http.get<ServerResponse>(apiUrl).subscribe({
      next: (response) => {
        this.filteredOptions = response.data || [];
        this.totalCount = response.totalCount || 0;
        this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
        this.isLoading = false;

        // Auto-detect columns from first data item if using default columns
        if (this.filteredOptions.length > 0 && this.columns[0]?.field === 'name') {
          this.autoDetectColumns(this.filteredOptions[0]);
        }
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.isLoading = false;
        this.filteredOptions = [];
        this.totalCount = 0;
        this.totalPages = 0;
      }
    });
  }

  autoDetectColumns(firstItem: any) {
    const keys = Object.keys(firstItem);
    const importantFields = ['ACNAME', 'ACID', 'ADDRESS', 'MCODE', 'DESCA', 'name', 'value'];
    
    const detectedColumns: ColumnConfig[] = [];
    importantFields.forEach(field => {
      if (keys.includes(field)) {
        detectedColumns.push({
          field: field,
          header: this.formatHeader(field),
          searchable: true
        });
      }
    });

    if (detectedColumns.length > 0) {
      this.columns = detectedColumns.slice(0, 4); // Show max 4 columns
      this.searchableColumns = this.columns;
      this.searchField = this.searchableColumns[0].field;
    }
  }

  formatHeader(field: string): string {
    const headerMap: { [key: string]: string } = {
      'ACNAME': 'Name',
      'ACID': 'Code',
      'CUSTID':'Code',
      'ADDRESS': 'Address',
      'VATNO': 'VAT No',
      'MCODE': 'Item Code',
      'DESCA': 'Description'
    };
    return headerMap[field] || field;
  }

  buildApiUrl(): string {
    let baseUrl = this.field.fieldSelectionValues.apiURL;
    // Add base URL if relative
    if (!baseUrl.startsWith('http')) {
      // const origin = window.location.origin;
      const origin = this.apiUrlPOS;
      baseUrl = baseUrl.startsWith('/') ? `${origin}${baseUrl}` : `${origin}/${baseUrl}`;
    }

    let params = new HttpParams()
      .set('currentPage', this.currentPage.toString())
      .set('maxResultCount', this.itemsPerPage.toString());

    // Add search filter if present
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const filters = [{
        Field: this.searchField,
        Value: this.searchTerm,
        SearchMode: 0
      }];
      params = params.set('filters', JSON.stringify(filters));
    }

    return `${baseUrl}?${params.toString()}`;
  }

    togglePopup(event: MouseEvent, data: string[], color: string) {
    // if(this.field.controlType =='singleselect' || this.showSelectionPopup || data.length == 0){
    //   return;
    // }
    // const target = event.currentTarget as HTMLElement;
    // const rect = target.getBoundingClientRect();

    // console.log('data',data,'this.options',this.options,'target gets here',target,'rect information gets here....',rect)
    // const matchedNames = this.options.filter(opt => data.includes(opt.value)).map(opt => opt.name);

    // console.log('Matched names:', matchedNames);

    // this.popupData = matchedNames;
    // this.popupArrowColor = color;
    // this.popupStyle = {
    //   position: 'fixed',
    //   top: `${rect.top + rect.height + 20}px`,
    //   left: `${rect.right + 30}px`,
    //   transform: 'translateY(-50%)',
    //   zIndex: 9999,
    //   backgroundColor: color,
    //   '--popup-arrow-color': color
    // };
    // this.popupManagerService.requestCloseOthers(this.componentId);
    // this.showPopup = true;
  }

  toggleSelectionPopup(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    if (this.field.isRequired === true) {
      this.selectionPopupStyle = {
        position: 'absolute',
        zIndex: 9999,
        margin: 'auto',
        backgroundColor: '#fff'
      };
    } else {
      this.selectionPopupStyle = {
        position: 'fixed',
        top: '320px',
        left: '24%',
        transform: 'translateY(-50%)',
        zIndex: 9999,
        backgroundColor: '#fff'
      };
    }

    if (this.field.controlType === 'multiselect') {
      this.tempSelectedValues = [...this.selectedValues];
    }

    this.searchTerm = '';
    this.currentPage = 1;
    this.showSelectionPopup = !this.showSelectionPopup;

    if (this.showSelectionPopup) {
      this.loadData();
    }
      this.showPopup = false;
  }

  hidePopup() {
    this.showPopup = false;
    this.popupData = [];
  }

  onSearchFieldChange(field: string) {
    this.searchField = field;
    if (this.searchTerm) {
      this.currentPage = 1;
      this.loadData();
    }
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  // Pagination
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadData();
    }
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
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
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (this.currentPage <= 3) {
        for (let i = 2; i <= Math.min(4, this.totalPages - 1); i++) {
          pages.push(i);
        }
        if (this.totalPages > 4) pages.push('...');
      } else if (this.currentPage >= this.totalPages - 2) {
        if (this.totalPages > 4) pages.push('...');
        for (let i = Math.max(this.totalPages - 3, 2); i <= this.totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
      }

      if (this.totalPages > 1) pages.push(this.totalPages);
    }

    return pages;
  }

  // Selection methods
  applyValueSelectionSingle(item: any) {
    if (this.field.controlType === 'singleselect') {
      // Use the primary identifier field
      const valueField = this.getValueField();
      const nameField = this.getNameField();
      
      this.selected = item[valueField];
      this.selectedSingle = item[nameField];
      this.selectionChange.emit(this.selected);
      this.showSelectionPopup = false;
    }
  }

  toggleTempValueSelection(item: any, event: Event) {
    const input = event.target as HTMLInputElement;
    const valueField = this.getValueField();
    const value = item[valueField];

    if (input.checked) {
      if (!this.tempSelectedValues.includes(value)) {
        this.tempSelectedValues = [...this.tempSelectedValues, value];
      }
    } else {
      this.tempSelectedValues = this.tempSelectedValues.filter(v => v !== value);
    }
  }

    toggleAllTempValues(event: Event) {
    const input = event.target as HTMLInputElement;
    this.field.fieldValue = input.checked ? '%' : '';
  }

  isChecked(item: any): boolean {
    const valueField = this.getValueField();
    return this.tempSelectedValues.includes(item[valueField]);
  }

  applyValueSelection() {
    this.selectedValues = [...this.tempSelectedValues];
    const passedValues = this.selectedValues.join(',');
    this.selectionChange.emit(passedValues?passedValues:'%');
    this.showSelectionPopup = false;
  }

  cancelValueSelection() {
    this.tempSelectedValues = [];
    this.showSelectionPopup = false;
  }

  getValueField(): string {
    // Determine which field to use as value
    const firstItem = this.filteredOptions[0];
    const fieldId = this.field.fieldId;
    if (!firstItem) return 'value';

    if ('ACID' in firstItem && fieldId == 'ACID') return 'ACID';
    if ('CUSTID' in firstItem && fieldId == 'CUSTID') return 'CUSTID';
    if ('MCODE' in firstItem) return 'MCODE';
    if ('value' in firstItem) return 'value';
    
    return Object.keys(firstItem)[0];
  }

  getNameField(): string {
    // Determine which field to use as display name
    const firstItem = this.filteredOptions[0];
    if (!firstItem) return 'name';

    if ('ACNAME' in firstItem) return 'ACNAME';
    if ('DESCA' in firstItem) return 'DESCA';
    if ('name' in firstItem) return 'name';
    
    return Object.keys(firstItem)[0];
  }

  getDisplayValue(): string {
    if (this.field.controlType === 'singleselect') {
      return this.selectedSingle || 'Select an option';
    } else {
      if (this.selectedValues.length === 0) return '(0) Selected';
      return `(${this.selectedValues.length}) Selected`;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showSelectionPopup) return;
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showSelectionPopup = false;
    }
  }
}