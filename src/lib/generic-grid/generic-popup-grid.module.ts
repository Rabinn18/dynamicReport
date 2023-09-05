import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { GenericPopUpComponent } from './generic-popup-grid.component';
//import { NgaModule } from '../../../theme/nga.module';
import { NgxPaginationModule } from 'ngx-pagination';
// import { MasterRepo } from '../../repositories';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    HttpClientModule,
    //NgaModule,
    NgxPaginationModule,
    FontAwesomeModule
  ],
  declarations: [GenericPopUpComponent],
  exports: [GenericPopUpComponent],
})
export class GenericPopupGridModule {
  static forRoot(): ModuleWithProviders<GenericPopupGridModule> {
    return {
      ngModule: GenericPopupGridModule,
      // providers: [MasterRepo],
    };
  }
}
