import log from "loglevel";
import prefix from 'loglevel-plugin-prefix';
import { setupAppLogger } from "./components/App";
import { setupMergeLogger } from "../saga/merge";
import { setupSyncLogger } from "../saga/sync";
import { setupCommitLogger } from "../saga/commit";


/*
    We import all the logging setup functions for each file, and we set then up
    in a single move. This is called after the app is initalized.
*/

export function setupLoggers(email, remoteURL) {
    prefix.reg(log);
    log.enableAll();

    setupAppLogger(email, remoteURL);
    setupMergeLogger(email, remoteURL);
    setupSyncLogger(email, remoteURL);
    setupCommitLogger(email, remoteURL);

}

















