# Saga Excel Addin

This repository contains the source code for the Saga Excel Add-in. Saga allows your team to collaborate on spreadsheets without forcing everyone to make edits on the same live document. Make your edits in a private workspace, and share them with your team when you're ready.

## Installation

Installation instructions can be found on [our website](https://sagacollab.com).

## Running the Add-in

If you want to run the add-in from source:
```
git clone https://github.com/saga-vcs/saga-excel.git;
cd saga-excel;
npm install;
npm start;
```
Please note that you must have excel installed for this to function. 

If that doesn't work, you can follow more detailed instructions:
- on a Mac, look [here](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-an-office-add-in-on-ipad-and-mac)
- on Windows, look [here](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins)
- on Office 365 (the online Excel editor), look [here](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing) 


## Debugging the addin

If you're running the addin on Office 365 in a web browser, simply inspecting element on the addin will give you access to all the normal JavaScript debugging tools. 

If you're running the addin on a local copy of Excel on Mac, then you can find directions for debugging the addin [here](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/debug-office-add-ins-on-ipad-and-mac).

Instructions for debugging on Windows can be found [here](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/attach-debugger-from-task-pane) and [here](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/debug-add-ins-using-f12-developer-tools-on-windows-10).
