import { simpleDiff2D } from "./diff";
import { changeType } from '../constants'

/* global test, expect */

/*
    Tests a simple cell based diff
*/

test('simple diff2D all empty', () => {
    expect(simpleDiff2D([[]], [[]], "Sheet1")).toEqual({sheetName: "Sheet1", changeType: changeType.MODIFIED, changes: []});
})

test('simple diff2D no changes', () => {
    expect(simpleDiff2D([[1]], [[1]], "Sheet1")).toEqual({sheetName: "Sheet1", changeType: changeType.MODIFIED, changes: []});
})

test('simple diff2D one change', () => {
    const change = [{
        sheetName: "Sheet1",
        cell: "A1",
        initialValue: 1, 
        finalValue: 2
    }]
    expect(simpleDiff2D([[1]], [[2]], "Sheet1")).toEqual({sheetName: "Sheet1", changeType: changeType.MODIFIED, changes: change});
})

test('simple diff2D multiple changes', () => {
    const change = [
    {
        sheetName: "Sheet1",
        cell: "A1",
        initialValue: 1, 
        finalValue: 2
    },
    {
        sheetName: "Sheet1",
        cell: "B1",
        initialValue: 3, 
        finalValue: 4
    }]
    expect(simpleDiff2D([[1, 3]], [[2, 4]], "Sheet1")).toEqual({sheetName: "Sheet1", changeType: changeType.MODIFIED, changes: change});
})

test('simple diff2D multiple changes in multiple rows', () => {
    const change = [
    {
        sheetName: "Sheet1",
        cell: "A1",
        initialValue: 1, 
        finalValue: 5
    },
    {
        sheetName: "Sheet1",
        cell: "B1",
        initialValue: 2, 
        finalValue: 6
    }, 
    {
        sheetName: "Sheet1",
        cell: "A2",
        initialValue: 3, 
        finalValue: 7
    },
    {
        sheetName: "Sheet1",
        cell: "B2",
        initialValue: 4, 
        finalValue: 8
    }]
    expect(simpleDiff2D([[1, 2], [3, 4]], [[5, 6], [7, 8]], "Sheet1")).toEqual({sheetName: "Sheet1", changeType: changeType.MODIFIED, changes: change});
})

test('simple diff2D multiple changes with deleted values', () => {
    const change = [
    {
        sheetName: "Sheet1",
        cell: "A1",
        initialValue: 1, 
        finalValue: 5
    },
    {
        sheetName: "Sheet1",
        cell: "B2",
        initialValue: 4, 
        finalValue: ""
    }]
    expect(simpleDiff2D([[1, 2], [3, 4]], [[5, 2], [3, ""]], "Sheet1")).toEqual({sheetName: "Sheet1", changeType: changeType.MODIFIED, changes: change});
})

test('simple diff2D added row', () => {
    const change = [
    {
        sheetName: "Sheet1",
        cell: "A2",
        initialValue: "", 
        finalValue: 3
    },
    {
        sheetName: "Sheet1",
        cell: "B2",
        initialValue: "", 
        finalValue: 4
    }]
    expect(simpleDiff2D([[1, 2]], [[1, 2], [3, 4]], "Sheet1")).toEqual({sheetName: "Sheet1", changeType: changeType.MODIFIED, changes: change});
})

test('simple diff2D deleted added row', () => {
    const change = [
    {
        sheetName: "Sheet1",
        cell: "A2",
        initialValue: 3, 
        finalValue: ""
    },
    {
        sheetName: "Sheet1",
        cell: "B2",
        initialValue: 4, 
        finalValue: ""
    }]
    expect(simpleDiff2D([[1, 2], [3, 4]], [[1, 2]], "Sheet1")).toEqual({sheetName: "Sheet1", changeType: changeType.MODIFIED, changes: change});
})

test('simple diff2D deleted sheet', () => {
    const change = [
    {
        sheetName: "Sheet1",
        cell: "A1",
        initialValue: 1, 
        finalValue: ""
    }]
    expect(simpleDiff2D([[1]], [], "Sheet1")).toEqual({sheetName: "Sheet1", changeType: changeType.MODIFIED, changes: change});
})
