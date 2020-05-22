import { runOperation } from "./runOperation";
import { item } from "../constants";
/*
    For now, we have some super simple upgrade scripts.
*/

async function upgrade(context) {
    // We get the saga sheet
    const sagaSheet = context.workbook.worksheets.getItem("saga");
    
    //Setup, name range for personal branch identifier
    const lastCatchUpRange = sagaSheet.getRange("A4");
    sagaSheet.names.add(item.LAST_CATCH_UP, lastCatchUpRange);
    lastCatchUpRange.values = [["firstcommit"]];

    await context.sync();
}

export function runUpgrade() {
    runOperation(upgrade);
}