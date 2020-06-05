import * as mulitplayer from "../scenarios/multiplayer";
import { runReplaceFromBase64 } from "../../saga/create";
import { nextSyncStep } from "../testHelpers";

export async function simpleTests() {
    // First, we set up the basic scenario
    const simple = mulitplayer.simple;
    await runReplaceFromBase64(simple.fileContents);

    await new Promise(resolve => setTimeout(resolve, 20000));

    let currStep = 0;
    // Then, we call the next step function
    currStep = await nextSyncStep(simple, currStep);
    console.log("Uh, done");

    await new Promise(resolve => setTimeout(resolve, 20000));










    // Then, we call sync




}