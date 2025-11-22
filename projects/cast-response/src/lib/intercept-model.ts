import {
  $$_INTERCEPT_CONTAINER,
  $$_MODEL_INTERCEPTOR,
  $$_PARAMS_INTERCEPTORS,
  interceptContainerOptions,
  InterceptMap,
} from './symbols/symbol';
import { identity } from 'rxjs';
import { GeneralInterceptor } from './general-interceptor';
import { isObject } from './helpers/is-object';

/**
 * Decorator that adds model interception capabilities to a class.
 * @param options Configuration object for model interception
 * @param options.send Optional function to transform model before sending
 * @param options.receive Optional function to transform model after receiving
 * @returns Class decorator function
 */
export function InterceptModel(options: {
  send?: (model: any) => any;
  receive?: (model: any) => any;
}): ClassDecorator {
  return (target) => {
    target.prototype[$$_MODEL_INTERCEPTOR] = options;
    return target;
  };
}

/**
 * Decorator that marks a class as an interception container and configures interception options.
 * @param options Optional configuration object containing interception mappings
 * @returns Class decorator function
 */
export function InterceptionContainer(
  options?: interceptContainerOptions
): ClassDecorator {
  return (target: any) => {
    if (!target[$$_INTERCEPT_CONTAINER]) {
      target.prototype[$$_INTERCEPT_CONTAINER] = new Map<
        string,
        Record<number, (model: any) => any>
      >();
    }
    const ref = target.prototype[$$_INTERCEPT_CONTAINER] as InterceptMap;
    options &&
      Object.entries(options).forEach(([key, interceptor]) => {
        ref.set(key, interceptor);
      });
    return target;
  };
}

/**
 * Helper function to determine the appropriate send interceptor for a model.
 * @param model The model to be intercepted
 * @param index The parameter index
 * @param interceptor Optional explicit interceptor function
 * @param backupInterceptors Optional fallback interceptors
 * @returns Function that will intercept the model
 */
function getSendInterceptor(
  model: any,
  index: number,
  interceptor?: (model: any) => any,
  backupInterceptors?: Record<number, (model: any) => any>
): (model: any) => any {
  return interceptor
    ? interceptor
    : backupInterceptors && backupInterceptors[index]
    ? backupInterceptors[index]
    : Array.isArray(model) &&
      model[0] &&
      model[0][$$_MODEL_INTERCEPTOR] &&
      model[0][$$_MODEL_INTERCEPTOR].send
    ? model[0][$$_MODEL_INTERCEPTOR].send
    : model[$$_MODEL_INTERCEPTOR] && model[$$_MODEL_INTERCEPTOR].send
    ? model[$$_MODEL_INTERCEPTOR].send
    : identity;
}

/**
 * Creates a deep clone of an array model.
 * @param model Array to be cloned
 * @returns Cloned array
 */
function cloneArrayModel(model: any[]): any[] {
  return model.map((item) => cloneModel(item));
}

/**
 * Creates a deep clone of a model.
 * @param model Model to be cloned
 * @returns Cloned model
 */
function cloneModel(model: any): any {
  return Array.isArray(model)
    ? cloneArrayModel(model)
    : isObject(model)
    ? Object.assign(new model.constructor(), model)
    : model;
}

/**
 * Method decorator that enables interception for method parameters.
 * @param target The prototype of the class
 * @param propertyKey The name of the method
 * @param descriptor The property descriptor
 * @returns Modified property descriptor
 */
export function HasInterception<T>(
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void {
  const original = descriptor.value as unknown as Function;
  descriptor.value = function (this: any, ...args: any[]) {
    let newArgs = args;
    const paramsInterceptors = this[$$_PARAMS_INTERCEPTORS] as InterceptMap;
    const containerInterceptors = this[$$_INTERCEPT_CONTAINER] as InterceptMap;
    if (paramsInterceptors.size && paramsInterceptors.has(propertyKey)) {
      const backupInterceptors =
        containerInterceptors && containerInterceptors.get(propertyKey);
      Object.entries(paramsInterceptors.get(propertyKey)!).forEach(
        ([index, interceptor]) => {
          const model = args[Number(index)];
          // check if the interceptor exists or get it from the container
          const paramInterceptor = getSendInterceptor(
            model,
            Number(index),
            interceptor,
            backupInterceptors
          );

          // later if not in the container get it from the model itself
          newArgs[Number(index)] = Array.isArray(model)
            ? model.map((item) =>
                GeneralInterceptor.send(paramInterceptor(cloneModel(item)))
              )
            : GeneralInterceptor.send(paramInterceptor(cloneModel(model)));
        }
      );
    }
    return original.apply(this, newArgs);
  } as unknown as T;

  return descriptor;
}

/**
 * Parameter decorator that configures interception for a specific parameter.
 * @param interceptor Optional function to intercept the parameter
 * @returns Parameter decorator function
 */
export function InterceptParam(
  interceptor?: (model: any) => any
): ParameterDecorator {
  return (target: any, propertyKey, parameterIndex) => {
    if (!target[$$_PARAMS_INTERCEPTORS]) {
      target[$$_PARAMS_INTERCEPTORS] = new Map<
        string | symbol,
        Record<number, (model: any) => any>
      >();
    }
    const ref = target[$$_PARAMS_INTERCEPTORS] as InterceptMap;

    if (!ref.has(propertyKey)) {
      ref.set(propertyKey, {});
    }
    const oldPrams = ref.get(propertyKey);

    ref.set(propertyKey, {
      ...oldPrams,
      [parameterIndex]: interceptor!,
    });
  };
}
