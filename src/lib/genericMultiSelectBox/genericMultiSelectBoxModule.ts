import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericPopupGridModule } from '../generic-grid/generic-popup-grid.module';
//import { GenericPopupGridModule } from '../generic-grid/generic-popup-grid.module';
// import { GenericPopUpComponent } from '../Popups/generic-grid/generic-popup-grid.component';
// import { GenericPopupGridModule } from '../Popups/generic-grid/generic-popup-grid.module';
import { GenericMultiSelectComponent } from './genericMultiSelectBox.component';

@NgModule({
  declarations: [GenericMultiSelectComponent],
  imports: [FormsModule, ReactiveFormsModule, GenericPopupGridModule],
  exports: [GenericMultiSelectComponent],
})
export class GenericMultiSelctModule {
  static forRoot(): ModuleWithProviders<any> {
    return { ngModule: GenericMultiSelctModule };
  }
}
