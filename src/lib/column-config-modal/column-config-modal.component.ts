import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

export interface TableColumns {
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
  isDynamicColumn?: boolean; // Flag to mark columns with ~ separator (read-only in config)
}

@Component({
  selector: 'lib-column-config-modal',
  templateUrl: './column-config-modal.component.html',
  styleUrls: ['./column-config-modal.component.css']
})
export class ColumnConfigModalComponent implements OnInit, OnChanges {
  
  @Input() columns: TableColumns[] = [];
  @Input() show: boolean = false;
  @Output() onSave = new EventEmitter<TableColumns[]>();
  @Output() onClose = new EventEmitter<void>();
  
  workingColumns: TableColumns[] = [];
  originalColumns: TableColumns[] = [];
  
  ngOnInit(): void {
    this.initializeColumns();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && this.show) {
      this.initializeColumns();
    }
    
    if (changes['columns'] && this.columns) {
      this.initializeColumns();
    }
  }
  
  private initializeColumns(): void {
    // Deep clone to avoid modifying original
    this.workingColumns = JSON.parse(JSON.stringify(this.columns));
    this.originalColumns = JSON.parse(JSON.stringify(this.columns));
    
    // Sort by colPosition
    this.workingColumns.sort((a, b) => {
      const posA = a.colPosition || 0;
      const posB = b.colPosition || 0;
      if (posA === 0 && posB !== 0) return 1;
      if (posA !== 0 && posB === 0) return -1;
      return posA - posB;
    });
    
    console.log('Initialized workingColumns:', this.workingColumns);
  }
  
  onHiddenChange(column: TableColumns): void {
    // Toggle hidden state
    column.hidden = !column.hidden;
    this.markDirty(column);
  }
  
  saveSettings(): void {
    // Validate column positions (only for non-dynamic columns)
    this.validateAndFixPositions();
    
    // Remove dirty flag from dynamic columns (they shouldn't be saved)
    this.workingColumns.forEach(col => {
      if (this.isDynamicColumn(col)) {
        col.dirty = 0; // Reset dirty flag for dynamic columns
      }
    });
    
    // Sort columns by position before saving
    this.workingColumns.sort((a, b) => {
      const posA = a.colPosition || 0;
      const posB = b.colPosition || 0;
      if (posA === 0 && posB !== 0) return 1;
      if (posA !== 0 && posB === 0) return -1;
      return posA - posB;
    });
    
    console.log('Saving column settings:', this.workingColumns);
    this.onSave.emit(this.workingColumns);
  }
  
  resetToDefault(): void {
    if (confirm('Are you sure you want to reset all column settings to default?')) {
      // Reset all columns to original state
      this.workingColumns = JSON.parse(JSON.stringify(this.originalColumns));
      
      // Mark all as dirty
      this.workingColumns.forEach(col => {
        col.dirty = 1;
      });
      
      console.log('Reset to default:', this.workingColumns);
    }
  }
  
  closeModal(): void {
    this.onClose.emit();
  }
  
  markDirty(column: TableColumns): void {
    column.dirty = 1;
  }
  
  private validateAndFixPositions(): void {
    // Ensure all positions are valid and sequential (only for non-dynamic columns)
    let position = 1;
    this.workingColumns.forEach(col => {
      // Skip dynamic columns - they maintain their original position
      if (this.isDynamicColumn(col)) {
        return;
      }
      
      if (!col.colPosition || col.colPosition === 0) {
        col.colPosition = position++;
        col.dirty = 1;
      }
    });
    
    // Check for duplicate positions and fix them (excluding dynamic columns)
    const positions = new Set<number>();
    this.workingColumns.forEach(col => {
      // Skip dynamic columns
      if (this.isDynamicColumn(col)) {
        positions.add(col.colPosition!);
        return;
      }
      
      if (positions.has(col.colPosition!)) {
        // Duplicate found, reassign
        col.colPosition = position++;
        col.dirty = 1;
      } else {
        positions.add(col.colPosition!);
      }
    });
  }
  
  // Helper method to get display value for hidden checkbox
  isColumnVisible(column: TableColumns): boolean {
    return !column.hidden;
  }
  
  // Helper to check if there are any changes
  hasChanges(): boolean {
    return this.workingColumns.some(col => col.dirty === 1);
  }
  
  // Check if column is dynamic (has ~ separator) - should be read-only
  isDynamicColumn(column: TableColumns): boolean {
    return column.isDynamicColumn === true || column.key.includes('~');
  }
}