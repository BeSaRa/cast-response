import { importProvidersFrom } from '@angular/core';
import { AppComponent, GInterceptor } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideInterceptors } from 'cast-response';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule),
    provideHttpClient(withFetch()),
    provideInterceptors([GInterceptor]),
  ],
}).catch((err) => console.error(err));
