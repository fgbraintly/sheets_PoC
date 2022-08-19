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
const dotenv = __importStar(require("dotenv"));
const GoogleDrive_1 = __importDefault(require("./services/GoogleDrive"));
const GoogleSheets_1 = __importDefault(require("./services/GoogleSheets"));
const SequelizeService_1 = __importDefault(require("./services/SequelizeService"));
dotenv.config();
(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const callService = new Calls_1.default();
    const drive = new GoogleDrive_1.default();
    const sheets = new GoogleSheets_1.default();
    const sequelizeService = new SequelizeService_1.default();
    const institutions = yield sequelizeService.queryCodes();
    for (const institution of institutions) {
        let folder;
        folder = yield drive.searchFolder(institution.name);
        //Si no existe la carpeta de esa institucion
        if (folder === undefined) {
            //Crea la carpeta
            folder = yield drive.createFolder(institution.name);
            //Crea la hoja
            const sheetID = yield sheets.createFile(institution.code);
            //Mueve la hoja a la carpeta
            yield drive.moveFilesToFolder(sheetID, folder);
            //Genera el reporte
            yield callService.generateReport(institution.code, sheetID);
        }
        else {
            //Si existe la carpeta
            const file = yield drive.getFileByCode(institution.code);
            //Y no existe el arrchivo lo crea
            if (file === undefined) {
                const sheetID = yield sheets.createFile(institution.code);
                yield callService.generateReport(institution.code, sheetID);
                yield drive.moveFilesToFolder(sheetID, folder);
            }
            else if (((_a = file.parents) === null || _a === void 0 ? void 0 : _a[0]) !== undefined &&
                ((_b = file.parents) === null || _b === void 0 ? void 0 : _b[0]) === folder) {
                //Si la carpeta es padre del archivo de ese codigo
                //Sobrescribe el reporte
                yield callService.generateReport(institution.code, file === null || file === void 0 ? void 0 : file.id, true);
            }
        }
        // Comparto la carpeta
        yield drive.shareFiles("user", "franco.garancini@braintly.com", "reader", folder);
    }
}))();
