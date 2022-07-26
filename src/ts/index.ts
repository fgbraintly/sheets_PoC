import Calls from "./Calls";
import GoogleDrive from "./GoogleDrive";
import GoogleSheets from "./GoogleSheets";
import * as dotenv from "dotenv";

dotenv.config();

(async () => {

  const sheets = new GoogleSheets();
  const drive = new GoogleDrive();

  const calls = new Calls();

  // await calls.getCalls("6");
  // let folder = (await drive.createFolder("CLLPESTR")) || "";
  // let folderList = await drive.listFolders();

  // folderList?.map(async (folder) => {
  //   let reGetFolder = await drive.getFile(String(folder?.id));
  //   let sharedFolder = await drive.shareFiles(
  //     "user",
  //     "franco.garancini@braintly.com",
  //     "reader",
  //     String(folder?.id)
  //   );
  //   console.log(`GetFile: ${reGetFolder}`);
  // });

  // console.log(`Folder List ${JSON.stringify(folderList, null, 2)}`);

  // let file = (await sheets.createFile("Testing from index")) || "";

  // if (file != "") {
  //   const share = await drive.shareFiles(
  //     "user",
  //     "franco.garancini@braintly.com",
  //     "reader",
  //     file
  //   );

  //   console.log(share);

  // }
})();
