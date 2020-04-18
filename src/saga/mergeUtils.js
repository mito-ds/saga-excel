import {longestCommonSubsequence, longestCommonSubsequence2d} from "./lcs";


function getChunkInc(origin, aValues, bValues, aMatches, bMatches, oIndex, aIndex, bIndex) {

    const mergedMatches = mergeMatches(aMatches, bMatches, origin.length);

    if (mergedMatches.length === 0) {
        return null;
    }

    // We want to find the first index i, such that either it's not matched, or 
    // it's matched to a non-consecutive thing.

    for (let i = oIndex; i < mergedMatches.length; i++) {
        let [aIdx, bIdx] = mergedMatches[i];
        let increment = i - oIndex;
        if (aIdx === null || bIdx === null) {
            return increment;
        }
        if (aIdx !== aIndex + increment || bIdx !== bIndex + increment) {
            return increment;
        }
    }

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

function diff3Chunks(origin, aValues, bValues, dimension) {
    let chunks = [];
    let oIndex = 0, aIndex = 0, bIndex = 0;

    let aMatches, bMatches;
    if (dimension === 1) {
        aMatches = longestCommonSubsequence(origin, aValues);
        bMatches = longestCommonSubsequence(origin, bValues);
    } else if (dimension === 2) {
        aMatches = longestCommonSubsequence2d(origin, aValues);
        bMatches = longestCommonSubsequence2d(origin, bValues);
    }

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

function arraysEqual(a, b, dimension) {
    if (a === b) return true;
    if (a == null || b == null) return false;

    if (dimension === 1) {      
        /*
        In the case where we are comparing two arrays, we ignore
        empty things. If the arrays only differ at places where 
        there are empty strings, than we consider them equal. 
        */ 
        for (var i = 0; i < Math.max(a.length, b.length); i++) {
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
    } else if (dimension == 2) {
        /*
        If these arrays have subarrays, then we recurse and compare each of these 
        sub-arrays.
        */

        if (a.length !== b.length) {
            return false;
        }

        for (let i = 0; i < a.length; i++) {
            if (!arraysEqual(a[i], b[i], 1)) {
                return false;
            }
        }
        return true;


        // TODO: the above equivalent for ignoring empty strings, for ignoring empty subarrays?
    }
    
  }

function stableChunk(origin, aValues, bValues, chunk, dimension) {
    let oRange, aRange, bRange;
    [oRange, aRange, bRange] = chunk;

    const aEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), aValues.slice(aRange[0], aRange[1]), dimension);
    const bEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), bValues.slice(bRange[0], bRange[1]), dimension);
    return (aEqO && bEqO);
}


function changedInA(origin, aValues, bValues, chunk, dimension) {
    let oRange, aRange, bRange;
    [oRange, aRange, bRange] = chunk;
    const aEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), aValues.slice(aRange[0], aRange[1]), dimension);
    const bEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), bValues.slice(bRange[0], bRange[1]), dimension);
    return (!aEqO && bEqO);
}

function changedInB(origin, aValues, bValues, chunk, dimension) {
    let oRange, aRange, bRange;
    [oRange, aRange, bRange] = chunk;
    const aEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), aValues.slice(aRange[0], aRange[1]), dimension);
    const bEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), bValues.slice(bRange[0], bRange[1]), dimension);
    return (aEqO && !bEqO);
}

function conflicting(origin, aValues, bValues, chunk, dimension) {
    let oRange, aRange, bRange;
    [oRange, aRange, bRange] = chunk;
    const aEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), aValues.slice(aRange[0], aRange[1]), dimension);
    const bEqO = arraysEqual(origin.slice(oRange[0], oRange[1]), bValues.slice(bRange[0], bRange[1]), dimension);
    return (!aEqO && !bEqO);
}

function zipLongest(o, a, b) {
    const maxLength = Math.max(o.length, a.length, b.length);
    var output = Array.from({length: maxLength}, e => Array(3).fill(null));
    for (let i = 0; i < o.length; i++) {
        output[i][0] = o[i];
    }
    for (let i = 0; i < a.length; i++) {
        output[i][1] = a[i];
    }
    for (let i = 0; i < b.length; i++) {
        output[i][2] = b[i];
    }
    return output;
}

function getOut(origin, aValues, bValues, chunks, dimension) {

    var out = []
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        let oRange, aRange, bRange;
        [oRange, aRange, bRange] = chunk;
        if (stableChunk(origin, aValues, bValues, chunk, dimension)) {
            out.push(
                [origin.slice(oRange[0], oRange[1]), aValues.slice(aRange[0], aRange[1]), bValues.slice(bRange[0], bRange[1])]
            )
        } else if (conflicting(origin, aValues, bValues, chunk, dimension)) {
            /*
            If the arrays are conflicting, and there are subarrays then we try and
            merge those.
            */
            if (dimension === 1)  {
                out.push(
                    [origin.slice(oRange[0], oRange[1]), aValues.slice(aRange[0], aRange[1]), bValues.slice(bRange[0], bRange[1])]
                )
            } else if (dimension === 2) {
                // TODO: maybe there's an LCS thing we should do here
                const oSlice = origin.slice(oRange[0], oRange[1]);
                const aSlice = aValues.slice(aRange[0], aRange[1]);
                const bSlice = bValues.slice(bRange[0], bRange[1]);
                const zippedSlices = zipLongest(oSlice, aSlice, bSlice);
                const recursiveMerge = [];
                zippedSlices.forEach(slices => {
                    recursiveMerge.push(
                        diff3Merge(slices[0], slices[1], slices[2])
                    );
                });

                out.push(
                    [recursiveMerge, recursiveMerge, recursiveMerge]
                )
            }

        } else if (changedInA(origin, aValues, bValues, chunk, dimension)) {
            out.push(
                [aValues.slice(aRange[0], aRange[1]), aValues.slice(aRange[0], aRange[1]), aValues.slice(aRange[0], aRange[1])]
            )
        } else if (changedInB(origin, aValues, bValues, chunk, dimension)) {

            out.push(
                [bValues.slice(bRange[0], bRange[1]), bValues.slice(bRange[0], bRange[1]), bValues.slice(bRange[0], bRange[1])]
            )
        } else {
            console.log("Uh oh.... should have been one of the above")
        }
    }
    return out;

}

function diff3(origin, aValues, bValues, dimension) {

    // TODO: fix this, it's wildly broken
    if (!aValues || !bValues ) {
        return !origin ? [] : origin;
    }

    const chunks = diff3Chunks(origin, aValues, bValues, dimension);
    return getOut(origin, aValues, bValues, chunks, dimension)
}

export function diff3Merge(origin, aValues, bValues) {
    const out = diff3(origin, aValues, bValues, 1);
    var merge = [];

    for (let i = 0; i < out.length; i++) {
        // just get origin for now
        merge.push(...out[i][0]);
    }

    return merge;
}

export function diff3Merge2d(origin, aValues, bValues) {
    console.log("MERGING")
    console.log(origin, aValues, bValues);
    const out = diff3(origin, aValues, bValues, 2);
    var merge = [];

    for (let i = 0; i < out.length; i++) {
        // just get origin for now
        merge.push(...out[i][1]);
    }

    return merge;
}
