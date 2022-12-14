import { ModuleWithProviders, NgModule } from '@angular/core';
import { GeneralInterceptor } from './general-interceptor';
import { ClassConstructor } from './types/constructors';
import { GeneralInterceptorContract } from './contracts/general-interceptor-contract';

@NgModule({
  declarations: [],
  imports: [],
  exports: [],
})
export class CastResponseModule {
  static forRoot(
    interceptors: ClassConstructor<GeneralInterceptorContract>[]
  ): ModuleWithProviders<CastResponseModule> {
    GeneralInterceptor.interceptors = GeneralInterceptor.interceptors.concat(
      interceptors.map((i) => new i())
    );
    return {
      ngModule: CastResponseModule,
      providers: [],
    };
  }

  static forChild(
    interceptors: ClassConstructor<GeneralInterceptorContract>[]
  ): ModuleWithProviders<CastResponseModule> {
    GeneralInterceptor.interceptors = GeneralInterceptor.interceptors.concat(
      interceptors.map((i) => new i())
    );
    return {
      ngModule: CastResponseModule,
      providers: [],
    };
  }
}
