
export async function getItemRangeValues(context, itemName) {
    const worksheet = context.workbook.worksheets.getItem(`saga`);
    const storedItem = worksheet.names.getItem(itemName);
    storedItem.load(`value`);
    await context.sync();
    const range = worksheet.getRange(storedItem.value);
    range.load("values");
    await context.sync();
    return range.values;
}

export async function getValues(context, sheetName, rangeAddr) {
    const worksheet = context.workbook.worksheets.getItem(sheetName);
    const range = worksheet.getRange(rangeAddr);
    range.load("values");
    await context.sync();
    return range.values;
}

export async function getFormulas(context, sheetName, rangeAddr) {
    const worksheet = context.workbook.worksheets.getItem(sheetName);
    const range = worksheet.getRange(rangeAddr);
    range.load("formulas");
    await context.sync();
    return range.formulas;
}