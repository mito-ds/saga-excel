import { diff3Merge, diff3Merge2d } from "./mergeUtils";
import { isExportDeclaration } from "typescript";

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



// TODO: test:

// a = [[1], [2]], b = [[1], [2], [3], [4]], o = [[1], [2]]

