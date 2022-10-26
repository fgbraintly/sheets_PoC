import Calls from "./Calls";
import * as dotenv from "dotenv";
import GoogleDrive from "./services/GoogleDrive";
import GoogleSheets from "./services/GoogleSheets";
import SequelizeService from "./services/SequelizeService";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { drive_v3 } from "googleapis";
import FileDistributionEmails from "./FileDistributionEmails";
import FileDistributionCenter from "./FileDistributionCenter";
import { initial } from "lodash";

dotenv.config();

const deleteFiles = async () => {
  const drive = new GoogleDrive();
  const folders = <drive_v3.Schema$File[]>await drive.listFolders();
  if (folders) {
    for (const folder of folders) {
      await drive.deleteFolder(folder);
    }
  }
};
const generateSheetInGoogleDrive = async () => {
  // await deleteFiles();
  const emailService = new FileDistributionEmails();
  const linkBank = new FileDistributionCenter();
  const callService = new Calls();
  const drive = new GoogleDrive();
  const sheets = new GoogleSheets();
  const sequelizeService = new SequelizeService();
  const institutions = await sequelizeService.queryCodes();

  await linkBank.createFile();

  for (const institution of institutions) {
    //Si existe la institucion
    if (institution.name) {
      //Buscamos la carpeta
      let sheetID;
      let folder = await drive.searchFolder(institution.name);
      //Si no existe la carpeta de esa institucion
      if (folder === undefined) {
        //Crea la carpeta
        folder = await drive.createFolder(institution.name);
        //Crea la hoja
        sheetID = await sheets.createFile(institution.code);
        //Mueve la hoja a la carpeta
        await drive.moveFilesToFolder(sheetID, folder);
        //Genera el reporte
        await callService.generateReport(institution.code, sheetID);

        await drive.shareFilesToMultipleEmails(
          emailService.constructPermission(institution.code),
          sheetID,
          true
        );
        await drive.shareFiles(
          "user",
          "services@time2talk.app",
          "reader",
          folder
        );
      } else {
        //Si existe la carpeta
        const file = await drive.getFileByCode(institution.code);

        //Y no existe el archivo lo crea
        if (file === undefined) {
          sheetID = await sheets.createFile(institution.code);
          await callService.generateReport(institution.code, sheetID);
          await drive.moveFilesToFolder(sheetID, folder);
          await drive.shareFilesToMultipleEmails(
            emailService.constructPermission(institution.code),
            sheetID,
            true
          );
          await drive.shareFiles(
            "user",
            "services@time2talk.app",
            "reader",
            folder
          );
        } else {
          //Si existe simplemente updatea el archivo
          await callService.generateReport(
            institution.code,
            file?.id as string,
            true
          );
          await drive.moveFilesToFolder(file?.id as string, folder);
        }
        await drive.shareFiles(
          "user",
          "services@time2talk.app",
          "reader",
          folder
        );
      }
      linkBank.addLink(
        institution.code,
        `=HYPERLINK("https://docs.google.com/spreadsheets/d/${sheetID}","${institution.code}: Link to automated report with calls details and recordings")`
      );
    }
    // institution.name !== null
  }
  await linkBank.updateValues();
};

const createLinkBank = async () => {
  const drive = new GoogleDrive();
  const files = await drive.listFolders();
  console.log(JSON.stringify(files, null, 2));
};

const loggeeameesacosa = async () => {
  const emailService = new FileDistributionEmails();
  const sequelizeService = new SequelizeService();
  const institutions = await sequelizeService.queryCodes();

  for (const institution of institutions) {
    console.log(institution.code);

    console.log(
      JSON.stringify(emailService.constructPermission(institution.code))
    );
  }
};

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  await deleteFiles();
  await generateSheetInGoogleDrive();

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "ok",
    }),
  };
};

// (async () => {
  // const drive = new GoogleDrive();
  // const drives = await drive.listFiles();
  // console.log(JSON.stringify(drives, null, 2));
  // const s = new FileDistributionCenter();
  // await s.share("1rxFXGR4_lU_iiNxc6r7v5fQCSkyRDrQW667a2h-11DA");
//   await deleteFiles();
//   await generateSheetInGoogleDrive();
//   await createLinkBank();
// })();
