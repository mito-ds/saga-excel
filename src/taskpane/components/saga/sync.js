import $ from "jquery";
import Project from "./Project"


async function postData(url, data) {
    // Default options are marked with *
  
    const response = await $.ajax({
      type: "POST",
      url: url,
      contentType: "application/json",
      data: JSON.stringify(data)
    }).promise();
    return response;
  }
  
  async function getData(url, data) {
    // Default options are marked with *
    console.log(JSON.stringify(data));
  
    const response = await $.ajax({
      type: "GET",
      url: url,
      data: data
    }).promise();
    return response;
  }

export async function updateShared(context) {
    const project = new Project(context);
    const headBranch = await project.getHeadBranch();
    const headCommitID = await project.getCommitIDFromBranch(headBranch);
    const parentCommitID = await project.getParentCommitID(headCommitID);

    const url = (await project.getRemoteURL()).replace("project", "checkhead");
    console.log(url)

    const response = await getData(url, {headCommitId: headCommitID, parentCommitID: parentCommitID});

    


    console.log(response);
}