import { google, sheets_v4 } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import GoogleAuthentication from "./GoogleAuth";
import { GaxiosResponse } from "googleapis-common";

class GoogleSheets {
  private auth: GoogleAuth<JSONClient> | null = null;
  private googlesheets: sheets_v4.Sheets | null = null;
  constructor() {
    this.auth = GoogleAuthentication.generateAuth();
    this.googlesheets = google.sheets({ version: "v4", auth: this.auth });
  }

  async createFile(title = "Testing") {
    let resource: sheets_v4.Params$Resource$Spreadsheets$Create = {
      requestBody: {
        properties: {
          title: title,
        },
      },
      fields: "spreadsheetId",
    };

    try {
      const sheet: GaxiosResponse<sheets_v4.Schema$Spreadsheet> | undefined =
        await this.googlesheets?.spreadsheets.create(resource);
      return sheet?.data.spreadsheetId;
    } catch (error) {
      throw new Error("Failed to create");
    }
  }

  async getValues(spreeadsheetId: string, range: any) {
    let resources: sheets_v4.Params$Resource$Spreadsheets$Values$Get = {
      spreadsheetId: spreeadsheetId,
      range: range,
    };
    try {
      const result = await this.googlesheets?.spreadsheets.values.get(
        resources
      );
      console.log(JSON.stringify(result, null, 2));
      return result?.data.values;
    } catch (error) {
      throw new Error("Failed to getValues");
    }
  }
}

export default GoogleSheets;