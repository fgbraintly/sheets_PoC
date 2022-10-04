import { google, sheets_v4 } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import GoogleAuthentication from "./GoogleAuth";
import { GaxiosResponse, RetryConfig } from "googleapis-common";

class GoogleSheets {
  private auth: GoogleAuth<JSONClient> | null = null;
  private googlesheets: sheets_v4.Sheets | null = null;
  constructor() {
    this.auth = GoogleAuthentication.generateAuth();
    this.googlesheets = google.sheets({ version: "v4", auth: this.auth });
  }

  async createFile(title: string) {
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
        await this.googlesheets?.spreadsheets.create(resource, {
          retryConfig: { retry: 61000 },
        });
      return <string>sheet?.data.spreadsheetId;
    } catch (error: any) {
      throw new Error("Failed to create" + error.message);
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

  addFormatOnTotalSesions() {
    const request: sheets_v4.Schema$Request[] = [
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 2,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "CENTER",
              textFormat: {
                fontSize: 12,
                bold: true,
              },
            },
          },
          fields: "userEnteredFormat(textFormat,horizontalAlignment)",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startColumnIndex: 0,
            endColumnIndex: 4,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                blue: 1.0,
                red: 0.5,
                green: 0.7,
                alpha: 1.0,
              },
            },
          },
          fields: "userEnteredFormat(backgroundColor)",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 1,
            startColumnIndex: 3,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "CENTER",
            },
          },
          fields: "userEnteredFormat(horizontalAlignment)",
        },
      },
      {
        updateSheetProperties: {
          properties: {
            sheetId: 0,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          fields: "gridProperties.frozenRowCount",
        },
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: "ROWS",
            startIndex: 0,
            endIndex: 0,
          },
          properties: {
            pixelSize: 200,
          },
          fields: "pixelSize",
        },
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: "COLUMNS",
            startIndex: 0,
          },
          properties: {
            pixelSize: 150,
          },
          fields: "pixelSize",
        },
      },
    ];
    return request;
  }

  async updateFile(spreadsheet: string, format?: sheets_v4.Schema$Request[]) {
    let formatRule: sheets_v4.Schema$Request[] = this.addFormatOnTotalSesions();
    if (format?.length) {
      formatRule.push(...format);
    }

    const resource: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
      spreadsheetId: spreadsheet,
      requestBody: {
        requests: formatRule,
      },
    };
    try {
      const results = await this.googlesheets?.spreadsheets.batchUpdate(
        resource,
        {
          retryConfig: {
            retryDelay: 121000,
          },
        }
      );
    } catch (error: any) {
      throw new Error("Update file error: " + <string>error?.message);
    }
  }

  async addSheet(resource: sheets_v4.Params$Resource$Spreadsheets$Batchupdate) {
    try {
      const response = await this.googlesheets?.spreadsheets.batchUpdate(
        resource,
        {
          retryConfig: {
            retryDelay: 121000,
          },
        }
      );
      return response?.data.updatedSpreadsheet?.sheets;
    } catch (error: any) {
      throw new Error("Add sheet error: " + <string>error?.message);
    }
  }

  async getLastSheet(spreadsheetId: string) {
    try {
      const response = await this.googlesheets?.spreadsheets.get({
        spreadsheetId: spreadsheetId,
      });
      return response?.data.sheets?.length;
    } catch (error: any) {
      throw new Error("Get last sheet" + error.message);
    }
  }

  async writeFile(
    resource: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdate
  ) {
    try {
      const retryConfig: RetryConfig = {
        retryDelay: 121000,
      };
      const result = await this.googlesheets?.spreadsheets.values.batchUpdate(
        resource,
        { retryConfig: retryConfig }
      );
      result?.config.retryConfig;
    } catch (error: any) {
      throw new Error("Write file error: " + error.message);
    }
  }
}

export default GoogleSheets;
