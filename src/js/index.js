"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
(() => __awaiter(void 0, void 0, void 0, function* () {
    const sheets = new GoogleSheets_1.default();
    const drive = new GoogleDrive_1.default();
    const calls = new Calls_1.default();
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
}))();
