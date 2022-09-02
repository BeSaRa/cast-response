export interface InterceptorContract<T> {
  send(model: Partial<T>): Partial<T>;

  receive(model: T): T;
}
