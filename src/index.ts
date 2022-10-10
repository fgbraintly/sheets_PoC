import Calls from "./Calls";
import * as dotenv from "dotenv";
import GoogleDrive from "./services/GoogleDrive";
import GoogleSheets from "./services/GoogleSheets";
import SequelizeService from "./services/SequelizeService";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { drive_v3 } from "googleapis";

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
  const callService = new Calls();
  const drive = new GoogleDrive();
  const sheets = new GoogleSheets();
  const sequelizeService = new SequelizeService();
  const institutions = await sequelizeService.queryCodes();

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
        } else {
          //Si existe simplemente updatea el archivo
          await callService.generateReport(
            institution.code,
            <string>file?.id,
            true
          );
          await drive.moveFilesToFolder(<string>file?.id, folder);
        }
        await drive.shareFiles(
          "user",
          "services@time2talk.app",
          "reader",
          folder
        );
      }
    }
    // institution.name !== null
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
//   await deleteFiles();
//   await generateSheetInGoogleDrive();
// })();
