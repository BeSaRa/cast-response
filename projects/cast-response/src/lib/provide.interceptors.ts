import { ClassConstructor } from './types/constructors';
import { GeneralInterceptorContract } from './contracts/general-interceptor-contract';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { GeneralInterceptor } from './general-interceptor';

// noinspection JSUnusedGlobalSymbols
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
  return makeEnvironmentProviders([]);
}
