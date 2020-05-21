// Find sheets that are in the final Sheet set, but not the initial Sheet set
export function findInsertedSheets(initialSheetNames, finalSheetNames) {
    const insertedSheetNames = finalSheetNames.filter(sheetName => {
        return !(initialSheetNames.includes(sheetName));
    });
    return insertedSheetNames;
} 

// Find sheets in initial sheets and not in final sheets
export function findDeletedSheets(initialSheetNames, finalSheetNames) {
    const deletedSheetNames = initialSheetNames.filter(sheetName => {
        return !(finalSheetNames.includes(sheetName));
    });
    return deletedSheetNames;
} 

// Find sheets in both initial sheet and final sheets
export function findModifiedSheets(initialSheetNames, finalSheetNames) {
    var modifiedSheetNames = initialSheetNames.filter(function(sheetName) {
        if(finalSheetNames.indexOf(sheetName) != -1)
            return true;
    });
    return modifiedSheetNames;
}

export function removePrefix(initialCommitSheets, initialCommitPrefix) {
    const sheetNames = initialCommitSheets.map(function(sheet) { 
        return sheet.name.replace(initialCommitPrefix, ""); 
    });
    return sheetNames;
}

export function getSheetNamePairs(sheetNames, initialPrefix, finalPrefix) {
    var sheetPairs = [];
    for (var i = 0; i < sheetNames.length; i++) {
        sheetPairs.push({
            sheetName: sheetNames[i],
            initialSheet: initialPrefix + sheetNames[i], 
            finalSheet: finalPrefix + sheetNames[i]
        });
    }
    return sheetPairs;
}
