import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotFoundPageComponent} from './notfound.page';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    NotFoundPageComponent,
  ],
  exports: [
    NotFoundPageComponent,
  ]
})
export class SharedModule {

}
