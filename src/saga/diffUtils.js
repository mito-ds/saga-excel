
// Find sheets in final sheets and not in initial sheets
export function findInsertedSheets(initialSheets, finalSheets) {
    const insertedSheets = finalSheets.filter(sheet => {
        return !(sheet in initialSheets)
    })
    return insertedSheets
} 

// Find sheets in initial sheets and not in final sheets
export function findDeletedSheets(initialSheets, finalSheets) {
    const deletedSheets = initialSheets.filter(sheet => {
        return !(sheet in finalSheets)
    })
    return deletedSheets
} 

export function removePrefix(initialCommitSheets, initialCommitPrefix) {
    return initialCommitSheets.map(sheet => sheet.replace(initialCommitPrefix, ""))
}
