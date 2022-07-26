"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Calls_1 = __importDefault(require("./Calls"));
const GoogleDrive_1 = __importDefault(require("./GoogleDrive"));
const GoogleSheets_1 = __importDefault(require("./GoogleSheets"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    const sheets = new GoogleSheets_1.default();
    const drive = new GoogleDrive_1.default();
    const calls = new Calls_1.default();
    calls.getCalls("6");
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
}))();
