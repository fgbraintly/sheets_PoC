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
const googleapis_1 = require("googleapis");
const GoogleAuth_1 = __importDefault(require("./GoogleAuth"));
class GoogleSheets {
    constructor() {
        this.auth = null;
        this.googlesheets = null;
        this.auth = GoogleAuth_1.default.generateAuth();
        this.googlesheets = googleapis_1.google.sheets({ version: "v4", auth: this.auth });
    }
    createFile(title = "Testing") {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let resource = {
                requestBody: {
                    properties: {
                        title: title,
                    },
                },
                fields: "spreadsheetId",
            };
            try {
                const sheet = yield ((_a = this.googlesheets) === null || _a === void 0 ? void 0 : _a.spreadsheets.create(resource));
                return sheet === null || sheet === void 0 ? void 0 : sheet.data.spreadsheetId;
            }
            catch (error) {
                throw new Error("Failed to create");
            }
        });
    }
    getValues(spreeadsheetId, range) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let resources = {
                spreadsheetId: spreeadsheetId,
                range: range,
            };
            try {
                const result = yield ((_a = this.googlesheets) === null || _a === void 0 ? void 0 : _a.spreadsheets.values.get(resources));
                console.log(JSON.stringify(result, null, 2));
                return result === null || result === void 0 ? void 0 : result.data.values;
            }
            catch (error) {
                throw new Error("Failed to getValues");
            }
        });
    }
}
exports.default = GoogleSheets;
