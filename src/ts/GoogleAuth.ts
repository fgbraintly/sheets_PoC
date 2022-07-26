import { google } from "googleapis";
import { GoogleAuth, GoogleAuthOptions } from "google-auth-library";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";

class GoogleAuthentication {
  private auth: GoogleAuth<JSONClient> | null = null;
  private static authParams: GoogleAuthOptions<JSONClient> = {
    keyFile: "./src/json/credentials.json",
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  };

  static generateAuth() {
    return new GoogleAuth(this.authParams);
  }
}

export default GoogleAuthentication;