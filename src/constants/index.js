// Represents what the taskpane shows, depending on what operation it's performing
export const taskpaneStatus = {
    CREATE: 'create',
    SHARE: 'share',
    MERGE: 'merge',
    OFFLINE: 'offline',
    DEVELOPMENT: 'development',
    DIFF: 'diff'
};

/*
    The states a merge can be in:
    - If the merge is still occuring, it is MERGE_IN_PROGRESS.
    - If the merge succeded and pushed to remote, it is MERGE_SUCCESS.
    - If the merge resolted in merge conflicts, it is MERGE_CONFLICT.
    - If there was an unspecified error in the merge, it is MERGE_ERROR.
    - If the merge succeded but then was unable to push to remote, it is MERGE_FORKED.
*/
export const mergeState = {
    MERGE_IN_PROGRESS: 'merge_in_progress',
    MERGE_SUCCESS: 'merge_success',
    MERGE_CONFLICT: 'merge_conflict',
    MERGE_ERROR: 'merge_error',
    MERGE_FORKED: 'merge_forked'
};


/*
    Given two commit ids, A and B, this enum represents 
    the ways A relates to B:
    - If A == B, then BRANCH_STATE_HEAD.
    - If B can be reached by following parent commit ids of A, then BRANCH_STATE_AHEAD.
    - If A can be reached by following parent commit ids of B, then BRANCH_STATE_BEHIND.
    - If A and B cannot be reached by following parent commit ids of either, then BRANCH_STATE_FORKED.
    - Otherwise, BRANCH_STATE_ERROR.
*/
export const branchState = {
    BRANCH_STATE_HEAD: 'branch_state_head',
    BRANCH_STATE_AHEAD: 'branch_state_ahead',
    BRANCH_STATE_BEHIND: 'branch_state_behind',
    BRANCH_STATE_FORKED: 'branch_state_forked',
    BRANCH_STATE_ERROR: 'branch_state_error'
};

/*
    Named items in the excel sheet
*/
export const item = {
    HEAD: 'HEAD',
    BRANCHES: 'branches',
    COMMITS: 'commits',
    PERSONAL_BRANCH: 'personalBranchName',
    REMOTE_URL: 'remote',
    LAST_CATCH_UP: "lastCatchUp",
    VERSION: "version"
};

/*
    The type of merge conflict
*/
export const conflictType = {
    ROW: 'row',
    CELL: 'cell'
};

/*
    The type of taskpane header
*/
export const headerSize = {
    SMALL: 'small',
    LARGE: "large"
};

/*
    The type of change identified through the diff algorithm
*/
export const changeType = {
    NONE: "None",
    MODIFIED: "Modified",
    INSERTED: "Inserted",
    DELETED: "Deleted"
};

export const TEST_URL = "test_url";
