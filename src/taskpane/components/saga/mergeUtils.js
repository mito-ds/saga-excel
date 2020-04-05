import {max, longestCommonSubsequence, longestCommonSubsequence2d} from "./lcs";


function getChunkInc(origin, aValues, bValues, aMatches, bMatches, oIndex, aIndex, bIndex) {

    const mergedMatches = mergeMatches(aMatches, bMatches, origin.length);

    // First, we find the first index that isn't matched
    for (let i = oIndex; i < mergedMatches.length; i++) {
        let aIdx, bIdx;
        [aIdx, bIdx] = mergedMatches[i];

        if (aIdx === null || bIdx == null) {
            return i - oIndex;
        }
    }

    // If we haven't returned, we check there's nothing not matched at the end
    let aIdxLast, bIdxLast;
    [aIdxLast, bIdxLast] = mergedMatches[mergedMatches.length - 1];
    if ((aIdxLast !== aValues.length - 1) || (bIdxLast !== bValues.length - 1)) {
        return origin.length - oIndex;
    }
    return null;
}

function mergeMatches(aMatches, bMatches, oLength) {
    // returns an array mergedMatches where mergedMatches[i] is the [aIdx, bIdx] of matches
    // where aIdx, bIdx are null if they are not matched to i in origin

    let mergedMatches = Array.from({length: oLength}, e => Array(2).fill(null));

    for (let i = 0; i < aMatches.length; i++) {
        let oIdx, aIdx, sim;
        [oIdx, aIdx, sim] = aMatches[i];
        mergedMatches[oIdx][0] = aIdx;
    }

    for (let i = 0; i < bMatches.length; i++) {
        let oIdx, bIdx, sim;
        [oIdx, bIdx, sim] = bMatches[i];
        mergedMatches[oIdx][1] = bIdx;
    }

    return mergedMatches;
}

function getChunkStarts(aMatches, bMatches, oLength, oIndex) {
    // Finds the index of the start of the next chunk

    const mergedMatches = mergeMatches(aMatches, bMatches, oLength);

    for (let i = oIndex + 1; i < mergedMatches.length; i++) {
        if (mergedMatches[i][0] !== null && mergedMatches[i][1] !== null) {
            return [i, mergedMatches[i][0], mergedMatches[i][1]];
        }
    }

    return null;
}

function diff3Chunks(origin, aValues, bValues) {
    let chunks = [];
    let oIndex = 0, aIndex = 0, bIndex = 0;

    const aMatches = longestCommonSubsequence(origin, aValues);
    const bMatches = longestCommonSubsequence(origin, bValues);

    let inc = getChunkInc(origin, aValues, bValues, aMatches, bMatches, oIndex, aIndex, bIndex);
    while (inc !== null) {
        if (inc === 0) {
            // find the end of the chunk
            const chunkStart = getChunkStarts(aMatches, bMatches, origin.length, oIndex);
            if (chunkStart !== null) {
                chunks.push(
                    [[oIndex, chunkStart[0]], [aIndex, chunkStart[1]], [bIndex, chunkStart[2]]]
                );
                // update indexes
                oIndex = chunkStart[0];
                aIndex = chunkStart[1];
                bIndex = chunkStart[2];
            } else {
                break;
            }
        } else {
            // output a stable chunk
            chunks.push(
                [[oIndex, oIndex + inc], [aIndex, aIndex + inc], [bIndex, bIndex + inc]]
            );
            // update indexes
            oIndex = oIndex + inc;
            aIndex = aIndex + inc;
            bIndex = bIndex + inc;
        }

        inc = getChunkInc(origin, aValues, bValues, aMatches, bMatches, oIndex, aIndex, bIndex);
    }

    if (oIndex < origin.length || aIndex < aValues.length || bIndex < bValues.length) {
        chunks.push(
            [[oIndex, origin.length], [aIndex, aValues.length], [bIndex, bValues.length]]
        );
    }
    return chunks;
}

