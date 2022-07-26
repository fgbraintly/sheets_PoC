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
const HttpService_1 = __importDefault(require("./HttpService"));
class Calls {
    constructor() {
        this.firstName = "";
        this.lastName = "";
        this.totalTimeSpoken = "";
        this.coach = "";
        this.date = "";
        this.recordingUrl = "";
        this.axios = null;
    }
    getCalls(_institutionId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.axios = yield new HttpService_1.default().httpApi();
            try {
                const response = yield this.axios.request({
                    method: "GET",
                    url: "/api/app/backoffice/calls",
                    params: {
                        institution_id: _institutionId,
                    },
                });
                const calls = response === null || response === void 0 ? void 0 : response.data;
            }
            catch (error) {
                throw new Error("Failed to fetch calls");
            }
        });
    }
}
exports.default = Calls;
