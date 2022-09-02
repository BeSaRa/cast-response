import { GeneralInterceptorContract } from './contracts/general-interceptor-contract';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { GeneralInterceptor } from './general-interceptor';

@NgModule({
  declarations: [],
  imports: [],
  exports: [],
})
export class CastResponseModule {
  static forRoot(
    interceptors: GeneralInterceptorContract[]
  ): ModuleWithProviders<CastResponseModule> {
    GeneralInterceptor.interceptors = GeneralInterceptor.interceptors.concat([
      interceptors,
    ]);
    return {
      ngModule: CastResponseModule,
      providers: [],
    };
  }

  static forChild(
    interceptors: GeneralInterceptorContract[]
  ): ModuleWithProviders<CastResponseModule> {
    GeneralInterceptor.interceptors = GeneralInterceptor.interceptors.concat([
      interceptors,
    ]);
    return {
      ngModule: CastResponseModule,
      providers: [],
    };
  }
}
