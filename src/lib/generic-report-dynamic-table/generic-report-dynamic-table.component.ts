import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';

export interface TableColumn {
  key: string;
  title: string;
  titleGroup?: string;
  width?: string;
  alignment?: 'left' | 'center' | 'right';
  hidden?: boolean;
  formatType?: number;
  formatString?: string;
  sortOrder?: 'asc' | 'desc' | 'none';
  colPosition?: number;
  style?: string;
  noSearch?: boolean;
  dirty?: number;
  isDynamicColumn?: boolean;
}

export interface GroupedHeader {
  group: string;
  columns: TableColumn[];
  colspan: number;
}

export interface TableConfig {
  columns: TableColumn[];
  data: any[];
  totalItems: number;
  pageSize: number;
  currentPage: number;
  showSerialNo?: boolean;
  showActions?: boolean;
  actionKeys?: any[];
  totalData?: any;
  hasGroupedHeaders?: boolean;
}

export interface ApiResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export interface SortConfig {
  column: string;
  order: 'asc' | 'desc' | 'none';
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface ActionConfig {
  text: string;
  title: string;
  type: 'button' | 'icon' | 'checkbox';
  icon?: string;
  confirmMessage?: string;
}

@Component({
  selector: 'lib-generic-report-dynamic-table',
  templateUrl: './generic-report-dynamic-table.component.html',
  styleUrls: ['./generic-report-dynamic-table.component.scss']
})
export class GenericReportDynamicTableComponent implements OnInit, OnChanges {
  @Input() tableConfig!: TableConfig;
  @Input() title: string = 'Report Table';
  @Input() loading: boolean = false;
  @Input() reportConfig: any = null;
  @Input() enableSearch: boolean = true;
  @Input() externalSearchTerm: string = '';
  @Input() searchChange: string = '';
  @Input() hideAdvancedSearch: boolean = false;
  @Input() REPHEADING_FontName: string = 'Roboto';
@Input() REPHEADING_Fontsize: string = '12px';
@Input() REPDETAIL_FontSize: string = '12px';
@Input() REPDETAIL_FontName: string = 'Roboto';
@Input() REPTOTAL_FontName: string = 'Roboto';
@Input() REPTOTAL_Fontsize: string = '12px';
  
  @Output() onPageChange = new EventEmitter<any>();
  @Output() onSortChange = new EventEmitter<any>();
  @Output() onActionClick = new EventEmitter<any>();
  @Output() onColumnSettingChange = new EventEmitter<any>();
  @Output() searchChange$ = new EventEmitter<string>(); 
@Output() onColumnSettingSave = new EventEmitter<any>();
    @Output() rowRightClick = new EventEmitter<{ event: MouseEvent; row: any}>();

  

  @ViewChild('tableContainer') tableContainer!: ElementRef;

  

  // Pagination
  currentPage: number = 1;
  pageSize: number = 50;
  totalItems: number = 0;
  totalPages: number = 1;
  
  // Data
  displayData: any[] = [];
  filteredData: any[] = [];
  originalData: any[] = [];
  columns: TableColumn[] = [];
  totalRow: any = {};
  
  // Header structure
  groupedHeaders: GroupedHeader[] = [];
  hasGroupedHeaders: boolean = false;
  basicColumns: TableColumn[] = [];
  
  // Search
  searchTerm: string = '';
  searchableColumns: TableColumn[] = [];
  
  // UI State
  pageSizes = [10, 25, 50, 100];
  Math = Math;
  Object = Object;
  showColumnSearch: boolean = false;
  columnSearchTerms: { [key: string]: string } = {};

  constructor(private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initializeTable();
    const pageSize = Number(this.tableConfig?.pageSize);

if (!isNaN(pageSize) && pageSize > 0) {

  if (!this.pageSizes.includes(pageSize)) {
    this.pageSizes.push(pageSize);

    this.pageSizes.sort((a, b) => a - b);
  }
}

  }


     ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableConfig'] && this.tableConfig) {
      console.log('TableConfig changed:', this.tableConfig);
      this.initializeTable();
    }
    if (changes['reportConfig'] && this.reportConfig) {
      console.log('ReportConfig changed:', this.reportConfig);
      this.processReportConfig();
    }
    
