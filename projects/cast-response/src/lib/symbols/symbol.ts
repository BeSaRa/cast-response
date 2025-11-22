/**
 * @internal
 */
export const $$_CAST_RESPONSE = Symbol('$$_CAST_RESPONSE');
/**
 * @internal
 */
export const $$_CAST_RESPONSE_CONTAINER = Symbol('$$_CAST_RESPONSE_CONTAINER');
/**
 * @internal
 */
export const $$_MODEL_INTERCEPTOR = Symbol('$$_MODEL_INTERCEPTOR');
/**
 * @internal
 */
export const $$_PARAMS_INTERCEPTORS = Symbol('$$_PARAMS_INTERCEPTORS');
/**
 * @internal
 */
export const $$_INTERCEPT_CONTAINER = Symbol('$$_INTERCEPT_CONTAINER');
/**
 * @internal
 */
export type InterceptMap = Map<
  string | symbol | undefined,
  Record<number, (model: any) => any>
>;
/**
 * @internal
 */
export type interceptContainerOptions = Record<
  string,
  Record<number, (model: any) => any>
>;
