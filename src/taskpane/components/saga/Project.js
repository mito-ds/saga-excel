import { updateMetadataItem } from "./sagaUtils";
import axios from 'axios';



export default class Project {
    constructor(context) {
        this.context = context;
    }

    getBranchRange = async () => {
        console.log("CONTEXT:", this.context)
        const worksheet = this.context.workbook.worksheets.getItem(`saga`);
        const branchItem = worksheet.names.getItem(`branches`);
        branchItem.load(`value`);
        await this.context.sync();
        return worksheet.getRange(branchItem.value);
    }
    
    getBranchRangeWithValues = async () => {
        const branchRange = await this.getBranchRange(this.context);
        branchRange.load("values");
        await this.context.sync();
        return branchRange;
    }

    getHeadRange = async () => {
        const worksheet = this.context.workbook.worksheets.getItem(`saga`);
        const headItem = worksheet.names.getItem(`HEAD`);
        headItem.load(`value`);
        await this.context.sync();
        // Uh, i dont' know why, but have to call this twice sometimes???
        // TODO: figure out why, lol
        headItem.load(`value`);
        await this.context.sync();

        console.log(headItem);
        return worksheet.getRange(headItem.value);
    }

    getHeadRangeWithValues = async () => {
        const headRange = await this.getHeadRange(this.context);
        headRange.load("values");
        await this.context.sync();
        console.log(headRange);
        return headRange;
    }

    getCommitRange = async () => {
        const worksheet = this.context.workbook.worksheets.getItem(`saga`);
        const commitItem = worksheet.names.getItem(`commits`);
        commitItem.load(`value`);
        await this.context.sync();
        return worksheet.getRange(commitItem.value);
    }

    getCommitRangeWithValues = async () => {
        const commitRange = await this.getCommitRange(this.context);
        commitRange.load("values");
        commitRange.load("address");
        commitRange.load("rowCount")
        await this.context.sync();
        return commitRange;
    }

    getRemoteRange = async () => {
        const worksheet = this.context.workbook.worksheets.getItem(`saga`);
        const remoteItem = worksheet.names.getItem(`remote`);
        remoteItem.load(`value`);
        await this.context.sync();
        return worksheet.getRange(remoteItem.value);
    }

    getRemoteRangeWithValues = async () => {
        const remoteRange = await this.getRemoteRange(this.context);
        remoteRange.load("values");
        remoteRange.load("address");
        remoteRange.load("rowCount")
        await this.context.sync();
        return remoteRange;
    }

    getRemoteURL = async () => {
        const remoteRange = await this.getRemoteRangeWithValues(this.context);
        return remoteRange.values[0][0];
    }

    /*
    An instance for interacting with the remote branch
    */
    getAxios = async () => {
        // TODO: we probably wanna replace this with a "remote" object!
        const remoteURL = await this.getRemoteURL();
        const instance = axios.create({
            baseURL: remoteURL
        });
        return instance;
    }


    /*
    Returns the branch in the HEAD variable
    */
    getHeadBranch = async () => {
        const headRange = await this.getHeadRangeWithValues(this.context);
        return headRange.values[0][0];
    }


    /*
    Gets the commit ID for a given branch name, 
    returns null? if the branch does not exist, 
    and "" if the branch has no previous commits on it
    */
    getCommitIDFromBranch = async (branch) => {
        const branchRange = await this.getBranchRangeWithValues(this.context);
        
        const row = branchRange.values.find(row => {
            return row[0] === branch;
        })

        if (!row) {
            return null;
        }
        return row[1];
    }

    /*
    Gets the commit ID for a given branch name, 
    returns null? if the branch does not exist, 
    and "" if the branch has no previous commits on it
    */
    getParentCommitID = async (commitID) => {
        const commitRange = await this.getCommitRangeWithValues(this.context);

        const row = commitRange.values.find(row => {
            return row[0] === commitID;
        })

        if (!row) {
            return null;
        }
        return row[1];
    }


    /*
    Returns the branch in the HEAD variable
    */
    updateBranchCommitID = async (branch, commitID) => {
        const branchRange = await this.getBranchRangeWithValues(this.context);

        const newBranches = branchRange.values.map(row => {
            if (row[0] === branch) {
                return [branch, commitID];
            }
            return row;
        })

        branchRange.values = newBranches;

        return this.context.sync();
    }



    // Inserts a single row directly below range (which must be same # of cols as range)
    // Returns the new range including these values
    insertRowBelowRange = async (range, values) => {
        
        // Make sure row count and address are defined
        range.load("rowCount");
        range.load("address");
        await this.context.sync();

        // TODO: handle cases where "!" or ":" is in the sheet name 
        const [sheetName, address] = range.address.split(`!`)
        const [addTopRight, addBotLeft] = address.split(`:`)
        const topRightCol = addTopRight.match(`[A-Z]+`)[0];
        const topRightRow = addTopRight.match(`[0-9]+`)[0];
        const botLeftCol = addBotLeft.match(`[A-Z]+`)[0];
        const botLeftRow = addBotLeft.match(`[0-9]+`)[0];

        const worksheet = this.context.workbook.worksheets.getItem(sheetName);

        // Now, we actually insert the column
        const nextRow = parseInt(botLeftRow) + 1;
        const rowInsertAddress = `${sheetName}!${topRightCol}${nextRow}:${botLeftCol}${nextRow}`;
        const rowInsertRange = worksheet.getRange(rowInsertAddress);
        rowInsertRange.values = values;

        // We then return a new range that represents the old range union new row
        
        const newRangeAddress = `${sheetName}!${topRightCol}${topRightRow}:${botLeftCol}${nextRow}`;
        const newRange = worksheet.getRange(newRangeAddress);

        await this.context.sync();

        return newRange;
    }


    /*
    TODO
    */
    addCommitID = async (commitID, parentID, commitName, commitMessage) => {
        const commitRange = await this.getCommitRangeWithValues(this.context);

        // Insert the values into the sheet
        const newRange = await this.insertRowBelowRange(commitRange, [[commitID, parentID, commitName, commitMessage]]);

        await updateMetadataItem(this.context, `commits`, newRange);
    }

    checkBranchExists = async (branch) => {
        const branchRange = await this.getBranchRangeWithValues();
        return branchRange.values.some(row => row[0] === branch);
    }

    /*
    Returns true if CommitID exists; false otherwise
    */
    checkCommitIDExists = async (commitID) => {    
        //Get the Commit Worksheet
        const commitRange = await this.getCommitRangeWithValues();
        return commitRange.values.some(row => row[0] === commitID);
    }
}

