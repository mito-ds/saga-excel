//TODO: Redo this using filters, find out why below approach did not work

// Find sheets that are in the final Sheet set, but not the initial Sheet set
export function findInsertedSheets(initialSheets, finalSheets) {
    let insertedSheets = []
    for (var i = 0; i < finalSheets.length; i++) {
        let found = false
        for (var j = 0; j < initialSheets.length; j++) {
            if (finalSheets[i] === initialSheets[j]) {
                found = true;
            }
        }
        if (!found) {
            insertedSheets.push(finalSheets[i])
        }
    }
    return insertedSheets
} 

// Find sheets that are in the initial Sheet set, but not the final Sheet set
export function findDeletedSheets(initialSheets, finalSheets) {
    let deletedSheets = []
    for (var i = 0; i < initialSheets.length; i++) {
        let found = false
        for (var j = 0; j < finalSheets.length; j++) {
            if (initialSheets[i] === finalSheets[j]) {
                found = true;
            }
        }
        if (!found) {
            deletedSheets.push(initialSheets[i])
        }
    }
    return deletedSheets
} 

export function findModifiedSheets(initialSheets, finalSheets) {
    let modifiedSheets = []
    for (var i = 0; i < initialSheets.length; i++) {
        let found = false
        for (var j = 0; j < finalSheets.length; j++) {
            if (initialSheets[i] === finalSheets[j]) {
                found = true;
                continue;
            }
        }
        if (found) {
            modifiedSheets.push(initialSheets[i])
        }
    }
    return modifiedSheets
}

/*
// Find sheets in initial sheets and not in final sheets
// TODO: Find out why this approach does not work
export function findDeletedSheets(initialSheets, finalSheets) {
    const deletedSheets = initialSheets.filter(sheet => {
        return !(sheet in finalSheets)
    })
    return deletedSheets
} 
*/
export function removePrefix(initialCommitSheets, initialCommitPrefix) {
    // TODO: Update to a map function
    for (var i = 0; i < initialCommitSheets.length; i++) {
        initialCommitSheets[i] = initialCommitSheets[i].name.replace(initialCommitPrefix, "")
    }
    return initialCommitSheets
}

export function addPrefix(sheetNames, initialPrefix, finalPrefix) {
    var sheetPairs = []
    for (var i = 0; i < sheetNames.length; i++) {
        sheetPairs.push({
            initialSheet: initialPrefix + sheetNames[i],
            finalSheet: finalPrefix + sheetNames[i]
        })
    }
    return sheetPairs
}
