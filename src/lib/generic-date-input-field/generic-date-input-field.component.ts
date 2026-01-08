import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef } from '@angular/core';
import moment from 'moment';
import { NepaliDateService } from '../Services/nepali-date.service';

interface BSCalendarDate {
  day: number;
  bsDate: string;
  adDate: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

@Component({
  selector: 'lib-generic-date-input-field',
  templateUrl: './generic-date-input-field.component.html',
  styleUrls: ['./generic-date-input-field.component.css']
})
export class GenericDateInputFieldComponent implements OnInit {
  @Input() field: any;
  @Output() dateChange = new EventEmitter<any>();

  showPopup = false;
  customRangeSelected = false;
  showBS: boolean = false;
  showHover = false;

  // AD Date properties
  selectedDate: string = '';
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth();
  selectedDay: number = new Date().getDate();
  
  // Range AD Date properties
  startYear: number = new Date().getFullYear();
  startMonth: number = new Date().getMonth();
  startDay: number = new Date().getDate();
  endYear: number = new Date().getFullYear();
  endMonth: number = new Date().getMonth();
  endDay: number = new Date().getDate();

  // BS Date properties
  selectedBSYear: number = 2081;
  selectedBSMonth: number = 4;
  selectedBSDay: number = 15;
  bsCalendarDates: BSCalendarDate[] = [];
  
  // Range BS Date properties
  startBSYear: number = 2081;
  startBSMonth: number = 4;
  startBSDay: number = 15;
  endBSYear: number = 2081;
  endBSMonth: number = 4;
  endBSDay: number = 15;
  startBSCalendarDates: BSCalendarDate[] = [];
  endBSCalendarDates: BSCalendarDate[] = [];

  // Calendar display arrays
  years: number[] = [];
  bsYears: number[] = [];
  months = [
    { value: 0, label: 'Jan' },
    { value: 1, label: 'Feb' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Apr' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'Aug' },
    { value: 8, label: 'Sep' },
    { value: 9, label: 'Oct' },
    { value: 10, label: 'Nov' },
    { value: 11, label: 'Dec' }
  ];
  bsMonths: string[] = [];

  rangeOptions: any[] = [];

  // Date objects to maintain sync between AD and BS
  dateObject = {
    selectedAD: '',
    selectedBS: '',
    startAD: '',
    startBS: '',
    endAD: '',
    endBS: ''
  };
  
  private serviceReady = false;
  private initializationAttempts = 0;
  private maxInitializationAttempts = 100;

  constructor(
    public nepaliDateService: NepaliDateService,
    private elementRef: ElementRef
  ) {
    this.rangeOptions = [
      { label: 'Today', getDates: this.getTodayRange.bind(this), display: '' },
      { label: 'Last 7 Days', getDates: this.getLast7Days.bind(this), display: '' },
      { label: 'This Month', getDates: this.getThisMonth.bind(this), display: '' },
      { label: 'Last Month', getDates: this.getLastMonth.bind(this), display: '' },
      { label: 'This Fiscal Year', getDates: async () => await this.getThisFiscalYear(), display: '' },
      { label: 'Last Fiscal Year', getDates: async () => await this.getLastFiscalYear(), display: '' },
      { label: 'Custom Range', getDates: () => null, display: '' }
    ];
    this.initializeYears();
  }

  initializeYears() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 50; year <= currentYear + 10; year++) {
      this.years.push(year);
    }
    
    for (let year = 2030; year <= 2140; year++) {
      this.bsYears.push(year);
    }
  }

