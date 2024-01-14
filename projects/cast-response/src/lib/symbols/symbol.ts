export const $$_CAST_RESPONSE = Symbol('$$_CAST_RESPONSE');
export const $$_CAST_RESPONSE_CONTAINER = Symbol('$$_CAST_RESPONSE_CONTAINER');
export const $$_MODEL_INTERCEPTOR = Symbol('$$_MODEL_INTERCEPTOR');
export const $$_PARAMS_INTERCEPTORS = Symbol('$$_PARAMS_INTERCEPTORS');
export const $$_INTERCEPT_CONTAINER = Symbol('$$_INTERCEPT_CONTAINER');

export type InterceptMap = Map<
  string | symbol | undefined,
  Record<number, (model: any) => any>
>;

export type interceptContainerOptions = Record<
  string,
  Record<number, (model: any) => any>
>;
