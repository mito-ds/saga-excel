import { simpleDiff2D } from "./diff";

/* global test, expect */

/*
    Tests a simple cell based diff
*/

test('simple diff2D all empty', () => {
    expect(simpleDiff2D([[]], [[]], "Sheet1")).toEqual({sheet: "Sheet1", changes: []});
})

test('simple diff2D no changes', () => {
    expect(simpleDiff2D([[1]], [[1]], "Sheet1")).toEqual({sheet: "Sheet1", changes: []});
})

test('simple diff2D one change', () => {
    const change = [{
        sheet: "Sheet1",
        cell: "A1",
        initalElement: 1, 
        finalElement: 2
    }]
    expect(simpleDiff2D([[1]], [[2]], "Sheet1")).toEqual({sheet: "Sheet1", changes: change});
})

test('simple diff2D multiple changes', () => {
    const change = [
    {
        sheet: "Sheet1",
        cell: "A1",
        initalElement: 1, 
        finalElement: 2
    },
    {
        sheet: "Sheet1",
        cell: "B1",
        initalElement: 3, 
        finalElement: 4
    }]
    expect(simpleDiff2D([[1, 3]], [[2, 4]], "Sheet1")).toEqual({sheet: "Sheet1", changes: change});
})

test('simple diff2D multiple changes in multiple rows', () => {
    const change = [
    {
        sheet: "Sheet1",
        cell: "A1",
        initalElement: 1, 
        finalElement: 5
    },
    {
        sheet: "Sheet1",
        cell: "B1",
        initalElement: 2, 
        finalElement: 6
    }, 
    {
        sheet: "Sheet1",
        cell: "A2",
        initalElement: 3, 
        finalElement: 7
    },
    {
        sheet: "Sheet1",
        cell: "B2",
        initalElement: 4, 
        finalElement: 8
    }]
    expect(simpleDiff2D([[1, 2], [3, 4]], [[5, 6], [7, 8]], "Sheet1")).toEqual({sheet: "Sheet1", changes: change});
})

test('simple diff2D multiple changes with deleted values', () => {
    const change = [
    {
        sheet: "Sheet1",
        cell: "A1",
        initalElement: 1, 
        finalElement: 5
    },
    {
        sheet: "Sheet1",
        cell: "B2",
        initalElement: 4, 
        finalElement: ""
    }]
    expect(simpleDiff2D([[1, 2], [3, 4]], [[5, 2], [3, ""]], "Sheet1")).toEqual({sheet: "Sheet1", changes: change});
})

test('simple diff2D added row', () => {
    const change = [
    {
        sheet: "Sheet1",
        cell: "A2",
        initalElement: "", 
        finalElement: 3
    },
    {
        sheet: "Sheet1",
        cell: "B2",
        initalElement: "", 
        finalElement: 4
    }]
    expect(simpleDiff2D([[1, 2]], [[1, 2], [3, 4]], "Sheet1")).toEqual({sheet: "Sheet1", changes: change});
})

test('simple diff2D deleted added row', () => {
    const change = [
    {
        sheet: "Sheet1",
        cell: "A2",
        initalElement: 3, 
        finalElement: ""
    },
    {
        sheet: "Sheet1",
        cell: "B2",
        initalElement: 4, 
        finalElement: ""
    }]
    expect(simpleDiff2D([[1, 2], [3, 4]], [[1, 2]], "Sheet1")).toEqual({sheet: "Sheet1", changes: change});
})

test('simple diff2D deleted sheet', () => {
    const change = [
    {
        sheet: "Sheet1",
        cell: "A1",
        initalElement: 1, 
        finalElement: ""
    }]
    expect(simpleDiff2D([[1]], [], "Sheet1")).toEqual({sheet: "Sheet1", changes: change});
})

test('simple diff2D added sheet', () => {
    const change = [
    {
        sheet: "Sheet1",
        cell: "A1",
        initalElement: "", 
        finalElement: 1
    }]
    expect(simpleDiff2D([], [[1]], "Sheet1")).toEqual({sheet: "Sheet1", changes: change});
})