  async ngOnInit() {
    let fieldValues: string[] = [];

    if (this.field.fieldValue) {
      if (Array.isArray(this.field.fieldValue)) {
        fieldValues = this.field.fieldValue;
      } else if (typeof this.field.fieldValue === 'string') {
        fieldValues = this.field.fieldValue
          .split(',')
          .map(v => v.trim())
          .filter(v => v);
      }
    }

    console.log('Initializing GenericDateInputFieldComponent with field:', this.field, 'fieldValues:', fieldValues);

    await this.initializeService();
    await this.initializeDisplayDates();

    if (fieldValues.length) {
      if (this.field?.controlType === 'asOnDate' && fieldValues.length >= 1) {
        this.selectedDate = fieldValues[0];
        await this.setInitialADDate(this.selectedDate);
      } else if (this.field?.controlType === 'daterange' && fieldValues.length === 2) {
        await this.setInitialADRange(fieldValues[0], fieldValues[1]);
      }
    } else {
      await this.setCurrentDate();
    }

    console.log('this.dateObject gets here', this.dateObject);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showPopup) return;
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showPopup = false;
    }
  }

  private async initializeService() {
    try {
      while (!this.nepaliDateService.isReady() && this.initializationAttempts < this.maxInitializationAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.initializationAttempts++;
      }
      
      if (this.nepaliDateService.isReady()) {
        this.serviceReady = true;
        this.bsMonths = await this.nepaliDateService.getBSMonths(true);
      } else {
        console.error('Nepali date service failed to initialize after', this.initializationAttempts, 'attempts');
        this.bsMonths = ['बैशाख', 'जेठ', 'अषाढ', 'श्रावण', 'भाद्र', 'आश्विन', 'कार्तिक', 'मङ्सिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'];
      }
    } catch (error) {
      console.error('Error initializing Nepali date service:', error);
      this.bsMonths = ['बैशाख', 'जेठ', 'अषाढ', 'श्रावण', 'भाद्र', 'आश्विन', 'कार्तिक', 'मङ्सिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'];
    }
  }

  private async setCurrentDate() {
    const today = new Date();
    const adDate = today.toISOString().split('T')[0];
    
    if (this.field?.controlType === 'asOnDate') {
      await this.setInitialADDate(adDate);
    } else if (this.field?.controlType === 'daterange') {
      await this.setInitialADRange(adDate, adDate);
    }
  }

  private async setInitialADDate(adDate: string) {
    try {
      // FIX: Use moment to parse and handle date correctly
      const dateObj = moment(adDate, 'YYYY-MM-DD').toDate();
      this.selectedYear = dateObj.getFullYear();
      this.selectedMonth = dateObj.getMonth();
      this.selectedDay = dateObj.getDate();
      this.dateObject.selectedAD = adDate;
      
      if (this.nepaliDateService.isReady()) {
        const bsDate = await this.nepaliDateService.toBSDate(adDate, 'DD/MM/YYYY');
        this.dateObject.selectedBS = bsDate;
        const [day, month, year] = bsDate.split('/').map(Number);
        this.selectedBSYear = year;
        this.selectedBSMonth = month - 1;
        this.selectedBSDay = day;
        await this.generateBSCalendarDates();
      }
    } catch (error) {
      console.error('Error setting initial AD date:', error);
    }
  }

  private async setInitialADRange(startAD: string, endAD: string) {
    try {
      const startDateObj = moment(startAD, 'YYYY-MM-DD').toDate();
      this.startYear = startDateObj.getFullYear();
      this.startMonth = startDateObj.getMonth();
      this.startDay = startDateObj.getDate();
      this.dateObject.startAD = startAD;

      const endDateObj = moment(endAD, 'YYYY-MM-DD').toDate();
      this.endYear = endDateObj.getFullYear();
      this.endMonth = endDateObj.getMonth();
      this.endDay = endDateObj.getDate();
      this.dateObject.endAD = endAD;

      if (this.nepaliDateService.isReady()) {
        const startBS = await this.nepaliDateService.toBSDate(startAD, 'DD/MM/YYYY');
        const endBS = await this.nepaliDateService.toBSDate(endAD, 'DD/MM/YYYY');
        
        this.dateObject.startBS = startBS;
        this.dateObject.endBS = endBS;
        
        const [startDay, startMonth, startYear] = startBS.split('/').map(Number);
        this.startBSYear = startYear;
        this.startBSMonth = startMonth - 1;
        this.startBSDay = startDay;

        const [endDay, endMonth, endYear] = endBS.split('/').map(Number);
        this.endBSYear = endYear;
        this.endBSMonth = endMonth - 1;
        this.endBSDay = endDay;

        await this.generateRangeBSCalendarDates();
      }
    } catch (error) {
      console.error('Error setting initial AD range:', error);
    }
  }

  openPopup(event: MouseEvent) {
    event.stopPropagation();
    this.showPopup = true;
    this.customRangeSelected = false;
    this.showHover = false;
  }

  cancel() {
    this.showPopup = false;
    this.customRangeSelected = false;
  }

  cancelRange() {
    this.customRangeSelected = false;
  }

  getDisplayDate(): string {
    if (this.field?.controlType === 'asOnDate') {
      return this.showBS ? this.dateObject.selectedBS || 'DD/MM/YYYY' 
                         : this.dateObject.selectedAD ? moment(this.dateObject.selectedAD).format('MM-DD-YYYY') : 'MM-DD-YYYY';
    } else if (this.field?.controlType === 'daterange') {
      const startDisplay = this.showBS ? this.dateObject.startBS : (this.dateObject.startAD ? moment(this.dateObject.startAD).format('MM-DD-YYYY') : '');
      const endDisplay = this.showBS ? this.dateObject.endBS : (this.dateObject.endAD ? moment(this.dateObject.endAD).format('MM-DD-YYYY') : '');
      return startDisplay && endDisplay ? `${startDisplay} | ${endDisplay}` : 'MM-DD-YYYY';
    }
    return 'MM-DD-YYYY';
  }
  
  getSelectedDisplayDateHover(): string {
    if (this.field?.controlType === 'asOnDate') {
      return this.showBS ? this.dateObject.selectedAD || '' 
                         : this.dateObject.selectedBS ? this.dateObject.selectedBS : '';
    } else if (this.field?.controlType === 'daterange') {
      const startDisplay = this.showBS ? this.dateObject.startAD : (this.dateObject.startBS ? this.dateObject.startBS : '');
      const endDisplay = this.showBS ? this.dateObject.endAD : (this.dateObject.endBS ? this.dateObject.endBS : '');
      return startDisplay && endDisplay ? `${startDisplay} | ${endDisplay}` : '';
    }
    return '';
  }

  getSelectedDisplayDate(): string {
    if (this.showBS) {
      return this.dateObject.selectedBS || 'Select Date';
    } else {
      return this.dateObject.selectedAD ? moment(this.dateObject.selectedAD).format('MM-DD-YYYY') : 'Select Date';
    }
  }

  getSelectedStartDate(): string {
    if (this.showBS) {
      return this.dateObject.startBS || 'Select Date';
    } else {
      return this.dateObject.startAD ? moment(this.dateObject.startAD).format('MM-DD-YYYY') : 'Select Date';
    }
  }

  getSelectedEndDate(): string {
    if (this.showBS) {
      return this.dateObject.endBS || 'Select Date';
    } else {
      return this.dateObject.endAD ? moment(this.dateObject.endAD).format('MM-DD-YYYY') : 'Select Date';
    }
  }

  // AD Calendar Navigation
  navigateMonth(direction: 'prev' | 'next') {
    if (direction === 'prev') {
      if (this.selectedMonth === 0) {
        this.selectedMonth = 11;
        this.selectedYear--;
      } else {
        this.selectedMonth--;
      }
    } else {
      if (this.selectedMonth === 11) {
        this.selectedMonth = 0;
        this.selectedYear++;
      } else {
        this.selectedMonth++;
      }
    }
  }

  navigateStartMonth(direction: 'prev' | 'next') {
    if (direction === 'prev') {
      if (this.startMonth === 0) {
        this.startMonth = 11;
        this.startYear--;
      } else {
        this.startMonth--;
      }
    } else {
      if (this.startMonth === 11) {
        this.startMonth = 0;
        this.startYear++;
      } else {
        this.startMonth++;
      }
    }
  }

  navigateEndMonth(direction: 'prev' | 'next') {
    if (direction === 'prev') {
      if (this.endMonth === 0) {
        this.endMonth = 11;
        this.endYear--;
      } else {
        this.endMonth--;
      }
    } else {
      if (this.endMonth === 11) {
        this.endMonth = 0;
        this.endYear++;
      } else {
        this.endMonth++;
      }
    }
  }

  // BS Calendar Navigation
  navigateBSMonth(direction: 'prev' | 'next') {
    if (direction === 'prev') {
      if (this.selectedBSMonth === 0) {
        this.selectedBSMonth = 11;
        this.selectedBSYear--;
      } else {
        this.selectedBSMonth--;
      }
    } else {
      if (this.selectedBSMonth === 11) {
        this.selectedBSMonth = 0;
        this.selectedBSYear++;
      } else {
        this.selectedBSMonth++;
      }
    }
    this.generateBSCalendarDates();
  }

  navigateStartBSMonth(direction: 'prev' | 'next') {
    if (direction === 'prev') {
      if (this.startBSMonth === 0) {
        this.startBSMonth = 11;
        this.startBSYear--;
      } else {
        this.startBSMonth--;
      }
    } else {
      if (this.startBSMonth === 11) {
        this.startBSMonth = 0;
        this.startBSYear++;
      } else {
        this.startBSMonth++;
      }
    }
    this.generateStartBSCalendarDates();
  }

  navigateEndBSMonth(direction: 'prev' | 'next') {
    if (direction === 'prev') {
      if (this.endBSMonth === 0) {
        this.endBSMonth = 11;
        this.endBSYear--;
      } else {
        this.endBSMonth--;
      }
    } else {
      if (this.endBSMonth === 11) {
        this.endBSMonth = 0;
        this.endBSYear++;
      } else {
        this.endBSMonth++;
      }
    }
    this.generateEndBSCalendarDates();
  }

  // Date Selection Methods
  selectDay(day: number) {
    this.selectedDay = day;
    this.updateADDate();
  }

  selectStartDay(day: number) {
    this.startDay = day;
    this.updateStartADDate();
  }

  selectEndDay(day: number) {
    this.endDay = day;
    this.updateEndADDate();
  }

  selectBSDate(date: BSCalendarDate) {
    if (!date.isCurrentMonth || date.isDisabled) return;
    
    this.selectedBSDay = date.day;
    this.updateBSDate();
    this.generateBSCalendarDates();
  }

  selectStartBSDate(date: BSCalendarDate) {
    if (!date.isCurrentMonth || date.isDisabled) return;
    
    this.startBSDay = date.day;
    this.updateStartBSDate();
    this.generateStartBSCalendarDates();
  }

  selectEndBSDate(date: BSCalendarDate) {
    if (!date.isCurrentMonth || date.isDisabled) return;
    
    this.endBSDay = date.day;
    this.updateEndBSDate();
    this.generateEndBSCalendarDates();
  }

  // Update methods to sync AD and BS dates
  private async updateADDate() {
    try {
      // FIX: Use moment to create date in local timezone to avoid off-by-one issues
      const adDate = moment({ year: this.selectedYear, month: this.selectedMonth, day: this.selectedDay }).format('YYYY-MM-DD');
      this.dateObject.selectedAD = adDate;
      
      if (this.nepaliDateService.isReady()) {
        this.dateObject.selectedBS = await this.nepaliDateService.toBSDate(this.dateObject.selectedAD, 'DD/MM/YYYY');
        const [day, month, year] = this.dateObject.selectedBS.split('/').map(Number);
        this.selectedBSYear = year;
        this.selectedBSMonth = month - 1;
        this.selectedBSDay = day;
      }
    } catch (error) {
      console.error('Error updating AD date:', error);
    }
  }

  private async updateStartADDate() {
    try {
      const adDate = moment({ year: this.startYear, month: this.startMonth, day: this.startDay }).format('YYYY-MM-DD');
      this.dateObject.startAD = adDate;

      if (this.nepaliDateService.isReady()) {
        this.dateObject.startBS = await this.nepaliDateService.toBSDate(this.dateObject.startAD, 'DD/MM/YYYY');
        const [day, month, year] = this.dateObject.startBS.split('/').map(Number);
        this.startBSYear = year;
        this.startBSMonth = month - 1;
        this.startBSDay = day;
      }
    } catch (error) {
      console.error('Error updating start AD date:', error);
    }
  }

  private async updateEndADDate() {
    try {
      const adDate = moment({ year: this.endYear, month: this.endMonth, day: this.endDay }).format('YYYY-MM-DD');
      this.dateObject.endAD = adDate;
      
      if (this.nepaliDateService.isReady()) {
        this.dateObject.endBS = await this.nepaliDateService.toBSDate(this.dateObject.endAD, 'DD/MM/YYYY');
        const [day, month, year] = this.dateObject.endBS.split('/').map(Number);
        this.endBSYear = year;
        this.endBSMonth = month - 1;
        this.endBSDay = day;
      }
    } catch (error) {
      console.error('Error updating end AD date:', error);
    }
  }

  private async updateBSDate() {
    try {
      const bsDate = `${this.selectedBSDay.toString().padStart(2, '0')}/${(this.selectedBSMonth + 1).toString().padStart(2, '0')}/${this.selectedBSYear}`;
      this.dateObject.selectedBS = bsDate;
      
      if (this.nepaliDateService.isReady()) {
        const adDateStr = await this.nepaliDateService.toADDate(bsDate, 'DD/MM/YYYY');
        this.dateObject.selectedAD = adDateStr;
        const adDate = moment(adDateStr, 'YYYY-MM-DD').toDate();
        this.selectedYear = adDate.getFullYear();
        this.selectedMonth = adDate.getMonth();
        this.selectedDay = adDate.getDate();
      }
    } catch (error) {
      console.error('Error updating BS date:', error);
    }
  }

  private async updateStartBSDate() {
    try {
      const bsDate = `${this.startBSDay.toString().padStart(2, '0')}/${(this.startBSMonth + 1).toString().padStart(2, '0')}/${this.startBSYear}`;
      this.dateObject.startBS = bsDate;
      
      if (this.nepaliDateService.isReady()) {
        const adDateStr = await this.nepaliDateService.toADDate(bsDate, 'DD/MM/YYYY');
        this.dateObject.startAD = adDateStr;
        const adDate = moment(adDateStr, 'YYYY-MM-DD').toDate();
        this.startYear = adDate.getFullYear();
        this.startMonth = adDate.getMonth();
        this.startDay = adDate.getDate();
      }
    } catch (error) {
      console.error('Error updating start BS date:', error);
    }
  }

  private async updateEndBSDate() {
    try {
      const bsDate = `${this.endBSDay.toString().padStart(2, '0')}/${(this.endBSMonth + 1).toString().padStart(2, '0')}/${this.endBSYear}`;
      this.dateObject.endBS = bsDate;
      
      if (this.nepaliDateService.isReady()) {
        const adDateStr = await this.nepaliDateService.toADDate(bsDate, 'DD/MM/YYYY');
        this.dateObject.endAD = adDateStr;
        const adDate = moment(adDateStr, 'YYYY-MM-DD').toDate();
        this.endYear = adDate.getFullYear();
        this.endMonth = adDate.getMonth();
        this.endDay = adDate.getDate();
      }
    } catch (error) {
      console.error('Error updating end BS date:', error);
    }
  }

  // BS Calendar Generation Methods
  private async generateBSCalendarDates() {
    if (!this.nepaliDateService.isReady()) return;
    
    this.bsCalendarDates = [];
    try {
      const daysInMonth = await this.getBSDaysInMonth(this.selectedBSYear, this.selectedBSMonth + 1);
      const firstDayOfWeek = await this.getBSFirstDayOfWeek(this.selectedBSYear, this.selectedBSMonth + 1);
      
      // Add previous month days
      if (firstDayOfWeek > 0) {
        const prevMonth = this.selectedBSMonth === 0 ? 11 : this.selectedBSMonth - 1;
        const prevYear = this.selectedBSMonth === 0 ? this.selectedBSYear - 1 : this.selectedBSYear;
        const prevMonthDays = await this.getBSDaysInMonth(prevYear, prevMonth + 1);
        
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
          const day = prevMonthDays - i;
          this.bsCalendarDates.push({
            day: day,
            bsDate: `${day.toString().padStart(2, '0')}/${(prevMonth + 1).toString().padStart(2, '0')}/${prevYear}`,
            adDate: '',
            isCurrentMonth: false,
            isToday: false,
            isSelected: false,
            isDisabled: true
          });
        }
      }
      
      // Add current month days
      const todayBS = await this.nepaliDateService.getCurrentBSDate('DD/MM/YYYY');
      for (let day = 1; day <= daysInMonth; day++) {
        const bsDate = `${day.toString().padStart(2, '0')}/${(this.selectedBSMonth + 1).toString().padStart(2, '0')}/${this.selectedBSYear}`;
        this.bsCalendarDates.push({
          day: day,
          bsDate: bsDate,
          adDate: '',
          isCurrentMonth: true,
          isToday: bsDate === todayBS,
          isSelected: day === this.selectedBSDay,
          isDisabled: false
        });
      }
      
      // Fill remaining cells
      const remainingCells = 42 - this.bsCalendarDates.length;
      if (remainingCells > 0) {
        const nextMonth = this.selectedBSMonth === 11 ? 0 : this.selectedBSMonth + 1;
        const nextYear = this.selectedBSMonth === 11 ? this.selectedBSYear + 1 : this.selectedBSYear;
        
        for (let day = 1; day <= remainingCells; day++) {
          this.bsCalendarDates.push({
            day: day,
            bsDate: `${day.toString().padStart(2, '0')}/${(nextMonth + 1).toString().padStart(2, '0')}/${nextYear}`,
            adDate: '',
            isCurrentMonth: false,
            isToday: false,
            isSelected: false,
            isDisabled: true
          });
        }
      }
    } catch (error) {
      console.error('Error generating BS calendar dates:', error);
    }
  }

  private async generateStartBSCalendarDates() {
    if (!this.nepaliDateService.isReady()) return;
    
    this.startBSCalendarDates = [];
    try {
      const daysInMonth = await this.getBSDaysInMonth(this.startBSYear, this.startBSMonth + 1);
      const firstDayOfWeek = await this.getBSFirstDayOfWeek(this.startBSYear, this.startBSMonth + 1);
      
      if (firstDayOfWeek > 0) {
        const prevMonth = this.startBSMonth === 0 ? 11 : this.startBSMonth - 1;
        const prevYear = this.startBSMonth === 0 ? this.startBSYear - 1 : this.startBSYear;
        const prevMonthDays = await this.getBSDaysInMonth(prevYear, prevMonth + 1);
        
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
          const day = prevMonthDays - i;
          this.startBSCalendarDates.push({
            day: day,
            bsDate: `${day.toString().padStart(2, '0')}/${(prevMonth + 1).toString().padStart(2, '0')}/${prevYear}`,
            adDate: '',
            isCurrentMonth: false,
            isToday: false,
            isSelected: false,
            isDisabled: true
          });
        }
      }
      
      const todayBS = await this.nepaliDateService.getCurrentBSDate('DD/MM/YYYY');
      for (let day = 1; day <= daysInMonth; day++) {
        const bsDate = `${day.toString().padStart(2, '0')}/${(this.startBSMonth + 1).toString().padStart(2, '0')}/${this.startBSYear}`;
        this.startBSCalendarDates.push({
          day: day,
          bsDate: bsDate,
          adDate: '',
          isCurrentMonth: true,
          isToday: bsDate === todayBS,
          isSelected: day === this.startBSDay,
          isDisabled: false
        });
      }
      
      const remainingCells = 42 - this.startBSCalendarDates.length;
      if (remainingCells > 0) {
        const nextMonth = this.startBSMonth === 11 ? 0 : this.startBSMonth + 1;
        const nextYear = this.startBSMonth === 11 ? this.startBSYear + 1 : this.startBSYear;
        
        for (let day = 1; day <= remainingCells; day++) {
          this.startBSCalendarDates.push({
            day: day,
            bsDate: `${day.toString().padStart(2, '0')}/${(nextMonth + 1).toString().padStart(2, '0')}/${nextYear}`,
            adDate: '',
            isCurrentMonth: false,
            isToday: false,
            isSelected: false,
            isDisabled: true
          });
        }
      }
    } catch (error) {
      console.error('Error generating start BS calendar dates:', error);
    }
  }

  private async generateEndBSCalendarDates() {
    if (!this.nepaliDateService.isReady()) return;
    
    this.endBSCalendarDates = [];
    try {
      const daysInMonth = await this.getBSDaysInMonth(this.endBSYear, this.endBSMonth + 1);
      const firstDayOfWeek = await this.getBSFirstDayOfWeek(this.endBSYear, this.endBSMonth + 1);
      
      // Similar logic as generateBSCalendarDates but for end date
      // Add previous month days
      if (firstDayOfWeek > 0) {
        const prevMonth = this.endBSMonth === 0 ? 11 : this.endBSMonth - 1;
        const prevYear = this.endBSMonth === 0 ? this.endBSYear - 1 : this.endBSYear;
        const prevMonthDays = await this.getBSDaysInMonth(prevYear, prevMonth + 1);
        
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
          const day = prevMonthDays - i;
          this.endBSCalendarDates.push({
            day: day,
            bsDate: `${day.toString().padStart(2, '0')}/${(prevMonth + 1).toString().padStart(2, '0')}/${prevYear}`,
            adDate: '',
            isCurrentMonth: false,
            isToday: false,
            isSelected: false,
            isDisabled: true
          });
        }
      }
      
      // Add current month days
      const todayBS = await this.nepaliDateService.getCurrentBSDate('DD/MM/YYYY');
      for (let day = 1; day <= daysInMonth; day++) {
        const bsDate = `${day.toString().padStart(2, '0')}/${(this.endBSMonth + 1).toString().padStart(2, '0')}/${this.endBSYear}`;
        this.endBSCalendarDates.push({
          day: day,
          bsDate: bsDate,
          adDate: '',
          isCurrentMonth: true,
          isToday: bsDate === todayBS,
          isSelected: day === this.endBSDay,
          isDisabled: false
        });
      }
      
      // Fill remaining cells
      const remainingCells = 42 - this.endBSCalendarDates.length;
      if (remainingCells > 0) {
        const nextMonth = this.endBSMonth === 11 ? 0 : this.endBSMonth + 1;
        const nextYear = this.endBSMonth === 11 ? this.endBSYear + 1 : this.endBSYear;
        
        for (let day = 1; day <= remainingCells; day++) {
          this.endBSCalendarDates.push({
            day: day,
            bsDate: `${day.toString().padStart(2, '0')}/${(nextMonth + 1).toString().padStart(2, '0')}/${nextYear}`,
            adDate: '',
            isCurrentMonth: false,
            isToday: false,
            isSelected: false,
            isDisabled: true
          });
        }
      }
    } catch (error) {
      console.error('Error generating end BS calendar dates:', error);
    }
  }

  private async generateRangeBSCalendarDates() {
    await this.generateStartBSCalendarDates();
    await this.generateEndBSCalendarDates();
  }

  // Helper methods
  private async getBSDaysInMonth(year: number, month: number): Promise<number> {
    try {
      if (window.NepaliFunctions && this.nepaliDateService.isReady()) {
        return window.NepaliFunctions.BS.GetDaysInMonth(year, month);
      }
    } catch (error) {
      console.warn('Error getting BS days in month:', error);
    }
    
    // Fallback
    const approximateDays = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
    return approximateDays[month - 1] || 30;
  }

  private async getBSFirstDayOfWeek(year: number, month: number): Promise<number> {
    try {
      if (this.nepaliDateService.isReady()) {
        const firstBSDate = `01/${month.toString().padStart(2, '0')}/${year}`;
        const firstADDate = await this.nepaliDateService.toADDate(firstBSDate, 'DD/MM/YYYY');
        const adDateObj = new Date(firstADDate);
        return adDateObj.getDay();
      }
    } catch (error) {
      console.warn('Error getting BS first day of week:', error);
    }
    
    return Math.floor(Math.random() * 7);
  }

  getDaysInMonth(year: number, month: number): number[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  getCalendarGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (number | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    grid.push(null);
  }
  
  // Add the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    grid.push(day);
  }
  
  // Fill remaining cells to complete the grid (42 cells = 6 rows * 7 days)
  while (grid.length < 42) {
    grid.push(null);
  }
  
  return grid;
}

  isToday(year: number, month: number, day: number): boolean {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  }

  // Event handlers for date changes
  onDateChange() {
    this.updateADDate();
  }

  onStartDateChange() {
    this.updateStartADDate();
  }

  onEndDateChange() {
    this.updateEndADDate();
  }

  onBSDateChange() {
    this.generateBSCalendarDates();
  }

  onStartBSDateChange() {
    this.generateStartBSCalendarDates();
  }

  onEndBSDateChange() {
    this.generateEndBSCalendarDates();
  }

  async changeFormat() {
  this.showBS = !this.showBS;
  
  if (this.showBS) {
    // FIXED: Generate BS calendar for both control types
    if (this.field?.controlType === 'asOnDate') {
      await this.generateBSCalendarDates();
    } else if (this.field?.controlType === 'daterange') {
      await this.generateRangeBSCalendarDates();
    }
  }
}

