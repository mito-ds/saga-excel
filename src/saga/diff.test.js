import { simpleDiff2D } from "./diff";

/* global test, expect */

/*
    Tests a simple cell based diff
*/

test('simple diff2D all empty', () => {
    expect(simpleDiff2D([[]], [[]], [[]], "Sheet1")).toEqual({sheet: "Sheet1", changes: []});
})

