import { diff3Merge, diff3Merge2d } from "./mergeUtils";

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

test('2d should add mulitple rows', () => {  
    expect(diff3Merge2d([[1], [2]], [[1], [2]], [[1], [2], [3], [4]])).toEqual([[1], [2], [3], [4]]);
});

test('2d should add mulitple rows and extend too', () => {  
    expect(diff3Merge2d([[1], [2]], [[1, 6], [2, 7]], [[1], [2], [3], [4]])).toEqual([[1, 6], [2, 7], [3], [4]]);
});