async selectRange(option: any) {
  if (option.label === 'Custom Range') {
    this.customRangeSelected = true;
  } else {
    const dates = await option.getDates(); // ADD await here
    if (dates) {
      const { start, end } = dates;
      this.field.fieldValue = [start, end];
      const combined = `${dates?.start || ''},${dates?.end || ''}`;
      this.dateObject.startAD = start;
      this.dateObject.endAD = end;
      this.dateObject.startBS = this.nepaliDateService.isReady() ? await this.nepaliDateService.toBSDate(start, 'DD/MM/YYYY') : '';
      this.dateObject.endBS = this.nepaliDateService.isReady() ? await this.nepaliDateService.toBSDate(end, 'DD/MM/YYYY') : '';
      this.dateChange.emit(combined);
      this.showPopup = false;
      this.customRangeSelected = false;
    }
  }
}

  applySingleDate() {
    // if (this.dateObject.selectedAD) {
    //   this.field.fieldValue = [this.dateObject.selectedAD];
    //   this.dateChange.emit(this.field.fieldValue);
    //   this.showPopup = false;
    // }
      if (this.dateObject.selectedAD) {
    // Changed from array to string
    this.field.fieldValue = this.dateObject.selectedAD; // was: [this.dateObject.selectedAD]
    this.dateChange.emit(this.dateObject.selectedAD);   // was: emit(this.field.fieldValue)
    this.showPopup = false;
  }
  }

  applyCustomRange() {
    if (this.dateObject.startAD && this.dateObject.endAD) {
      const startDate = new Date(this.dateObject.startAD);
      const endDate = new Date(this.dateObject.endAD);
      
      if (startDate > endDate) {
        alert('Start date cannot be after end date');
        return;
      }
      
      this.field.fieldValue = [this.dateObject.startAD, this.dateObject.endAD];
      const selected = `${this.dateObject.startAD},${this.dateObject.endAD}`;
      this.dateChange.emit(selected);
      this.showPopup = false;
      this.customRangeSelected = false;
    }
  }

  // Range helper methods (keeping existing logic)
  getTodayRange() {
    const today = moment().format('YYYY-MM-DD');
    return { start: today, end: today };
  }

  getLast7Days() {
    const end = moment().format('YYYY-MM-DD');
    const start = moment().subtract(6, 'days').format('YYYY-MM-DD');
    return { start, end };
  }

  getThisMonth() {
    const start = moment().startOf('month').format('YYYY-MM-DD');
    const end = moment().endOf('month').format('YYYY-MM-DD');
    return { start, end };
  }

  getLastMonth() {
    const start = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
    const end = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
    return { start, end };
  }

