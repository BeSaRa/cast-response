import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CastResponseModule, GeneralInterceptorContract } from 'cast-response';

export class Interceptor implements GeneralInterceptorContract {
  send(model: Partial<any>): Partial<any> {
    return model;
  }

  receive(model: any) {
    return model;
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    CastResponseModule.forRoot([Interceptor]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