function arraysEqual(a, b) {
    // Checks array element equality, ignoring the empty string
    if (a === b) return true;
    if (a == null || b == null) return false;
  
    for (var i = 0; i < max(a.length, b.length); i++) {
        if (i >= a.length) {
            if (b[i] !== "") return false;
        } else if (i >= b.length) {
            if (a[i] !== "") return false;
        } else {
            if (a[i] === "" || b[i] === "") {
                continue;
            }

            if (a[i] !== b[i]) return false;
        }
    }
    return true;
  }

function stableChunk(origin, aValues, bValues, chunk) {
    let oRange, aRange, bRange;
    [oRange, aRange, bRange] = chunk;

    const aEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), aValues.slice(aRange[0], aRange[1]));
    const bEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), bValues.slice(bRange[0], bRange[1]));
    return (aEqO && bEqO);
}


function changedInA(origin, aValues, bValues, chunk) {
    let oRange, aRange, bRange;
    [oRange, aRange, bRange] = chunk;
    const aEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), aValues.slice(aRange[0], aRange[1]));
    const bEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), bValues.slice(bRange[0], bRange[1]));
    return (!aEqO && bEqO);
}

function changedInB(origin, aValues, bValues, chunk) {
    let oRange, aRange, bRange;
    [oRange, aRange, bRange] = chunk;
    const aEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), aValues.slice(aRange[0], aRange[1]));
    const bEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), bValues.slice(bRange[0], bRange[1]));
    return (aEqO && !bEqO);
}

function conflicting(origin, aValues, bValues, chunk) {
    let oRange, aRange, bRange;
    [oRange, aRange, bRange] = chunk;
    const aEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), aValues.slice(aRange[0], aRange[1]));
    const bEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), bValues.slice(bRange[0], bRange[1]));
    return (!aEqO && !bEqO);
}

function getOut(origin, aValues, bValues, chunks) {

    var out = []
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        let oRange, aRange, bRange;
        [oRange, aRange, bRange] = chunk;
        if (stableChunk(origin, aValues, bValues, chunk) || conflicting(origin, aValues, bValues, chunk)) {
            out.push(
                [origin.slice(oRange[0], oRange[1]), aValues.slice(aRange[0], aRange[1]), bValues.slice(bRange[0], bRange[1])]
            )
        } else if (changedInA(origin, aValues, bValues, chunk)) {
            out.push(
                [aValues.slice(aRange[0], aRange[1]), aValues.slice(aRange[0], aRange[1]), aValues.slice(aRange[0], aRange[1])]
            )
        } else if (changedInB(origin, aValues, bValues, chunk)) {
            out.push(
                [bValues.slice(bRange[0], bRange[1]), bValues.slice(bRange[0], bRange[1]), bValues.slice(bRange[0], bRange[1])]
            )
        } else {
            console.log("Uh oh.... should have been one of the above")
        }
    }
    return out;

}

function diff3(origin, aValues, bValues) {
    const chunks = diff3Chunks(origin, aValues, bValues);
    return getOut(origin, aValues, bValues, chunks)
}

export function diff3Merge(origin, aValues, bValues) {
    const out = diff3(origin, aValues, bValues);
    var merge = [];

    for (let i = 0; i < out.length; i++) {
        // just get origin for now
        merge.push(...out[i][0]);
    }

    return merge;
}

export function diff3Merge2d(origin, aValues, bValues) {
    // First, we're going to match the rows to eachother

    const aMatches = longestCommonSubsequence2d(origin, aValues);
    const bMatches = longestCommonSubsequence2d(origin, bValues);
    const mergedMatches = mergeMatches(aMatches, bMatches, origin.length);

    const output = []


    // Now, we're going to loop over each of the rows and merge them indivigually
    for (let i = 0; i < mergedMatches.length; i++) {
        let aIdx, bIdx;
        [aIdx, bIdx] = mergedMatches[i];

        const mergedRow = diff3Merge(origin[i], aValues[aIdx], bValues[bIdx]);
        output.push(mergedRow);
    }

    return output;
}