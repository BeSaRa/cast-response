import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
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
      interceptors.map((interceptor) => new interceptor())
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
      interceptors.map((interceptor) => new interceptor())
    );
    return {
      ngModule: CastResponseModule,
      providers: [],
    };
  }
}

/**
 * @description provide all general interceptor that you need any model has @InterceptModel or @CastResponse to pass through it
 * @param interceptors
 */
export function provideInterceptors(
  interceptors?: ClassConstructor<GeneralInterceptorContract>[]
): EnvironmentProviders {
  interceptors &&
    (GeneralInterceptor.interceptors = GeneralInterceptor.interceptors.concat(
      interceptors.map((interceptor) => new interceptor())
    ));
  return makeEnvironmentProviders([
    {
      provide: GeneralInterceptor,
      useValue: GeneralInterceptor.interceptors,
    },
  ]);
}
