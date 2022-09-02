import { google, sheets_v4 } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import GoogleAuthentication from "./GoogleAuth";
import { GaxiosResponse,RetryConfig } from "googleapis-common";

class GoogleSheets {
  private auth: GoogleAuth<JSONClient> | null = null;
  private googlesheets: sheets_v4.Sheets | null = null;
  constructor() {
    this.auth = GoogleAuthentication.generateAuth();
    this.googlesheets = google.sheets({ version: "v4", auth: this.auth });
  }

  async createFile(title:string) {
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
      return <string>sheet?.data.spreadsheetId;
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
      return result?.data.values;
    } catch (error) {
      throw new Error("Failed to getValues");
    }
  }

  async updateFile(spreadsheet: string) {
    const resource: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
      spreadsheetId: spreadsheet,
      requestBody: {
        requests: [
          {
            
          },
        ],
        includeSpreadsheetInResponse: true,
      },
    };
    try {
      const results = await this.googlesheets?.spreadsheets.batchUpdate(
        resource
      );
    } catch (error:any) {
      throw new Error('Update file error: ' + <string>error?.message);
    }
  }

  async addSheet(resource: sheets_v4.Params$Resource$Spreadsheets$Batchupdate) {
    try {
      const response = await this.googlesheets?.spreadsheets.batchUpdate(
        resource
      );
      return response?.data.updatedSpreadsheet?.sheets;
    } catch (error:any) {
      throw new Error('Add sheet error: ' + <string>error?.message);
    }
  }

  async getLastSheet(spreadsheetId: string) {
    try {
      const response = await this.googlesheets?.spreadsheets.get({
        spreadsheetId: spreadsheetId,
      });
      return response?.data.sheets?.length;
    } catch (error) {
      throw new Error(JSON.stringify(error, null, 2));
    }
  }

  async writeFile(
    resource: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdate
  ) {
    try {
      const retryConfig : RetryConfig = {
        retryDelay: 31000,
      }
      const result = await this.googlesheets?.spreadsheets.values.batchUpdate(
        resource,{retryConfig:retryConfig}
      );
      result?.config.retryConfig
    } catch (error:any) {
      throw new Error('Write file error: ' + error.message);
    }
  }
}

export default GoogleSheets;
