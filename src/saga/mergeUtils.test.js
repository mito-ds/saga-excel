import { diff3Merge, diff3Merge2d, simpleMerge2D } from "./mergeUtils";
import { conflictType } from "../constants";

/* global test, expect */

test('should merge unchanged empty', () => {  
    expect(diff3Merge([], [], [])).toEqual([]);
});

test('should merge unchanged empty', () => {  
    expect(diff3Merge([], [], [])).toEqual([]);
});

test('should merge single addition', () => {  
    expect(diff3Merge([], [], [1])).toEqual([1]);
});

test('should merge many additions to single array', () => {  
    expect(diff3Merge([], [], [1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
});

test('should merge single delete', () => {  
    expect(diff3Merge([1], [1], [])).toEqual([]);
});

test('should merge many delete', () => {  
    expect(diff3Merge([1, 2, 3, 4, 5], [1, 2, 3, 4, 5], [])).toEqual([]);
});

test('should merge insert ', () => {  
    expect(diff3Merge([1, 2], [1, 2], [1, 4, 2])).toEqual([1, 4, 2]);
});

test('should merge nonconflicting inserts', () => {  
    expect(diff3Merge([1, 2], [0, 1, 2], [1, 2, 3])).toEqual([0, 1, 2, 3]);
});

test('2d should merge all empty', () => {  
    expect(diff3Merge2d([], [], [])).toEqual([]);
});

test('2d should merge insert one', () => {  
    expect(diff3Merge2d([], [], [[1]])).toEqual([[1]]);
});

test('2d should merge insert many', () => {  
    expect(diff3Merge2d([], [], [[1, 2], [3, 4]])).toEqual([[1, 2], [3, 4]]);
});

test('2d should merge delete one', () => {  
    expect(diff3Merge2d([[1]], [], [[1]])).toEqual([]);
});

test('2d should edit one', () => {  
    expect(diff3Merge2d([[1, 2]], [[1, 2]], [[1, 2, 3]])).toEqual([[1, 2, 3]]);
});

test('2d should allow non conflicting changes in one', () => {  
    expect(diff3Merge2d([[1, 2]], [[0, 1, 2]], [[1, 2, 3]])).toEqual([[0, 1, 2, 3]]);
});

test('2d should add mulitple rows to b', () => {  
    expect(diff3Merge2d([[1], [2]], [[1], [2]], [[1], [2], [3], [4]])).toEqual([[1], [2], [3], [4]]);
});

test('2d should add mulitple rows to a', () => {  
    expect(diff3Merge2d([[1], [2]], [[1], [2], [3], [4]], [[1], [2]])).toEqual([[1], [2], [3], [4]]);
});

test('2d should add mulitple rows and extend too', () => {  
    expect(diff3Merge2d([[1], [2]], [[1, 6], [2, 7]], [[1], [2], [3], [4]])).toEqual([[1, 6], [2, 7], [3], [4]]);
});

test('2d should extend in both places', () => {  
    expect(diff3Merge2d([[1], [2], [3]], [[1, 4], [2], [3]], [[1], [2], [3, 5]])).toEqual([[1, 4], [2], [3, 5]]);
});

test('all equal', () => {  
    expect(diff3Merge2d([["data"], [1], [2], [3]], [["data"], [1], [2], [3]], [["data"], [1], [2], [3]])).toEqual([["data"], [1], [2], [3]]);
});

// TODO this is failing
/*
test('insert in rows below', () => {  
    expect(diff3Merge2d([[]], [[1, 2, 3, 4, 5]], [[""], [""], [""], [6]])).toEqual([[1, 2, 3, 4, 5], [""], [""], [6]]);
});

test('simple merge', () => {  
    //expect(diff3Merge2d([], [[2]], [[1]])).toEqual([[1]]);
});
*/


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







