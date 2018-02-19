import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from 'app/authentication/login/login.component';
import { AuthGuard } from 'app/_guards/auth.guard';
import { IndexComponent } from './dashboard/index/index.component';

import { AuthService } from 'app/services/auth.service';
import { BoardService } from 'app/services/board.service';
import { SelectboardComponent } from './dashboard/selectboard/selectboard.component';
import { BoardComponent } from './dashboard/board/board.component';
import { ConnectionService } from 'app/services/connection.service';

const appRoutes: Routes = [
  { path: '', component: IndexComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    IndexComponent,
    SelectboardComponent,
    BoardComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    AuthGuard,
    AuthService,
    BoardService,
    ConnectionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 

  constructor() {}
}
