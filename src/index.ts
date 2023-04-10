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
import { write, writeFile } from "fs";
import { Institution } from "./types/Institution";
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
const generateSheetInGoogleDrive = async (institution: Institution) => {
  const linkBank = new FileDistributionCenter();
  const callService = new Calls();
  const drive = new GoogleDrive();
  const sheets = new GoogleSheets();
  let excent = [
    "GILSP2B",
    "JAGUARSIND",
    "CCPL2022A",
    "AKRONA1",
    "BWU30122",
    "BWU27022",
    "SP141122",
    "SP201CC",
    "UASP10222",
    "UAC22",
    "EFSCF22",
    "DOUBLET2T",
    "SP3HJAG",
    "22TC1011",
    "22TRICSP12",
    "TC2010",
    "TC2411",
    "UALKCP",
    "REBECCA22",
    "JLSMBG",
    "FNDWVB",
    "UBXDDT",
    "ABRAHAM",
    "LILLIAN",
    "30MINBW",
    "EXTRA270",
    "IND22JAG",
    "YHPMVK",
    "CALLY",
    "ROSACLASS",
    "OLICLASS",
  ];

  console.log(institution.code);
  //Si existe la institucion
  if (excent.includes(institution.code)) {
    linkBank.addLink(institution.code, "disabled");
    return;
  }

  //Crea la hoja
  let sheetID = await sheets.createFile(institution.code);
  //Genera el reporte
  await callService.generateReport(institution.code, sheetID);
  //Comparte el reporte
  await drive.shareFiles("anyone", "services@time2talk.app", "reader", sheetID);
};

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "ok",
      misc:event.body
    }),
  };
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

// (async () => {
// const drive = new GoogleDrive();
// const regular = [
//   "SUHSSP3",
//   "ASHSP5",
//   "DCAP22",
//   "UOTJQD",
//   "AGRMQZ",
//   "MARTHA3",
//   "RDSP4A",
//   "EDWSP2",
//   "GSAP23",
//   "BZMEON",
//   "TEAM1",
// ];
// for (let i = 0; i < regular.length; i++) {
//   const link = await drive.getFileByCode(regular[i]);
//   console.log("🚀 ~ file: index.ts:224 ~ regular[i]:", regular[i])
//   console.log("🚀 ~ file: index.ts:224 ~ link:", link)
//   // console.log("🚀 ~ file: index.ts:224 ~ link:", `https://docs.google.com/spreadsheets/d/${link.id}`)
// }
// await drive.deleteFolder({id:"165Jo8G1OHe05Br-NMCbWIO0Xi8b30rIPqS0Mol1mvl0"})
// await drive.deleteFolder({id:"1b1IPAwXfIMOphVqpul9McYN0qOWt6t_8_numzvEL4fY"})
// const drives = await drive.searchFile("LinkBankManual");
// console.log(JSON.stringify(drives, null, 2));
// const s = new FileDistributionCenter();
// await s.share("1f7lDTUw7VdcepOJnpUPhaDh5iyVwxWeHXA_DOr7nUHk");
// await deleteFiles();
// await generateSheetInGoogleDrive();
// await createLinkBank();
// })();

//165Jo8G1OHe05Br-NMCbWIO0Xi8b30rIPqS0Mol1mvl0
//1b1IPAwXfIMOphVqpul9McYN0qOWt6t_8_numzvEL4fY
