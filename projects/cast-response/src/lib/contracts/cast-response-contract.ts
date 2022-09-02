import { ClassConstructor } from '../types/constructors';

export interface CastResponseContract {
  fallback: string;
  unwrap?: string;
  shape?: Record<string, () => ClassConstructor<any>>;
}
