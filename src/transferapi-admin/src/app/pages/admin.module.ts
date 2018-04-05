import {NgModule} from '@angular/core';
import {AdminPageComponent} from './admin.page';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '../material.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [
    AdminPageComponent,
  ],
  exports: [
    AdminPageComponent
  ]
})
export class AdminModule {

}
