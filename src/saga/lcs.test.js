import {max, longestCommonSubsequence, sim, longestCommonSubsequence2d} from "./lcs";

/*
Empty, null, or undefined inputs should behave correctly.
*/

// TODO: can we put this in a test block, instead of commenting?

test('two empty input have empty lcs', () => {
    expect(longestCommonSubsequence([], [])).toEqual([]);
});

test('first empty input have empty lcs', () => {
    expect(longestCommonSubsequence([], [1, 2, 3])).toEqual([]);
});

test('second empty input have empty lcs', () => {
    expect(longestCommonSubsequence([1, 2, 3], [])).toEqual([]);
});

test('first null input have empty lcs', () => {
    expect(longestCommonSubsequence(null, [1, 2, 3])).toEqual([]);
});

test('second null input have empty lcs', () => {
    expect(longestCommonSubsequence([1, 2, 3], null)).toEqual([]);
});

test('first undefined input have empty lcs', () => {
    expect(longestCommonSubsequence(undefined, [1, 2, 3])).toEqual([]);
});

test('second undefined input have empty lcs', () => {
    expect(longestCommonSubsequence([1, 2, 3], undefined)).toEqual([]);
});

test('length one lcs is matched', () => {
    expect(longestCommonSubsequence([1], [1])).toEqual([[0, 0, 1]]);
});

test('every other lcs is matched', () => {
    expect(longestCommonSubsequence([1, 2, 1], [1, 3, 1])).toEqual([[0, 0, 1], [2, 2, 1]]);
});

test('lcs prefix matches', () => {
    expect(longestCommonSubsequence([1, 2], [0, 1, 2])).toEqual([[0, 1, 1], [1, 2, 1]]);
});

test('sim returns 1 on two null arrays', () => {    
    expect(sim(null, null)).toEqual(1);
});

test('sim returns 1 on two undefined arrays', () => {    
    expect(sim(undefined, undefined)).toEqual(1);
});

test('sim returns 1 on two empty arrays', () => {    
    expect(sim([], [])).toEqual(1);
});

test('sim returns zero on one empty array', () => {    
    expect(sim([], [1])).toEqual(0);
});


test('sim returns one on equal arrays one element', () => {    
    expect(sim([1], [1])).toEqual(1);
});


test('sim returns one on equal arrays many elements', () => {    
    expect(sim([1, 2, 3, 4, 5], [1, 2, 3, 4, 5])).toEqual(1);
});

test('sim in middle for partially equal array', () => {    
    const similarity = sim([1, 2, 4, 5], [1, 2, 3, 5]);
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThan(1);
});

test('lcs2d to be empty for both empty', () => {  
    expect(longestCommonSubsequence2d([], [])).toEqual([]);
});

test('lcs2d to be empty for first empty', () => {  
    expect(longestCommonSubsequence2d([], [[1]])).toEqual([]);
});

test('lcs2d to be empty for second empty', () => {  
    expect(longestCommonSubsequence2d([[1]], [])).toEqual([]);
});

test('lcs2d to be empty for first null', () => {  
    expect(longestCommonSubsequence2d(null, [[1]])).toEqual([]);
});

test('lcs2d to be empty for second empty', () => {  
    expect(longestCommonSubsequence2d([[1]], null)).toEqual([]);
});

test('lcs2d two equal one element exact matches', () => {  
    expect(longestCommonSubsequence2d([[1]], [[1]])).toEqual([[0, 0, 1]]);
});

test('lcs2d two equal multi element exact matches', () => {  
    expect(longestCommonSubsequence2d([[1], [2], [3]], [[1], [2], [3]])).toEqual([[0, 0, 1], [1, 1, 1], [2, 2, 1]]);
});

test('lcs2d two equal multi element exact matches', () => {  
    expect(longestCommonSubsequence2d([[1], [2], [3]], [[1], [2], [3]])).toEqual([[0, 0, 1], [1, 1, 1], [2, 2, 1]]);
});

test('lcs2d two equal multi element partial matches', () => {  
    expect(longestCommonSubsequence2d([[1], [4], [3]], [[1], [2], [3]])).toEqual([[0, 0, 1], [2, 2, 1]]);
});

test('lcs2d two equal multi element partial internal matches', () => {  
    const lcs2d = longestCommonSubsequence2d([[1], [2, 4], [3]], [[1], [2], [3]])
    expect(lcs2d[0]).toEqual([0, 0, 1]);
    expect(lcs2d[2]).toEqual([2, 2, 1]);
    expect(lcs2d[1][0]).toEqual(1);
    expect(lcs2d[1][1]).toEqual(1);
    expect(lcs2d[1][2]).toBeGreaterThan(0);
    expect(lcs2d[1][2]).toBeLessThan(1);
});