async getThisFiscalYear() {
  try {
    // Get current date in both AD and BS
    const todayAD = moment().format('YYYY-MM-DD');
    const todayBS = await this.nepaliDateService.toBSDate(todayAD, 'YYYY-MM-DD');
    const [bsYear, bsMonth] = todayBS.split('-').map(Number);
    
    // Nepali fiscal year: Shrawan 1 (month 4) to Ashad 31/32 (month 3 of next year)
    // If current month is 4 or higher (Shrawan onwards), we're in current fiscal year
    // Otherwise, we're still in previous fiscal year
    const currentFiscalYearBS = bsMonth >= 4 ? bsYear : bsYear - 1;
    
    // Fiscal year START: Shrawan 1 (BS month 4, day 1)
    const fyStartBS = `${currentFiscalYearBS}-04-01`;
    const fyStartAD = await this.nepaliDateService.toADDate(fyStartBS, 'YYYY-MM-DD');
    
    // Fiscal year END: Ashad last day of next BS year (BS month 3)
    // Ashad (month 3) can have 31 or 32 days depending on year
    let fyEndAD;
    try {
      // Get the actual days in Ashad month
      const daysInAshad = await this.getBSDaysInMonth(currentFiscalYearBS + 1, 3);
      const fyEndBS = `${currentFiscalYearBS + 1}-03-${daysInAshad.toString().padStart(2, '0')}`;
      fyEndAD = await this.nepaliDateService.toADDate(fyEndBS, 'YYYY-MM-DD');
    } catch (error) {
      console.error('Error calculating fiscal year end:', error);
      // Fallback to 32 (max possible)
      try {
        const fyEndBS = `${currentFiscalYearBS + 1}-03-32`;
        fyEndAD = await this.nepaliDateService.toADDate(fyEndBS, 'YYYY-MM-DD');
      } catch {
        const fyEndBS = `${currentFiscalYearBS + 1}-03-31`;
        fyEndAD = await this.nepaliDateService.toADDate(fyEndBS, 'YYYY-MM-DD');
      }
    }
    
    console.log('This Fiscal Year:', { start: fyStartAD, end: fyEndAD, bsYear: currentFiscalYearBS });
    
    return {
      start: fyStartAD,
      end: fyEndAD
    };
  } catch (error) {
    console.error('Error calculating this fiscal year:', error);
    // Fallback to approximate dates if conversion fails
    // Nepal fiscal year approximately: mid-July to mid-July
    const currentDate = moment();
    const fyStart = currentDate.month() >= 6 
      ? moment().month(6).date(16)
      : moment().subtract(1, 'year').month(6).date(16);
    const fyEnd = fyStart.clone().add(1, 'year').subtract(1, 'day');
    
    return {
      start: fyStart.format('YYYY-MM-DD'),
      end: fyEnd.format('YYYY-MM-DD')
    };
  }
}

