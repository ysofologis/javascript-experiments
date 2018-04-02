import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {MaterialModule} from './material.module';
import {RouterModule, Routes} from '@angular/router';
import {AdminPageComponent} from './pages/admin.page';
import {AdminModule} from './pages/admin.module';
import {SharedModule} from './pages/shared.module';
import {NotFoundPageComponent} from './pages/notfound.page';
import {CommonModule} from '@angular/common';
import {ITransferService} from './services/TransferService';
import {MockTransferService} from './services/MockTransferService';


const appRoutes: Routes = [
  { path: 'admin', component: AdminPageComponent },
  { path: '',
    redirectTo: '/admin',
    pathMatch: 'full'
  },
  { path: '**', component: NotFoundPageComponent }
];


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    MaterialModule,
    SharedModule,
    AdminModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    { provide: ITransferService, useClass: MockTransferService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
