import GoogleDrive from "./GoogleDrive";
import GoogleSheets from "./GoogleSheets";

(async () => {
  const sheets = new GoogleSheets();
  const drive = new GoogleDrive();
  let file = (await sheets.createFile("Testing from index")) || "";

  if (file != "") {
    const share = await drive.shareFiles(
      "user",
      "franco.garancini@braintly.com",
      "reader",
      file
    );

    console.log(share);
    
  }
})();
