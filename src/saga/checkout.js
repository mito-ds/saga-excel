import { getSheetsWithNames, copySheet } from "./sagaUtils";
import Project from './Project';


export async function deleteNonsagaSheets(context) {
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return !sheet.name.startsWith("saga");
    })
    sheets.forEach(sheet => sheet.delete());

    await context.sync();
}

/*
Creates a new commit on the given branch
*/
export async function checkoutBranch(context, branch) {
    // TODO: don't let ppl check out if there are changed sheets!
    const project = new Project(context);

    // Only let people checkout branches that exist
    const branchExists = await project.checkBranchExists(branch);
    if (!branchExists) {
        console.error(`Cannot checkout ${branch} as it does not exist.`);
        return;
    }

    // Find the commit for a branch
    const commitID = await project.getCommitIDFromBranch(branch);

    // Find those sheets that we should copy back
    let sheets = await getSheetsWithNames(context);
    sheets = sheets.filter(sheet => {
        return sheet.name.startsWith(`saga-${commitID}-`)
    })

    // Delete the non-saga sheets
    await deleteNonsagaSheets(context);

    // Copy back the sheets
    for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        const newName = sheet.name.split(`saga-${commitID}-`)[1];
        await copySheet(
            context, 
            sheet.name, 
            newName, 
            Excel.WorksheetPositionType.beginning, //TODO: we have to store og location
            Excel.SheetVisibility.visible
        );
    }

    // Finially, update the head branch
    const headRange = await project.getHeadRange();
    headRange.values = [[branch]];

    await context.sync();
}

export async function runCheckoutBranch(branch) {
    try {
      await Excel.run(async context => {
          await checkoutBranch(context, branch);
      });
    } catch (error) {
      console.error(error);
      if (error instanceof OfficeExtension.Error) {
          console.error(error.debugInfo);
      }
    }
  }