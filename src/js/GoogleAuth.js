"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
class GoogleAuthentication {
    constructor() {
        this.auth = null;
    }
    static generateAuth() {
        return new google_auth_library_1.GoogleAuth(this.authParams);
    }
}
GoogleAuthentication.authParams = {
    keyFile: "./src/json/credentials.json",
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ],
};
exports.default = GoogleAuthentication;
