// noinspection JSUnusedGlobalSymbols

export type SendInterceptorFn<T> = (model: Partial<T>) => Partial<T>;
export type ReceiveInterceptorFn<T> = (model: T) => T;
