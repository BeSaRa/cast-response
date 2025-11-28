import { ClassConstructor } from '../types/constructors';

export interface CastStateContract {
  model: () => ClassConstructor<any>;
  shape?: Record<string, () => ClassConstructor<any>>;
}
