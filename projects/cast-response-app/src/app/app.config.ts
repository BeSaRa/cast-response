import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideInterceptors } from 'cast-response';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { GInterceptor } from './app.component';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserModule),
    provideHttpClient(withFetch()),
    provideInterceptors([GInterceptor]),
    provideClientHydration(),
  ],
};
