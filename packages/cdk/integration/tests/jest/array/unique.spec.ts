import { unique } from '@angular-ru/cdk/array';
import { Any } from '@angular-ru/cdk/typings';

describe('[TEST]: unique', () => {
    const a: Any = {};
    const b: Any = {};
    const c: Any = {};

    it('should return empty array', () => {
        expect([].filter(unique)).toEqual([]);
    });
    it('should return one object', () => {
        expect([a].filter(unique)).toEqual([a]);
    });
    it('should return the same array', () => {
        expect([a, b, c].filter(unique)).toEqual([a, b, c]);
    });
    it('should return array with no duplicates of objects', () => {
        expect([a, b, c, c, a].filter(unique)).toEqual([a, b, c]);
    });
    it('should return array with no duplicates of strings', () => {
        expect(['a', 'b', 'b', 'b'].filter(unique)).toEqual(['a', 'b']);
    });
    it('should return array with no duplicates of numbers', () => {
        expect([13, 13, 13].filter(unique)).toEqual([13]);
    });
    it('should return array with no duplicates according to values and types', () => {
        expect([a, a, 'a', 13, 13, '13'].filter(unique)).toEqual([a, 'a', 13, '13']);
    });
    it('should return array with no duplicates of booleans', () => {
        expect([true, true, false].filter(unique)).toEqual([true, false]);
    });
    it('should return array with no duplicates of "no value" types', () => {
        expect([null, null, undefined, undefined, '', '', Infinity, Infinity].filter(unique)).toEqual([
            null,
            undefined,
            '',
            Infinity
        ]);
    });
    it('should return empty array for the array of "NaN"', () => {
        expect([NaN, NaN].filter(unique)).toEqual([]);
    });
});
