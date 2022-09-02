import { ClassConstructor } from '../types/constructors';

export interface CastOptionContract {
  model: () => ClassConstructor<any>;
  unwrap?: string;
  shape?: Record<string, () => ClassConstructor<any>>;
}