    // Handle external search term changes
    if (changes['externalSearchTerm'] && changes['externalSearchTerm'].currentValue !== undefined) {
      const newSearchTerm = changes['externalSearchTerm'].currentValue;
      console.log('External search term changed:', newSearchTerm);
      
      // Update internal search term and perform search
      this.searchTerm = newSearchTerm;
      this.performSearch();
      if(this.showColumnSearch == true && this.searchTerm){
        this.showColumnSearch = false;
        this.columnSearchTerms = {};
      }
      // Emit search change if needed
      this.searchChange$.emit(this.searchTerm);
    }

    if (changes['hideAdvancedSearch']) {
      console.log('hideAdvancedSearch changed:', this.hideAdvancedSearch);
      if (this.hideAdvancedSearch == false && this.searchTerm) {
        this.searchTerm = '';
        this.performSearch();
        this.columnSearchTerms = {};
      }
      this.toggleColumnSearch();
    }
  }

  initializeTable(): void {
    console.log('Initializing table with config:', this.tableConfig);
    if (!this.tableConfig) {
      console.warn('No table config provided');
      return;
    }
    
    this.columns = this.tableConfig.columns || [];
    this.originalData = this.tableConfig.data || [];
    this.filteredData = [...this.originalData];
    this.totalItems = this.filteredData.length;
    this.pageSize = this.tableConfig.pageSize || 50;
    this.currentPage = this.tableConfig.currentPage || 1;
    this.totalRow = this.tableConfig.totalData || {};
    
    console.log('Data initialized:', {
      columnsCount: this.columns.length,
      dataCount: this.originalData.length,
      sampleData: this.originalData.slice(0, 2)
    });
    
    // Process headers FIRST to ensure columns are ready
    this.processHeaders();
    this.initializeSearch();
    this.calculateTotalPages();
    this.displayData = this.getPaginatedData();
    
    // Force change detection after everything is set up
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
    
    console.log('Table initialized - Display data:', this.displayData);
    console.log('Final column state:', {
      hasGroupedHeaders: this.hasGroupedHeaders,
      basicColumnsCount: this.basicColumns.length,
      groupedHeadersCount: this.groupedHeaders.length,
      displayColumnsCount: this.getAllDisplayColumns().length
    });
  }

  processReportConfig(): void {
    console.log('Processing report config:', this.reportConfig);

    if (!this.reportConfig || !this.reportConfig.projectionfieldFormats) return;
    
    const projectionFields = this.reportConfig.projectionfieldFormats;
    const processedColumns: TableColumn[] = [];
    
    projectionFields.forEach((field: any) => {
      if (!field.hidden && field.key) {
        processedColumns.push({
          key: field.key,
          title: field.title || field.key,
          titleGroup: field.titleGroup || '',
          width: field.width || 'auto',
          alignment: field.alignment || 'left',
          hidden: field.hidden || false,
          formatType: field.formatType || 0,
          formatString: field.formatString || '',
          sortOrder: field.sortOrder || '',
          colPosition: field.colPosition || 0,
          style: field.style || '',
          noSearch: field.noSearch || false,
          dirty: field.dirty || 0
        });
      }
    });
    
    if (!this.tableConfig) {
      this.tableConfig = {
        columns: processedColumns,
        data: [],
        totalItems: 0,
        pageSize: 50,
        currentPage: 1
      };
    } else {
      this.tableConfig.columns = processedColumns;
    }
    
    this.columns = processedColumns;
    this.processHeaders();
    this.initializeSearch();
  }

  processHeaders(): void {
    const visibleColumns = this.getVisibleColumns();
    console.log('Processing headers for columns:', visibleColumns.length);
    
    // More robust check for grouped headers
    const hasGroups = visibleColumns.some(col => {
      const hasValidTitleGroup = col.titleGroup && col.titleGroup.trim() !== '';
      const hasGroupInKey = col.key.includes('~');
      return hasValidTitleGroup || hasGroupInKey;
    });
    
    this.hasGroupedHeaders = hasGroups;
    console.log('Has grouped headers:', this.hasGroupedHeaders);
    
    if (hasGroups) {
      this.createGroupedHeaders(visibleColumns);
    } else {
      this.basicColumns = [...visibleColumns];
      this.groupedHeaders = []; // Clear grouped headers
    }
    
    // Force change detection after processing headers
    this.cdr.markForCheck();
    
    console.log('Processing complete:', {
      hasGroupedHeaders: this.hasGroupedHeaders,
      basicColumnsCount: this.basicColumns.length,
      groupedHeadersCount: this.groupedHeaders.length
    });
  }

