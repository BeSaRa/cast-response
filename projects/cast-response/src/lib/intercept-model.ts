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

export function InterceptModel(options: {
  send?: (model: any) => any;
  receive?: (model: any) => any;
}): ClassDecorator {
  return (target) => {
    target.prototype[$$_MODEL_INTERCEPTOR] = options;
    return target;
  };
}

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

function cloneArrayModel(model: any[]): any[] {
  return model.map((item) => cloneModel(item));
}

function cloneModel(model: any): any {
  return Array.isArray(model)
    ? cloneArrayModel(model)
    : isObject(model)
    ? Object.assign(new model.constructor(), model)
    : model;
}

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