async getLastFiscalYear() {
  try {
    // Get current date in BS
    const todayAD = moment().format('YYYY-MM-DD');
    const todayBS = await this.nepaliDateService.toBSDate(todayAD, 'YYYY-MM-DD');
    const [bsYear, bsMonth] = todayBS.split('-').map(Number);
    
    // Calculate last fiscal year (one year before current fiscal year)
    const lastFiscalYearBS = bsMonth >= 4 ? bsYear - 1 : bsYear - 2;
    
    // Fiscal year START: Shrawan 1 (BS month 4, day 1)
    const fyStartBS = `${lastFiscalYearBS}-04-01`;
    const fyStartAD = await this.nepaliDateService.toADDate(fyStartBS, 'YYYY-MM-DD');
    
    // Fiscal year END: Ashad last day of next BS year (BS month 3)
    let fyEndAD;
    try {
      const daysInAshad = await this.getBSDaysInMonth(lastFiscalYearBS + 1, 3);
      const fyEndBS = `${lastFiscalYearBS + 1}-03-${daysInAshad.toString().padStart(2, '0')}`;
      fyEndAD = await this.nepaliDateService.toADDate(fyEndBS, 'YYYY-MM-DD');
    } catch (error) {
      console.error('Error calculating last fiscal year end:', error);
      try {
        const fyEndBS = `${lastFiscalYearBS + 1}-03-32`;
        fyEndAD = await this.nepaliDateService.toADDate(fyEndBS, 'YYYY-MM-DD');
      } catch {
        const fyEndBS = `${lastFiscalYearBS + 1}-03-31`;
        fyEndAD = await this.nepaliDateService.toADDate(fyEndBS, 'YYYY-MM-DD');
      }
    }
    
    console.log('Last Fiscal Year:', { start: fyStartAD, end: fyEndAD, bsYear: lastFiscalYearBS });
    
    return {
      start: fyStartAD,
      end: fyEndAD
    };
  } catch (error) {
    console.error('Error calculating last fiscal year:', error);
    const currentDate = moment();
    const fyStart = currentDate.month() >= 6
      ? moment().subtract(1, 'year').month(6).date(16)
      : moment().subtract(2, 'year').month(6).date(16);
    const fyEnd = fyStart.clone().add(1, 'year').subtract(1, 'day');
    
    return {
      start: fyStart.format('YYYY-MM-DD'),
      end: fyEnd.format('YYYY-MM-DD')
    };
  }
}

setTodayAsDefault() {
  const today = moment().format('YYYY-MM-DD');
  
  if (this.field?.controlType === 'asOnDate') {
    this.dateObject.selectedAD = today;
  } else if (this.field?.controlType === 'daterange') {
    this.dateObject.startAD = today;
    this.dateObject.endAD = today;
  }
  
  // Convert to BS if needed (async)
  if (this.showBS) {
    this.convertTodayToBS(today);
  }
}

async convertTodayToBS(todayAD: string) {
  try {
    const todayBS = await this.nepaliDateService.toBSDate(todayAD, 'DD/MM/YYYY');
    if (this.field?.controlType === 'asOnDate') {
      this.dateObject.selectedBS = todayBS;
    } else if (this.field?.controlType === 'daterange') {
      this.dateObject.startBS = todayBS;
      this.dateObject.endBS = todayBS;
    }
  } catch (error) {
    console.error('Error converting today to BS:', error);
  }
}

async initializeDisplayDates() {
  for (const opt of this.rangeOptions) {
    if (opt.getDates) {
      const val = await opt.getDates();
      if (val) {
        opt.display = `${moment(val.start).format('MM-DD-YYYY')} | ${moment(val.end).format('MM-DD-YYYY')}`;
      }
    }
  }
}
}