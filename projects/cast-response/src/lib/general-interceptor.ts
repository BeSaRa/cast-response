import { GeneralInterceptorContract } from './contracts/general-interceptor-contract';

export class GeneralInterceptor {
  static interceptors: GeneralInterceptorContract[] = [];

  static send(model: any): any {
    GeneralInterceptor.interceptors.forEach((interceptor) => {
      interceptor.send(model);
    });
    return model;
  }

  static receive(model: any): any {
    GeneralInterceptor.interceptors.forEach((interceptor) => {
      interceptor.receive(model);
    });
    return model;
  }
}
