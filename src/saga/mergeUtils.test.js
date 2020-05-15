import { simpleMerge2D } from "./mergeUtils";
import { conflictType } from "../constants";

/* global test, expect */

/*
    Tests a simple cell based merge
*/

test('simple merge all empty', () => {
    expect(simpleMerge2D([[]], [[]], [[]])).toEqual({result: [[]], conflicts: []});
})

test('simple merge all even more empty', () => {
    expect(simpleMerge2D([], [], [])).toEqual({result: [], conflicts: []});
})

test('simple merge one element', () => {
    expect(simpleMerge2D([[1]], [[1]], [[1]])).toEqual({result: [[1]], conflicts: []});
})

test('simple merge mulitple elements in row', () => {
    expect(simpleMerge2D([[1, 2, 3, 4]], [[1, 2, 3, 4]], [[1, 2, 3, 4]])).toEqual({result: [[1, 2, 3, 4]], conflicts: []});
})

test('simple merge mulitple rows', () => {
    expect(simpleMerge2D([[1], [2]], [[1], [2]], [[1], [2]])).toEqual({result: [[1], [2]], conflicts: []});
})

test('simple merge add element in a', () => {
    expect(simpleMerge2D([[1]], [[1, 2]], [[1]])).toEqual({result: [[1, 2]], conflicts: []});
})

test('simple merge add element in b', () => {
    expect(simpleMerge2D([[1]], [[1]], [[1, 2]])).toEqual({result: [[1, 2]], conflicts: []});
})

test('simple merge add row in a', () => {
    expect(simpleMerge2D([[1]], [[1], [2]], [[1]])).toEqual({result: [[1], [2]], conflicts: []});
})

test('simple merge add row in b', () => {
    expect(simpleMerge2D([[1]], [[1]], [[1], [2]])).toEqual({result: [[1], [2]], conflicts: []});
})

test('simple merge add element and row non conflicting in b', () => {
    expect(simpleMerge2D([[1]], [[1, 2]], [[1], [2]])).toEqual({result: [[1, 2], [2]], conflicts: []});
})

test('simple merge origin undefined and add element in a', () => {
    expect(simpleMerge2D([[]], [[1, 2]], [[]])).toEqual({result: [[1, 2]], conflicts: []});
})

test('simple merge add non-conflicting changes after end of origin easy', () => {
    expect(simpleMerge2D([[1]], [[1], [2]], [[1], [], [3]])).toEqual({result: [[1], [2], [3]], conflicts: []});
})

test('simple merge add non-conflicting changes after end of origin medium', () => {
    expect(simpleMerge2D([[1]], [[1], [2], [], [4], []], [[1], [], [3], [], [5]])).toEqual({result: [[1], [2], [3], [4], [5]], conflicts: []});
})

test('simple merge add to same row after end of origin', () => {
    const conflicts = [
        {
            conflictType: conflictType.ROW,  
            rowIndex: 2, 
            colIndex: null, 
            a: [3], 
            b: [3]   
        }
    ]
    expect(simpleMerge2D([[1]], [[1], [2], [3], [4], []], [[1], [], [3], [], [5]])).toEqual({result: [[1], [2], [3], [4], [5]], conflicts: conflicts});
})

test('simple merge add one row conflicting', () => {
    const conflicts = [
        {
            conflictType: conflictType.ROW,
            rowIndex: 1,
            colIndex: null,
            a: [2],
            b: [2]
        }
    ]
    expect(simpleMerge2D([[1]], [[1], [2]], [[1], [2]])).toEqual({result: [[1], [2]], conflicts: conflicts});
})

test('simple merge add one element conflicting', () => {
    const conflicts = [
        {
            conflictType: conflictType.CELL,
            rowIndex: 0,
            colIndex: 1,
            a: 2,
            b: 2
        }
    ]
    expect(simpleMerge2D([[1]], [[1, 2]], [[1, 2]])).toEqual({result: [[1, 2]], conflicts: conflicts});
})







