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
class GoogleDrive {
    constructor() {
        this.auth = null;
        this.drive = null;
        this.auth = GoogleAuth_1.default.generateAuth();
        this.drive = googleapis_1.google.drive({ version: "v3", auth: this.auth });
    }
    moveFilesToFolder(fileId, folderId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let params = {
                fileId: fileId,
                fields: "parents",
            };
            try {
                const file = yield ((_a = this.drive) === null || _a === void 0 ? void 0 : _a.files.get(params));
                //   const prevParents = file?.data?.parents?.map(parent =>  parent)
                console.log(JSON.stringify(file === null || file === void 0 ? void 0 : file.data.parents, null, 2));
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    createFolder(institutionalCode) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let params = {
                requestBody: {
                    mimeType: "application/vnd.google-apps.folder",
                    name: institutionalCode,
                },
                fields: "id",
            };
            try {
                const file = yield ((_a = this.drive) === null || _a === void 0 ? void 0 : _a.files.create(params));
                return file === null || file === void 0 ? void 0 : file.data.id;
            }
            catch (error) {
                throw new Error("Failed to create folder");
            }
        });
    }
    shareFiles(type, emailAddress, role, fileId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let params = {
                requestBody: { type: type, role: role, emailAddress: emailAddress },
                fileId: fileId,
                fields: "id",
            };
            try {
                const res = yield ((_a = this.drive) === null || _a === void 0 ? void 0 : _a.permissions.create(params));
                const fileId = res === null || res === void 0 ? void 0 : res.data.id;
                return fileId;
            }
            catch (err) {
                throw new Error("Failed to share file");
            }
        });
    }
    listFiles() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                pageSize: 10,
                fields: "nextPageToken, files(id, name)",
            };
            const response = yield ((_a = this.drive) === null || _a === void 0 ? void 0 : _a.files.list(params));
            const files = response === null || response === void 0 ? void 0 : response.data.files;
            return files;
        });
    }
    listFolders() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                q: "mimeType = 'application/vnd.google-apps.folder'",
            };
            try {
                const response = yield ((_a = this.drive) === null || _a === void 0 ? void 0 : _a.files.list(params));
                const files = response === null || response === void 0 ? void 0 : response.data.files;
                return files;
            }
            catch (error) {
                throw new Error("Failed to list folders");
            }
        });
    }
    getFile(fileId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const resource = {
                fileId: fileId,
            };
            const response = yield ((_a = this.drive) === null || _a === void 0 ? void 0 : _a.files.get(resource));
            return response === null || response === void 0 ? void 0 : response.data.id;
        });
    }
}
exports.default = GoogleDrive;
