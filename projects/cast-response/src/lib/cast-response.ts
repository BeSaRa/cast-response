import { ClassConstructor } from './types/constructors';
import { CastResponseContract } from './contracts/cast-response-contract';
import {
  $$_CAST_RESPONSE,
  $$_CAST_RESPONSE_CONTAINER,
  $$_MODEL_INTERCEPTOR,
} from './symbols/symbol';
import { GeneralInterceptor } from './general-interceptor';
import { isObject } from './helpers/is-object';
import { identity, isObservable, map, Observable } from 'rxjs';
import { CastOptionContract } from './contracts/cast-option-contract';
import { isPromise } from 'rxjs/internal/util/isPromise';

/**
 * @internal
 * Splits a property string by dots and filters out any empty segments
 * @param property The property string to filter
 * @returns Array of property segments
 */
function getFilteredProperty(property: string) {
  return property.split('.').filter((item) => item !== '.');
}

/**
 * @internal
 * Recursively casts properties of a model according to the shape array
 * @param model The model object to cast
 * @param castTo Function that returns the constructor to cast to
 * @param shapeArray Array of property paths to cast
 * @returns The cast model
 */
function castProperty(
  model: any,
  castTo: () => ClassConstructor<any>,
  shapeArray: string[]
) {
  const property = shapeArray.shift();

  if (
    property &&
    property === '*' &&
    !shapeArray.length &&
    Array.isArray(model)
  ) {
    const BluePrint = castTo();
    const interceptor = getReceiveInterceptor(BluePrint);
    model = model.map((item) =>
      interceptor(Object.assign(new BluePrint(), item))
    );
  }

  if (property && model[property] && shapeArray.length) {
    model[property] = castProperty(model[property], castTo, shapeArray.slice());
  }
  // if it is the last property, and it is not an array
  if (
    property &&
    (model[property] || property === '{}') &&
    !shapeArray.length
  ) {
    const BluePrint = castTo();
    const interceptor = getReceiveInterceptor(BluePrint);

    if (property === '{}') {
      const objectKeys = Object.keys(model);
      objectKeys.forEach((key) => {
        isObject(model[key]) &&
          (model[key] = interceptor(
            Object.assign(new BluePrint(), model[key])
          ));
      });
    } else {
      model[property] = interceptor(
        Object.assign(new BluePrint(), model[property])
      );
    }
  }

  if (property && !model[property] && property === '{}' && shapeArray.length) {
    const objectKeys = Object.keys(model);
    objectKeys.forEach((key) => {
      model[key] = castProperty(model[key], castTo, shapeArray.slice());
    });
  }

  if (
    property &&
    property === '*' &&
    shapeArray.length &&
    Array.isArray(model)
  ) {
    model = model.map((item) => {
      return castProperty(item, castTo, shapeArray.slice());
    });
  }
  return model;
}

/**
 * @internal
 * Gets the receive interceptor function from a blueprint class
 * @param BluePrint The blueprint class to get the interceptor from
 * @returns The receive interceptor function or identity function
 */
function getReceiveInterceptor(BluePrint: any): (model: any) => any {
  return (
    (BluePrint &&
      BluePrint.prototype &&
      BluePrint.prototype[$$_MODEL_INTERCEPTOR] &&
      BluePrint.prototype[$$_MODEL_INTERCEPTOR].receive) ||
    (identity as (model: any) => any)
  );
}

/**
 * @internal
 * Casts a model according to a shape definition
 * @param model The model to cast
 * @param shape Object defining the shape to cast to
 * @returns The cast model
 */
function castShape(
  model: any,
  shape?: Record<string, () => ClassConstructor<any>>
): any {
  const shapeKeys = shape ? Object.entries(shape) : [];
  if (shapeKeys.length) {
    shapeKeys.forEach(([property, cast]) => {
      const shapeArray = getFilteredProperty(property);
      cast ? castProperty(model, cast, shapeArray.slice()) : null;
    });
  }
  return model;
}

/**
 * @internal
 * Casts a single model instance according to the provided callback and options
 * @param callback Function or string that determines the cast target
 * @param model The model to cast
 * @param options Cast response options
 * @param instance The class instance
 * @param propertyKey The property key being processed
 * @returns The cast model
 */
function castModel(
  callback: undefined | string | (() => ClassConstructor<any>),
  model: any,
  options: CastResponseContract,
  instance: any,
  propertyKey: string | symbol
) {
  let BluePrint;

  switch (typeof callback) {
    case 'function':
      BluePrint = callback();
      break;
    case 'string':
      BluePrint = instance.hasOwnProperty(callback)
        ? instance[callback]()
        : undefined;
      break;
    default:
      const map = instance[$$_CAST_RESPONSE_CONTAINER] as Map<
        string | symbol,
        CastOptionContract
      >;

      if (map) {
        const modelInfo = map.has(propertyKey)
          ? map.get(propertyKey)
          : map.has(options.fallback!)
          ? map.get(options.fallback!)
          : undefined;

        if (modelInfo) {
          BluePrint = modelInfo.model();
          options.shape = modelInfo.shape;
        }
      }
      break;
  }
  model = options.shape ? castShape(model, options.shape) : model;
  const interceptor = getReceiveInterceptor(BluePrint);

  return interceptor(
    GeneralInterceptor.receive(
      BluePrint ? Object.assign(new BluePrint(), model) : model
    )
  );
}

