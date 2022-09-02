export class GeneralInterceptor {
  static interceptors: GeneralInterceptor[] = [];

  static send(model: any): any {
    return model;
  }

  static receive(model: any): any {
    return model;
  }
}
