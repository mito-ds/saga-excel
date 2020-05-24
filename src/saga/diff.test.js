import { simpleDiff2D } from "./diff";

/* global test, expect */

/*
    Tests a simple cell based diff
*/

test('simple diff2D all empty', () => {
    expect(simpleDiff2D([[]], [[]])).toEqual([]);
});

test('simple diff2D no changes', () => {
    expect(simpleDiff2D([[1]], [[1]])).toEqual([]);
});

test('simple diff2D one change', () => {
    const changes = [{
        cell: "A1",
        initialValue: 1, 
        finalValue: 2
    }];
    expect(simpleDiff2D([[1]], [[2]])).toEqual(changes);
});

test('simple diff2D multiple changes', () => {
    const changes = [
    {
        cell: "A1",
        initialValue: 1, 
        finalValue: 2
    },
    {
        cell: "B1",
        initialValue: 3, 
        finalValue: 4
    }];
    expect(simpleDiff2D([[1, 3]], [[2, 4]])).toEqual(changes);
});

test('simple diff2D multiple changes in multiple rows', () => {
    const changes = [
    {
        cell: "A1",
        initialValue: 1, 
        finalValue: 5
    },
    {
        cell: "B1",
        initialValue: 2, 
        finalValue: 6
    }, 
    {
        cell: "A2",
        initialValue: 3, 
        finalValue: 7
    },
    {
        cell: "B2",
        initialValue: 4, 
        finalValue: 8
    }];
    expect(simpleDiff2D([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual(changes);
});

test('simple diff2D multiple changes with deleted values', () => {
    const changes = [
    {
        cell: "A1",
        initialValue: 1, 
        finalValue: 5
    },
    {
        cell: "B2",
        initialValue: 4, 
        finalValue: ""
    }];
    expect(simpleDiff2D([[1, 2], [3, 4]], [[5, 2], [3, ""]])).toEqual(changes);
});

test('simple diff2D added row', () => {
    const changes = [
    {
        cell: "A2",
        initialValue: "", 
        finalValue: 3
    },
    {
        cell: "B2",
        initialValue: "", 
        finalValue: 4
    }];
    expect(simpleDiff2D([[1, 2]], [[1, 2], [3, 4]])).toEqual(changes);
});

test('simple diff2D deleted added row', () => {
    const changes = [
    {
        cell: "A2",
        initialValue: 3, 
        finalValue: ""
    },
    {
        cell: "B2",
        initialValue: 4, 
        finalValue: ""
    }];
    expect(simpleDiff2D([[1, 2], [3, 4]], [[1, 2]])).toEqual(changes);
});

test('simple diff2D deleted sheet', () => {
    const changes = [
    {
        cell: "A1",
        initialValue: 1, 
        finalValue: ""
    }];
    expect(simpleDiff2D([[1]], [])).toEqual(changes);
});

