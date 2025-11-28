/*
 * Public API Surface of cast-response
 */
export * from './lib/cast-response.module';
export * from './lib/contracts/model-interceptor-contract';
export * from './lib/contracts/general-interceptor-contract';
export * from './lib/contracts/cast-option-contract';
export * from './lib/contracts/cast-response-contract';
export * from './lib/types/model-interceptors-functions';
export {
  CastResponse,
  CastResponseContainer,
  CastTransferState,
  StateCaster,
} from './lib/cast-response';
export {
  HasInterception,
  InterceptionContainer,
  InterceptModel,
  InterceptParam,
} from './lib/intercept-model';
export {
  provideModelInterceptors,
  provideInterceptors,
} from './lib/provide-model-interceptors';
