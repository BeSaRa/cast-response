import { isObject } from './is-object';

describe('isObject', () => {
  it('returns true if the object is an object', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ welcome: true })).toBe(true);
  });

  it('returns false if the object is not an object', () => {
    expect(isObject(undefined)).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject([])).toBe(false);
  });
});
