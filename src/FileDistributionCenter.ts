import { sheets_v4 } from "googleapis";
import GoogleDrive from "./services/GoogleDrive";
import GoogleSheets from "./services/GoogleSheets";

interface LinkedFile {
  code: string;
  link?: string;
}

interface Half {
  isFirstHalf: boolean;
  range: number;
}
class FileDistributionCenter {
  private files: Array<string[]>;
  private sheetService: GoogleSheets;
  private drive: GoogleDrive;
  private name = "LinkBankManual";
  private range: string;
  private linkBankId: string;
  private half: Half;
  constructor(half: Half) {
    this.files = [];
    this.range = "";
    this.half = half;
    this.linkBankId = "1wQyFnOfaqEGAY_oHQEd_aOq7m1xt_s58GykIjPfZoIo";
    this.sheetService = new GoogleSheets();
    this.drive = new GoogleDrive();
  }

  async createFile() {
    const exists = await this.drive.searchFile(this.name);
    if (typeof exists === "string") {
      this.linkBankId = exists;
      return false;
    }
    this.linkBankId = await this.sheetService.createFile(this.name);
  }

  addLink(code: string, link: string) {
    this.files.push([
      code,
      link,
      `"=IMPORTRANGE("https://docs.google.com/spreadsheets/d/${
        this.linkBankId
      }","Sheet1!B${this.files.length + 1}")"`,
    ]);
  }

  logme() {
    console.log(JSON.stringify(this.files, null, 2));
  }
  async updateValues() {
    this.range = `Sheet1!A1:Z${this.files.length + 1}`;
    if (this.linkBankId !== "") {
      await this.updateSpreadSheet(this.linkBankId);
      return;
    }

    const resource: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdate =
      {
        spreadsheetId: this.linkBankId,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: [
            {
              range: this.range,
              majorDimension: "ROWS",
              values: [...this.files.map((link) => link)],
            },
          ],
        },
      };
    const created = await this.sheetService.writeFile(resource);
    // await this.share(this.linkBankId);
  }

  async updateSpreadSheet(file: string) {
    const resource: sheets_v4.Schema$BatchUpdateValuesRequest = {
      valueInputOption: "USER_ENTERED",
      data: [
        {
          range: this.range,
          majorDimension: "ROWS",
          values: [...this.files.map((value) => value)],
        },
      ],
    };
    const updated = await this.sheetService.updateExistingValues(
      file,
      resource
    );
    // await this.share(this.linkBankId);
  }

  async share(id: string) {
    this.drive.shareFilesToMultipleEmails(
      [
        {
          type: "user",
          role: "reader",
          emailAddress: "victoria@time2talk.app",
        },
        {
          type: "user",
          role: "reader",
          emailAddress: "marina@time2talk.app",
        },
        {
          type: "user",
          role: "reader",
          emailAddress: "juan@time2talk.app",
        },
        {
          type: "user",
          role: "reader",
          emailAddress: "hello@time2talk.app",
        },
        {
          type: "user",
          role: "owner",
          emailAddress: "services@time2talk.app",
        },
      ],
      id as string,
      false
    );
  }
}

export default FileDistributionCenter;
