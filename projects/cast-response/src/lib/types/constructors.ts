export type ClassConstructor<T> = new (...args: any[]) => T;
export type ClassAbstractConstructor<T = object> = abstract new (
  ...args: any[]
) => T;