// Update the createGroupedHeaders method
createGroupedHeaders(columns: TableColumn[]): void {
  const groups: { [key: string]: TableColumn[] } = {};
  const groupFirstIndex: { [key: string]: number } = {}; // Track first index of each group
  const basicCols: TableColumn[] = [];
  
  // First pass: categorize columns
  columns.forEach((column, index) => {
    let groupKey = '';
    let processedColumn = { ...column };
    
    // Check for titleGroup first (preferred method)
    if (column.titleGroup && column.titleGroup.trim() !== '') {
      groupKey = column.titleGroup.trim();
      // Keep the original title for sub-columns
    } 
    // Fallback to checking key with ~ separator
    else if (column.key.includes('~')) {
      const parts = column.key.split('~');
      if (parts.length >= 2) {
        groupKey = parts[0].trim();
        // Extract title from sub-header, removing any configuration after ^
        let subHeader = parts[1].trim();
        if (subHeader.includes('^')) {
          subHeader = subHeader.split('^')[0].trim();
        }
        processedColumn.title = subHeader;
      }
    }
    
    if (groupKey) {
      if (!groups[groupKey]) {
        groups[groupKey] = [];
        groupFirstIndex[groupKey] = index; // Track first occurrence index
      }
      groups[groupKey].push(processedColumn);
    } else {
      basicCols.push({ ...processedColumn, _originalIndex: index } as any);
    }
  });
  
  this.groupedHeaders = [];
  
  // Build headers array preserving original order
  // Create array of all header items with their original indices
  const headerItems: Array<{ type: 'basic' | 'group', index: number, data: any }> = [];
  
  // Add basic columns with their original indices
  basicCols.forEach(col => {
    headerItems.push({
      type: 'basic',
      index: (col as any)._originalIndex,
      data: col
    });
  });
  
  // Add group headers with their first occurrence index
  Object.keys(groups).forEach(groupKey => {
    headerItems.push({
      type: 'group',
      index: groupFirstIndex[groupKey],
      data: { groupKey, columns: groups[groupKey] }
    });
  });
  
  // Sort by original index to preserve order
  headerItems.sort((a, b) => a.index - b.index);
  
  // Build final groupedHeaders array
  headerItems.forEach(item => {
    if (item.type === 'basic') {
      const col = item.data;
      delete (col as any)._originalIndex; // Clean up temporary property
      this.groupedHeaders.push({
        group: '',
        columns: [col],
        colspan: 1
      });
    } else {
      this.groupedHeaders.push({
        group: item.data.groupKey,
        columns: item.data.columns,
        colspan: item.data.columns.length
      });
    }
  });
  
  this.basicColumns = basicCols.map(col => {
    const { _originalIndex, ...rest } = col as any;
    return rest;
  });
  
  console.log('Grouped headers created:', {
    groupedHeaders: this.groupedHeaders,
    basicColumns: this.basicColumns,
    groupFirstIndex: groupFirstIndex
  });
}

  // Search functionality
  initializeSearch(): void {
    this.searchableColumns = this.getAllDisplayColumns().filter(col => !col.noSearch);
  }

    // Modified search methods to handle external search
  onSearchChange(searchTerm: string): void {
    // Only handle internal search if external search is not being used
    if (!this.externalSearchTerm && this.externalSearchTerm !== '') {
      this.searchTerm = searchTerm.toLowerCase();
      this.performSearch();
      this.searchChange$.emit(searchTerm);
    }
  }



    performSearch(): void {
    const searchTerm = this.searchTerm.toLowerCase();
    
    if (!searchTerm.trim()) {
      this.filteredData = [...this.originalData];
    } else {
      this.filteredData = this.originalData.filter(row => {
        return this.searchableColumns.some(column => {
          const cellValue = row[column.key];
          if (cellValue === null || cellValue === undefined) return false;
          return cellValue.toString().toLowerCase().includes(searchTerm);
        });
      });
    }
    
    this.totalItems = this.filteredData.length;
    this.currentPage = 1; // Reset to first page
    this.calculateTotalPages();
    this.displayData = this.getPaginatedData();
  }
  
  clearSearch(): void {
    // Only handle internal clear if external search is not being used
    if (!this.externalSearchTerm && this.externalSearchTerm !== '') {
      this.searchTerm = '';
      this.performSearch();
      this.searchChange$.emit('');
    }
  }

  // Get paginated data
  getPaginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedData = this.filteredData.slice(startIndex, endIndex);
    console.log('Getting paginated data:', {
      startIndex,
      endIndex,
      totalFiltered: this.filteredData.length,
      paginatedCount: paginatedData.length,
      samplePaginatedData: paginatedData.slice(0, 2)
    });
    return paginatedData;
  }

  // Getter property to ensure template always gets fresh data
  get displayColumns(): TableColumn[] {
    return this.getAllDisplayColumns();
  }

  // Get all columns for data display (flattened)
  getAllDisplayColumns(): TableColumn[] {
    let result: TableColumn[] = [];
    if (this.hasGroupedHeaders && this.groupedHeaders.length > 0) {
      this.groupedHeaders.forEach(group => {
        result.push(...group.columns);
      });
    } else if (this.basicColumns.length > 0) {
      result = [...this.basicColumns];
    } else {
      // Fallback: if both are empty, use visible columns directly
      result = this.getVisibleColumns();
    }    
    return result;
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
  }

  // Pagination Methods
  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.calculateTotalPages();
    this.displayData = this.getPaginatedData();
    this.emitPageChange();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.displayData = this.getPaginatedData();
      this.emitPageChange();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.displayData = this.getPaginatedData();
      this.emitPageChange();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.displayData = this.getPaginatedData();
      this.emitPageChange();
    }
  }

  emitPageChange(): void {
    this.onPageChange.emit({
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalPages: this.totalPages,
      totalItems: this.totalItems
    });
  }

  // Sorting
  onSort(column: TableColumn): void {
    const allColumns = this.getAllDisplayColumns();
    allColumns.forEach(col => {
      if (col.key !== column.key) {
        col.sortOrder = 'none';
      }
    });

    if (column.sortOrder === 'asc') {
      column.sortOrder = 'desc';
    } else if (column.sortOrder === 'desc') {
      column.sortOrder = 'none';
    } else {
      column.sortOrder = 'asc';
    }

    this.performSort(column);

    this.onSortChange.emit({
      column: column.key,
      order: column.sortOrder
    });
  }

  performSort(column: TableColumn): void {
    if (column.sortOrder === 'none') {
      // Reset to original order
      this.filteredData = [...this.originalData];
      if (this.searchTerm) {
        this.performSearch();
        return;
      }
    } else {
      this.filteredData.sort((a, b) => {
        const aValue = a[column.key];
        const bValue = b[column.key];
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        let comparison = 0;
        
        // Compare based on data type
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = aValue.toString().localeCompare(bValue.toString());
        }
        
        return column.sortOrder === 'asc' ? comparison : -comparison;
      });
    }
    
    this.currentPage = 1;
    this.displayData = this.getPaginatedData();
  }

  // Utility Methods
  getSerialNumber(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

formatCellValue(value: any, column: TableColumn): string {
  if (value === null || value === undefined) return '';
  if (value === 0) return '0';
  // if(column.formatString){console.log('formatString present:', column);}
  
  try {
    switch (column.formatType) {
      case 0: // STRING / TEXT (NO SCIENTIFIC NOTATION)
        return this.convertScientificToDecimal(value);
      
      case 1: // NUMBER
        if (column.formatString) {
          return this.applyNumberFormat(value, column.formatString);
        }
        return this.convertScientificToDecimal(value);
      
      case 2: // DATE
        if (typeof value === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(value)) {
          return value;
        }
        
        const date = this.parseDate(value);
        if (!date || isNaN(date.getTime())) {
          return String(value);
        }
        
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      
      case 3: // TWO DECIMAL ROUNDING
        if (column.formatString) {
          return this.applyNumberFormat(value, column.formatString);
        }
        if (typeof value === 'number') {
          return value.toFixed(2);
        }
        return this.convertScientificToDecimal(value);
      
      default:
        return this.convertScientificToDecimal(value);
    }
  } catch (error) {
    console.warn('Error formatting cell value:', error);
    return String(value);
  }
}

private applyNumberFormat(value: any, formatString: string): string {
  const cleanValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
const numValue = typeof cleanValue === 'number' ? cleanValue : parseFloat(cleanValue);
  
  if (isNaN(numValue)) {
    return this.convertScientificToDecimal(value);
  }
  
  // Determine decimal places from format string
  const decimalPart = formatString.split('.')[1];
  const decimalPlaces = decimalPart ? decimalPart.length : 0;
  
  // Round to specified decimal places
  const fixedValue = numValue.toFixed(decimalPlaces);
  const [integerPart, decimal] = fixedValue.split('.');
  
  let formattedInteger: string;
  
  // Check format type
  if (formatString.includes('##,##,###')) {
    // Indian numbering system (##,##,###.##)
    debugger
    formattedInteger = this.formatIndianNumber(integerPart);
  } else if (formatString.includes('###,###')) {
    // International numbering system (###,###.##)
    formattedInteger = this.formatInternationalNumber(integerPart);
  } else {
    // Default: no formatting
    formattedInteger = integerPart;
  }
  
  // Combine integer and decimal parts
  return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
}

private formatInternationalNumber(value: string): string {
  // Format as ###,###,### (groups of 3 from right)
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

private formatIndianNumber(value: string): string {
  // Format as ##,##,### (last 3 digits, then groups of 2)
  const lastThree = value.slice(-3);
  const otherNumbers = value.slice(0, -3);
  
  if (otherNumbers !== '') {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return lastThree;
}

convertScientificToDecimal(value: any): string {
  const num = Number(value);

  if (!isFinite(num)) return String(value);

  // If number is NOT in scientific notation, return normal string
  if (!/e/i.test(String(value))) {
    return String(value);
  }

  // Convert scientific notation safely
  return num.toFixed(20).replace(/\.?0+$/, '');
}
// Helper method to parse different date formats
private parseDate(value: any): Date | null {
  if (!value) return null;
  
  // If it's already a Date object
  if (value instanceof Date) {
    return value;
  }
  
  const stringValue = value.toString().trim();
  
  // Try ISO format first (2025-08-10T00:00:00)
  let date = new Date(stringValue);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try DD/MM/YYYY format
  const ddmmyyyyMatch = stringValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Try MM/DD/YYYY format
  const mmddyyyyMatch = stringValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyyMatch) {
    const [, month, day, year] = mmddyyyyMatch;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
}

  onAction(action: string, rowData: any, index: number): void {
    this.onActionClick.emit({
      action,
      data: rowData,
      index: this.getSerialNumber(index) - 1 // Convert back to original index
    });
  }

  // Get visible columns
  getVisibleColumns(): TableColumn[] {
    return this.columns.filter(col => !col.hidden);
  }

  getPaginationNumbers(): (number | string)[] {
  const pages: (number | string)[] = [];
  const total = this.totalPages;
  const current = this.currentPage;
  const delta = 2; // how many pages around current

  // Always add first page
  pages.push(1);

  // Add left ellipsis
  if (current - delta > 2) {
    pages.push("...");
  }

  // Middle pages
  const start = Math.max(2, current - delta);
  const end = Math.min(total - 1, current + delta);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add right ellipsis
  if (current + delta < total - 1) {
    pages.push("...");
  }

  // Always add last page
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}


  trackByFn(index: number, item: any): any {
    return item.id || item.ACID || item.ACCODE || index;
  }

  // Track by function for columns to optimize *ngFor performance
  trackByColumn(index: number, column: TableColumn): string {
    return column.key;
  }

  // Calculate total columns for colspan
  getTotalColspan(): number {
    let total = 0;
    if (this.tableConfig?.showSerialNo) total++;
    
    const displayColumns = this.getAllDisplayColumns();
    total += displayColumns.length;
    
    if (this.tableConfig?.showActions) total++;
    return total;
  }



// Add method to toggle column search
toggleColumnSearch(): void {
  this.showColumnSearch = !this.showColumnSearch;
  if (!this.showColumnSearch) {
    this.clearAllColumnSearches();
  }
}

// Handle column-specific search
onColumnSearch(columnKey: string, searchTerm: string): void {
  this.columnSearchTerms[columnKey] = searchTerm.toLowerCase();
  this.performColumnSearch();
}

// Perform filtering based on column searches
performColumnSearch(): void {
  let filtered = [...this.originalData];
  
  // Apply column-specific filters
  Object.keys(this.columnSearchTerms).forEach(columnKey => {
    const searchTerm = this.columnSearchTerms[columnKey];
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(row => {
        const cellValue = row[columnKey];
        if (cellValue === null || cellValue === undefined) return false;
        return cellValue.toString().toLowerCase().includes(searchTerm);
      });
    }
  });
  
  this.filteredData = filtered;
  this.totalItems = this.filteredData.length;
  this.currentPage = 1;
  this.calculateTotalPages();
  this.displayData = this.getPaginatedData();
}

// Clear all column searches
clearAllColumnSearches(): void {
  this.columnSearchTerms = {};
  this.filteredData = [...this.originalData];
  this.totalItems = this.filteredData.length;
  this.calculateTotalPages();
  this.displayData = this.getPaginatedData();
}

// Clear specific column search
clearColumnSearch(columnKey: string): void {
  delete this.columnSearchTerms[columnKey];
  this.performColumnSearch();
}
saveColumnSettings(columns: TableColumn[]): void {
  const dirtyColumns = columns.filter(col => (col as any).dirty === 1);
  this.onColumnSettingSave.emit(dirtyColumns);
}



  onContextMenuClick(event: MouseEvent, row: any): void {
    event.preventDefault();
    console.log('masterService.simpleTablesettings.title','from library: Right click event:', event, 'Row data:', row);
    // const title = this.masterService.simpleTablesettings.title;
    this.rowRightClick.emit({ event, row });
  }

  // Debugging helper
  debugTableState(): void {
    console.log('=== TABLE DEBUG INFO ===');
    console.log('Has grouped headers:', this.hasGroupedHeaders);
    console.log('Basic columns:', this.basicColumns);
    console.log('Grouped headers:', this.groupedHeaders);
    console.log('All display columns:', this.getAllDisplayColumns());
    console.log('Display data:', this.displayData);
    console.log('Filtered data length:', this.filteredData.length);
    console.log('Original data length:', this.originalData.length);
    console.log('Sample data row:', this.displayData[0]);
    console.log('Column keys from getAllDisplayColumns:', this.getAllDisplayColumns().map(col => col.key));
    console.log('Data keys from first row:', this.displayData.length > 0 ? Object.keys(this.displayData[0]) : 'No data');
    
    // Check data alignment
    if (this.displayData.length > 0) {
      const dataKeys = Object.keys(this.displayData[0]);
      const columnKeys = this.getAllDisplayColumns().map(col => col.key);
      const missingInData = columnKeys.filter(key => !dataKeys.includes(key));
      const missingInColumns = dataKeys.filter(key => !columnKeys.includes(key));
      
      console.log('Keys missing in data:', missingInData);
      console.log('Keys missing in columns:', missingInColumns);
    }
  }









}