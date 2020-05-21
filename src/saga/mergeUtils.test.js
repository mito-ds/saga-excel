import { simpleMerge2D } from "./mergeUtils";
import { conflictType } from "../constants";
import { simpleDiff2D } from "./diff";


/* global test, expect */

/*
    Tests a simple cell based merge
*/

test('simple merge all empty', () => {
    expect(simpleMerge2D([[]], [[]], [[]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[]], conflicts: []});
})

test('simple merge all even more empty', () => {
    expect(simpleMerge2D([], [], [], "Sheet1")).toEqual({sheet: "Sheet1", result: [], conflicts: []});
})

test('simple merge one element', () => {
    expect(simpleMerge2D([[1]], [[1]], [[1]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1]], conflicts: []});
})

test('simple merge mulitple elements in row', () => {
    expect(simpleMerge2D([[1, 2, 3, 4]], [[1, 2, 3, 4]], [[1, 2, 3, 4]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1, 2, 3, 4]], conflicts: []});
})

test('simple merge mulitple rows', () => {
    expect(simpleMerge2D([[1], [2]], [[1], [2]], [[1], [2]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1], [2]], conflicts: []});
})

test('simple merge add element in a', () => {
    expect(simpleMerge2D([[1]], [[1, 2]], [[1]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1, 2]], conflicts: []});
})

test('simple merge add element in b', () => {
    expect(simpleMerge2D([[1]], [[1]], [[1, 2]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1, 2]], conflicts: []});
})

test('simple merge add row in a', () => {
    expect(simpleMerge2D([[1]], [[1], [2]], [[1]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1], [2]], conflicts: []});
})

test('simple merge add row in b', () => {
    expect(simpleMerge2D([[1]], [[1]], [[1], [2]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1], [2]], conflicts: []});
})

test('simple merge add element and row non conflicting in b', () => {
    expect(simpleMerge2D([[1]], [[1, 2]], [[1], [2]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1, 2], [2]], conflicts: []});
})

test('simple merge origin undefined and add element in a', () => {
    expect(simpleMerge2D([[]], [[1, 2]], [[]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1, 2]], conflicts: []});
})

test('simple merge add non-conflicting changes after end of origin easy', () => {
    expect(simpleMerge2D([[1]], [[1], [2]], [[1], [""], [3]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1], [2], [3]], conflicts: []});
})

test('simple merge add non-conflicting changes after end of origin medium', () => {
    expect(simpleMerge2D([[1]], [[1], [2], [""], [4]], [[1], [""], [3], [""], [5]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1], [2], [3], [4], [5]], conflicts: []});
})

test('simple merge add to same row after end of origin the same element', () => {
    expect(simpleMerge2D([[1]], [[1], [2], [3], [4]], [[1], [""], [3], [""], [5]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1], [2], [3], [4], [5]], conflicts: []});
})

test('simple merge add in different spaces in new row', () => {
    expect(simpleMerge2D([[1]], [[1, ""], [2, ""]], [[1, ""], ["", 3]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1, ""], [2, 3]], conflicts: []});
})

test('simple merge add to same row after end of origin different elements', () => {
    const conflicts = [
        {
            conflictType: conflictType.CELL,  
            sheet: "Sheet1",
            cellOrRow: "A3",
            a: 3, 
            b: 33,  
            o: ""
        }
    ]
    expect(simpleMerge2D([[1]], [[1], [2], [3], [4]], [[1], [""], [33], [""], [5]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1], [2], [3], [4], [5]], conflicts: conflicts});
})

test('simple merge add one row conflicting with non coflicting elements', () => {
    expect(simpleMerge2D([[1]], [[1], [2]], [[1], [2]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1], [2]], conflicts: []});
})


test('simple merge add one row conflicting with non coflicting elements', () => {
    const conflicts = [
        {
            conflictType: conflictType.CELL,
            sheet: "Sheet1",
            cellOrRow: "A2",
            a: 2,
            b: 3,
            o: ""
        }
    ]
    expect(simpleMerge2D([[1]], [[1], [2]], [[1], [3]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1], [2]], conflicts: conflicts});
})


test('simple merge add one element conflicting', () => {
    expect(simpleMerge2D([[1]], [[1, 2]], [[1, 2]], "Sheet1")).toEqual({sheet: "Sheet1", result: [[1, 2]], conflicts: []});
})




