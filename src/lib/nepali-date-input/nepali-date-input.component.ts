// src/lib/components/nepali-date-input.component.ts
import { Component, Input, Output, EventEmitter, forwardRef, OnInit, HostListener, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { NepaliDateService } from '../Services/nepali-date.service';

interface NepaliCalendarDate {
  day: number;
  bsDate: string;
  adDate: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

@Component({
  selector: 'lib-nepali-date-input',
  templateUrl: './nepali-date-input.component.html',
  styleUrls: ['./nepali-date-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NepaliDateInputComponent),
      multi: true
    }
  ]
})
export class NepaliDateInputComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() id: string = '';
  @Input() placeholder: string = 'DD/MM/YYYY';
  @Input() inputClass: string = 'form-control';
  @Input() readonly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showCalendarIcon: boolean = true;
  @Input() format: string = 'DD/MM/YYYY'; // BS date format
  @Input() syncWithAD: string = ''; // ID of AD input to sync with
  @Input() minDate: string = ''; // Minimum selectable date in BS
  @Input() maxDate: string = ''; // Maximum selectable date in BS
  @Input() data: string = '';
  @Input() width: string = '300px !important';
  @Input() popupPosition: string = 'relative';
  @Input() calenderPopup: boolean = false;

  @Output() dateChange = new EventEmitter<{bs: string, ad: string}>();
  @Output() blur = new EventEmitter<any>();

  @ViewChild('calendarPopup') calendarPopupRef!: ElementRef;
  @ViewChild('calendarScrollAnchor') calendarScrollAnchorRef!: ElementRef;

  displayValue: string = '';
  showCalendar: boolean = false;
  
  // Calendar properties
  currentMonth: number = 0;
  currentYear: number = 2081;
  calendarDates: NepaliCalendarDate[] = [];
  selectedDate: string = '';

  // Nepali calendar data
  nepaliMonths: string[] = [];
  dayHeaders: string[] = [];
  availableYears: number[] = [];

  private onChange = (value: any) => {};
  private onTouched = () => {};
  private serviceReady = false;
  private initializationAttempts = 0;
  private maxInitializationAttempts = 100; // 10 seconds max wait

  constructor(
    private nepaliDateService: NepaliDateService,
    private elementRef: ElementRef
  ) {}

  async ngOnInit() {
    if (!this.id) {
      this.id = 'nepali-date-' + Math.random().toString(36).substr(2, 9);
    }
    
    await this.initializeService();
    await this.initializeCalendar();
    
    if (this.data) {
      this.writeValue(this.data);
    }
    
    await this.toggleCalendar();
    
    
    console.log('Component initialized with data:', this.data);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showCalendar = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      const newValue = changes['data'].currentValue;
      if (newValue && newValue !== this.displayValue) {
        this.writeValue(newValue);
        this.updateCalendarSelection();
      }
    }
  }

  private async initializeService() {
    try {
      // Wait for service to be ready with better error handling
      while (!this.nepaliDateService.isReady() && this.initializationAttempts < this.maxInitializationAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.initializationAttempts++;
      }
      
      if (this.nepaliDateService.isReady()) {
        this.serviceReady = true;
        console.log('Service is ready, loading calendar data...');
        
        // Load calendar data
        this.nepaliMonths = await this.nepaliDateService.getBSMonths(true);
        this.dayHeaders = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];
        this.generateAvailableYears();
        
        console.log('Calendar data loaded successfully');
      } else {
        console.error('Nepali date service failed to initialize after', this.initializationAttempts, 'attempts');
        // Set fallback data
        this.nepaliMonths = ['बैशाख', 'जेठ', 'अषाढ', 'श्रावण', 'भाद्र', 'आश्विन', 'कार्तिक', 'मङ्सिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'];
        this.dayHeaders = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];
        this.generateAvailableYears();
      }
    } catch (error) {
      console.error('Error initializing Nepali date service:', error);
      // Set fallback data even on error
      this.nepaliMonths = ['बैशाख', 'जेठ', 'अषाढ', 'श्रावण', 'भाद्र', 'आश्विन', 'कार्तिक', 'मङ्सिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'];
      this.dayHeaders = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];
      this.generateAvailableYears();
    }
  }

  private async initializeCalendar() {
    try {
      if (this.serviceReady) {
        const currentBSDate = await this.nepaliDateService.getCurrentBSDate();
        if (currentBSDate) {
          const dateParts = currentBSDate.split('/');
          if (dateParts.length === 3) {
            this.currentYear = parseInt(dateParts[2]);
            this.currentMonth = parseInt(dateParts[1]) - 1;
          }
        }
      } else {
        // Set default values if service is not ready
        this.currentYear = 2081;
        this.currentMonth = 4; // Shrawan (approximate current month)
      }
      
      await this.generateCalendarDates();
    } catch (error) {
      console.error('Error initializing calendar:', error);
      // Set default values on error
      this.currentYear = 2081;
      this.currentMonth = 4;
      await this.generateCalendarDates();
    }
  }

  private generateAvailableYears() {
    const currentYear = 2081; // Current approximate BS year
    this.availableYears = [];
    for (let year = currentYear - 20; year <= currentYear + 10; year++) {
      this.availableYears.push(year);
    }
  }

  async toggleCalendar(): Promise<void> {
    if (this.disabled) return;

    this.showCalendar = !this.showCalendar;

    if (this.showCalendar) {
      await this.generateCalendarDates();

      // Let Angular render the popup and anchor
      setTimeout(() => {
        this.calendarScrollAnchorRef?.nativeElement?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 0);
    }
  }

  onInputFocus() {
    // Optionally open calendar on focus
  }

  async onInputChange(event: any) {
    const value = event.target.value;
    this.displayValue = value;

    if (this.isValidBSDateFormat(value) && this.serviceReady) {
      try {
        const isValid = await this.nepaliDateService.validateNepaliDate(value, this.format);
        if (isValid) {
          const adDate = await this.nepaliDateService.toADDate(value, this.format);
          this.selectedDate = value;
          this.dateChange.emit({ bs: value, ad: adDate });

          // Sync with AD input if specified
          if (this.syncWithAD) {
            const adInput = document.getElementById(this.syncWithAD) as HTMLInputElement;
            if (adInput) {
              adInput.value = adDate;
              adInput.dispatchEvent(new Event('input', { bubbles: true }));
              adInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }

          // Update calendar to show selected date
          await this.updateCalendarSelection();
        }
      } catch (error) {
        console.warn('Invalid BS date:', value);
      }
    }

    this.onChange(value);
  }

  onInputBlur(event: any) {
    this.onTouched();
    this.blur.emit(event);
  }

  async previousMonth() {
    if (!this.canNavigatePrevious()) return;
    
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    await this.generateCalendarDates();
  }

  async nextMonth() {
    if (!this.canNavigateNext()) return;
    
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    await this.generateCalendarDates();
  }

  async onMonthChange() {
    await this.generateCalendarDates();
  }

  async onYearChange() {
    await this.generateCalendarDates();
  }

  async selectDate(date: NepaliCalendarDate) {
    if (this.disabled || !date.isCurrentMonth || date.isDisabled) return;

    this.selectedDate = date.bsDate;
    this.displayValue = date.bsDate;
    this.showCalendar = false;

    try {
      const adDate = await this.nepaliDateService.toADDate(date.bsDate, this.format);
      this.dateChange.emit({ bs: date.bsDate, ad: adDate });

      // Sync with AD input if specified
      if (this.syncWithAD) {
        const adInput = document.getElementById(this.syncWithAD) as HTMLInputElement;
        if (adInput) {
          adInput.value = adDate;
          adInput.dispatchEvent(new Event('input', { bubbles: true }));
          adInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    } catch (error) {
      console.error('Error converting BS to AD:', error);
    }

    this.onChange(this.displayValue);
  }

  async selectToday() {
    try {
      let todayBS: string;
      
      if (this.serviceReady) {
        todayBS = await this.nepaliDateService.getCurrentBSDate(this.format);
      } else {
        // Fallback: use approximate current BS date
        todayBS = '15/04/2081'; // Approximate fallback
      }
      
      if (todayBS) {
        this.displayValue = todayBS;
        this.selectedDate = todayBS;
        this.showCalendar = false;

        if (this.serviceReady) {
          const adDate = await this.nepaliDateService.toADDate(todayBS, this.format);
          this.dateChange.emit({ bs: todayBS, ad: adDate });
        } else {
          this.dateChange.emit({ bs: todayBS, ad: '' });
        }

        // Update calendar to current month
        const dateParts = todayBS.split('/');
        if (dateParts.length === 3) {
          this.currentYear = parseInt(dateParts[2]);
          this.currentMonth = parseInt(dateParts[1]) - 1;
        }

        this.onChange(this.displayValue);
      }
    } catch (error) {
      console.error('Error selecting today:', error);
    }
  }

  clearDate() {
    this.displayValue = '';
    this.selectedDate = '';
    this.showCalendar = false;
    this.dateChange.emit({ bs: '', ad: '' });
    this.onChange('');
  }

  private async generateCalendarDates() {
    this.calendarDates = [];
    
    try {
      // Get days in current month
      const daysInMonth = await this.getDaysInBSMonth(this.currentYear, this.currentMonth + 1);
      
      // Get first day of month (0 = Sunday, 1 = Monday, etc.)
      const firstDayOfWeek = await this.getFirstDayOfBSMonth(this.currentYear, this.currentMonth + 1);
      
      // Add empty cells for days before month starts
      if (firstDayOfWeek > 0) {
        const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
        const prevYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
        const prevMonthDays = await this.getDaysInBSMonth(prevYear, prevMonth + 1);
        
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
          const day = prevMonthDays - i;
          const bsDate = `${day.toString().padStart(2, '0')}/${(prevMonth + 1).toString().padStart(2, '0')}/${prevYear}`;
          
          this.calendarDates.push({
            day: day,
            bsDate: bsDate,
            adDate: '',
            isCurrentMonth: false,
            isToday: false,
            isSelected: false,
            isDisabled: true
          });
        }
      }

      // Add days of current month
      let todayBS = '';
      try {
        if (this.serviceReady) {
          todayBS = await this.nepaliDateService.getCurrentBSDate(this.format);
        }
      } catch (error) {
        console.warn('Could not get current BS date:', error);
      }
      
      for (let day = 1; day <= daysInMonth; day++) {
        const bsDate = `${day.toString().padStart(2, '0')}/${(this.currentMonth + 1).toString().padStart(2, '0')}/${this.currentYear}`;
        
        this.calendarDates.push({
          day: day,
          bsDate: bsDate,
          adDate: '',
          isCurrentMonth: true,
          isToday: bsDate === todayBS,
          isSelected: bsDate === this.selectedDate,
          isDisabled: this.isDateDisabled(bsDate)
        });
      }

      // Fill remaining cells with next month's days
      const remainingCells = 42 - this.calendarDates.length; // 6 rows × 7 days
      if (remainingCells > 0) {
        const nextMonth = this.currentMonth === 11 ? 0 : this.currentMonth + 1;
        const nextYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
        
        for (let day = 1; day <= remainingCells; day++) {
          const bsDate = `${day.toString().padStart(2, '0')}/${(nextMonth + 1).toString().padStart(2, '0')}/${nextYear}`;
          
          this.calendarDates.push({
            day: day,
            bsDate: bsDate,
            adDate: '',
            isCurrentMonth: false,
            isToday: false,
            isSelected: false,
            isDisabled: true
          });
        }
      }
    } catch (error) {
      console.error('Error generating calendar dates:', error);
    }
  }

  private async getDaysInBSMonth(year: number, month: number): Promise<number> {
    try {
      // Use NepaliFunctions directly if available
      if (window.NepaliFunctions && this.serviceReady) {
        return window.NepaliFunctions.BS.GetDaysInMonth(year, month);
      }
    } catch (error) {
      console.warn('Error getting days in BS month:', error);
    }
    
    // Fallback: approximate days in Nepali months
    const approximateDays = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
    return approximateDays[month - 1] || 30;
  }

  private async getFirstDayOfBSMonth(year: number, month: number): Promise<number> {
    try {
      if (this.serviceReady) {
        // Get first day of BS month and convert to AD to find day of week
        const firstBSDate = `01/${month.toString().padStart(2, '0')}/${year}`;
        const firstADDate = await this.nepaliDateService.toADDate(firstBSDate, 'DD/MM/YYYY');
        const adDateObj = new Date(firstADDate);
        return adDateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
      }
    } catch (error) {
      console.warn('Error getting first day of BS month:', error);
    }
    
    // Fallback to random day (better than always Sunday)
    return Math.floor(Math.random() * 7);
  }

  private isDateDisabled(bsDate: string): boolean {
    if (!this.minDate && !this.maxDate) return false;
    
    try {
      if (this.minDate && this.compareBSDates(bsDate, this.minDate) < 0) {
        return true;
      }
      
      if (this.maxDate && this.compareBSDates(bsDate, this.maxDate) > 0) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  private compareBSDates(date1: string, date2: string): number {
    const parseDate = (dateStr: string) => {
      const parts = dateStr.split('/');
      return {
        year: parseInt(parts[2]),
        month: parseInt(parts[1]),
        day: parseInt(parts[0])
      };
    };
    
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    
    if (d1.year !== d2.year) return d1.year - d2.year;
    if (d1.month !== d2.month) return d1.month - d2.month;
    return d1.day - d2.day;
  }

  public canNavigatePrevious(): boolean {
    if (this.currentYear <= 1970) return false;
    return true;
  }

  public canNavigateNext(): boolean {
    if (this.currentYear >= 2099) return false;
    return true;
  }

  public isValidBSDateFormat(value: string): boolean {
    if (!value) return false;
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Update the writeValue method to handle the data input properly
  writeValue(value: any): void {
    // Handle both direct value and data input
    const dateValue = value || this.data || '';
    
    this.displayValue = dateValue;
    this.selectedDate = dateValue;
    
    if (dateValue && this.isValidBSDateFormat(dateValue)) {
      // Update calendar to show the correct month/year for the selected date
      this.updateCalendarToDate(dateValue);
      this.updateCalendarSelection();
    }
  }

  // Add method to update calendar to show specific date
  private async updateCalendarToDate(bsDate: string): Promise<void> {
    if (!bsDate || !this.isValidBSDateFormat(bsDate)) return;
    
    try {
      const dateParts = bsDate.split('/');
      if (dateParts.length === 3) {
        const newYear = parseInt(dateParts[2]);
        const newMonth = parseInt(dateParts[1]) - 1; // Convert to 0-based index
        
        // Only update if different from current
        if (newYear !== this.currentYear || newMonth !== this.currentMonth) {
          this.currentYear = newYear;
          this.currentMonth = newMonth;
          await this.generateCalendarDates();
        }
      }
    } catch (error) {
      console.error('Error updating calendar to date:', error);
    }
  }

  public async updateCalendarSelection(): Promise<void> {
    if (!this.calendarDates.length) {
      await this.generateCalendarDates();
    }
    
    this.calendarDates.forEach(date => {
      date.isSelected = date.bsDate === this.selectedDate;
    });
  }
}