/**
 * @internal
 * Casts an array of models using the castModel function
 * @param callback Function or string that determines the cast target
 * @param models Array of models to cast
 * @param options Cast response options
 * @param instance The class instance
 * @param propertyKey The property key being processed
 * @returns Array of cast models
 */
function castCollection(
  callback: undefined | string | (() => ClassConstructor<any>),
  models: any[],
  options: CastResponseContract,
  instance: any,
  propertyKey: string | symbol
) {
  return models.map((model) =>
    castModel(callback, model, options, instance, propertyKey)
  );
}

// noinspection JSUnusedGlobalSymbols
/**
 * Decorator that automatically casts response data to specified model types
 * @param callback Optional function or string that determines the cast target
 * @param options Configuration options for casting response
 * @returns Method decorator
 */
export function CastResponse(
  callback?: undefined | string | (() => ClassConstructor<any>),
  options: CastResponseContract = {
    fallback: '$default',
    unwrap: 'rs',
  }
): MethodDecorator {
  return <T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    if (!target[$$_CAST_RESPONSE]) {
      target[$$_CAST_RESPONSE] = {};
    }

    target[$$_CAST_RESPONSE][propertyKey] = propertyKey;

    const original = descriptor.value! as unknown as () => Observable<any>;
    descriptor.value = function (this: any, ...args: []): Observable<any> {
      const instance = this;
      const containerMap = instance[$$_CAST_RESPONSE_CONTAINER] as Map<
        string | symbol,
        CastOptionContract
      >;
      let hasUnwrap: boolean = false;
      let unwrapProperty = '';
      let unwrapProperties: string[] = [];
      // check the container first if it has unwrap property
      if (
        containerMap &&
        containerMap.has(propertyKey) &&
        containerMap.get(propertyKey)!.unwrap
      ) {
        hasUnwrap = true;
        unwrapProperty = containerMap.get(propertyKey)!.unwrap!;
      }
      // override hasUnwrap if the CastResponse itself has unwrap options,
      // this is useful when you have multiple CastResponse with different unwrap options
      if (options.unwrap) {
        hasUnwrap = true;
        unwrapProperty = options.unwrap;
      }
      // create array from unwrap property to use it later while reaching the model
      if (hasUnwrap) {
        unwrapProperties = unwrapProperty.split('.');
      }
      const result = original.apply(instance, args);

      function runApplyCasting(models: any) {
        return applyCasting(
          models,
          hasUnwrap,
          unwrapProperties,
          unwrapProperty,
          instance,
          callback,
          propertyKey,
          options
        );
      }

      return isObservable(result)
        ? result.pipe(map((models) => runApplyCasting(models)))
        : isPromise(result)
        ? result.then((models) => runApplyCasting(models))
        : runApplyCasting(result);
    } as unknown as T;
    return descriptor;
  };
}

/**
 * @internal
 * Applies casting to models after unwrapping if necessary
 * @param models The models to cast
 * @param hasUnwrap Whether to unwrap the response
 * @param unwrapProperties Array of properties to traverse for unwrapping
 * @param unwrapProperty The complete unwrap property path
 * @param instance The class instance
 * @param callback Function or string that determines the cast target
 * @param propertyKey The property key being processed
 * @param options Cast response options
 * @returns The cast model(s)
 */
function applyCasting(
  models: any,
  hasUnwrap: boolean,
  unwrapProperties: string[],
  unwrapProperty: string,
  instance: any,
  callback: undefined | string | (() => ClassConstructor<any>),
  propertyKey: string | symbol,
  options: CastResponseContract
) {
  models =
    isObject(models) && hasUnwrap
      ? ((length) => {
          return length > 1
            ? unwrapProperties.reduce((acc, property, index) => {
                return index == 0 ? models[property] : acc[property];
              }, {} as Record<string, any>)
            : (() => {
                return models.hasOwnProperty(unwrapProperty)
                  ? models[unwrapProperty]
                  : models;
              })();
        })(unwrapProperties.length)
      : models;
  /* check if the models is an array or not to use the correct casting function*/
  return models
    ? Array.isArray(models)
      ? castCollection(callback, models, options, instance, propertyKey)
      : castModel(callback, models, options, instance, propertyKey)
    : models;
}

// noinspection JSUnusedGlobalSymbols
/**
 * Class decorator that defines casting options for multiple response handlers
 * @param options Record of casting options for different response handlers
 * @returns Class decorator
 */
export function CastResponseContainer(
  options: Record<string, CastOptionContract>
): ClassDecorator {
  return (target: any) => {
    if (!target[$$_CAST_RESPONSE_CONTAINER]) {
      target.prototype[$$_CAST_RESPONSE_CONTAINER] = new Map<
        string,
        CastOptionContract
      >();
    }
    Object.keys(options).forEach((key) => {
      target.prototype[$$_CAST_RESPONSE_CONTAINER].set(key, options[key]);
    });
    return target;
  };
}
