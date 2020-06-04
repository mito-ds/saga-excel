import * as mulitplayer from "../scenarios/multiplayer";
import { runReplaceFromBase64 } from "../../saga/create";




export async function simpleTests() {
    // First, we set up the basic scenario
    const simple = mulitplayer.simple;
    await runReplaceFromBase64(simple.fileContents);


    // Then, we call the next step function






    // Then, we call sync




}