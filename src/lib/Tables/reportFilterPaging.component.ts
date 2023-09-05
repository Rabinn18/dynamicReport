import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PaginationInstance, PaginationService } from 'ngx-pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'report-paging',
  templateUrl: './reportFilterPaging.html',
})
export class ReportFilterPaging implements OnDestroy {
  @Input()id:string='DEFAULT_PAGINATION_ID';
  @Input() pageSize: number = 1;
  @Input() currentPage: number = 10;
  @Output() currentPageChange = new EventEmitter<number>();
  @Input() totalRecord: number | undefined = 100;
  @Output() totalRecordChange = new EventEmitter<number>();
  @Output() clickLesser = new EventEmitter();
  @Output() clickGreater = new EventEmitter();
  @Output() pageSizeChanged = new EventEmitter();
  instance!:PaginationInstance;
  changeSub:Subscription;
  constructor(private paginationService:PaginationService){
    
    this.changeSub = this.paginationService.change
            .subscribe(id => {
                if (this.id === id) {
                  this.instance= paginationService.getInstance(this.id);
                    this.currentPage=this.paginationService.getCurrentPage(this.id);
    var totalitems=this.instance.totalItems ?? 0 ;
    var itemsPerPage = this.instance.itemsPerPage;
    if (totalitems < 1) {
            // when there are 0 or fewer (an error case) items, there are no "pages" as such,
            // but it makes sense to consider a single, empty page as the last page.
            this.totalRecord= 1;
        }else{
          this.totalRecord=Math.ceil(totalitems / itemsPerPage);
        }
         
    this.pageSize=this.instance.itemsPerPage;
    console.log({pageinstance:this.instance,id:id,thisid:this.id})
                }
            });
    
  }
  ngOnDestroy(): void {
    this.changeSub.unsubscribe();
  }
  pagesizeChange(event: any) {
    console.log({ pagesizeEvent: event.target.value });
    this.pageSize = event.target.value;
    this.pageSizeChanged.emit(event.target.value);
  }
  clickGreaterthan() {
    var event: any = {
      pageSize: this.pageSize,
      currentPage: this.currentPage,
      totalRecord: this.totalRecord,
    };
    this.clickGreater.emit(event);
  }
  clickLessthan() {
    var event: any = {
      pageSize: this.pageSize,
      currentPage: this.currentPage,
      totalRecord: this.totalRecord,
    };
    this.clickLesser.emit(event);
  }
}
