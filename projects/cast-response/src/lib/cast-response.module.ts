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
  // noinspection JSUnusedGlobalSymbols
  /**
   * @description provide all general interceptor that you need any model has @InterceptModel or @CastResponse to pass through it
   * @param interceptors
   */
  static forRoot(
    interceptors?: ClassConstructor<GeneralInterceptorContract>[]
  ): ModuleWithProviders<CastResponseModule> {
    interceptors &&
      (GeneralInterceptor.interceptors = GeneralInterceptor.interceptors.concat(
        interceptors.map((interceptor) => new interceptor())
      ));
    return {
      ngModule: CastResponseModule,
      providers: [],
    };
  }
  // noinspection JSUnusedGlobalSymbols
  /**
   * @description provide all general interceptor that you need any model has @InterceptModel or @CastResponse to pass through it
   * @param interceptors
   */
  static forChild(
    interceptors?: ClassConstructor<GeneralInterceptorContract>[]
  ): ModuleWithProviders<CastResponseModule> {
    interceptors &&
      (GeneralInterceptor.interceptors = GeneralInterceptor.interceptors.concat(
        interceptors.map((interceptor) => new interceptor())
      ));
    return {
      ngModule: CastResponseModule,
      providers: [],
    };
  }
}
