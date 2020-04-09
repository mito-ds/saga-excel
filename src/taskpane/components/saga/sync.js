import Project from "./Project"

export async function updateShared(context) {
    const project = new Project(context);
    const headBranch = await project.getHeadBranch();
    const headCommitID = await project.getCommitIDFromBranch(headBranch);
    const parentCommitID = await project.getParentCommitID(headCommitID);

    const axios = await project.getAxios();

    const reponse = await axios.request({
      url: "/checkhead",
      params: {
        headCommitID: headCommitID,
        parentCommitID: parentCommitID
      },
    })

    console.log(response)
}