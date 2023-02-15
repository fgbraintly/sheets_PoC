import _ from "lodash";
import moment, { Duration } from "moment";
import GoogleDrive from "./services/GoogleDrive";
import GoogleSheets from "./services/GoogleSheets";
import SequelizeService from "./services/SequelizeService";
import { Call } from "./types/Call";
import { CallTyped } from "./types/CallTyped";
import { Student } from "./types/Student";
import { Week } from "./types/Week";
import { TotalsOfSumary } from "./types/TotalsOfSumary";
import { sheets_v4 } from "googleapis";

class CallsV2 {
  private sequelizeService;
  private sheetService;
  private driveService;
  private totalTimeSpoken: Duration | undefined;

  private header: string[] = [
    "First Name",
    "Last Name",
    "Total Calls",
    "Total Time Spoken",
  ];
  constructor() {
    this.sequelizeService = new SequelizeService();
    this.sheetService = new GoogleSheets();
    this.driveService = new GoogleDrive();
  }

  async generateReport(_code: string) {
    const sumary = await this.sequelizeService.getSummary(_code);
    const detail = await this.sequelizeService.allCalls(_code);

    const totals = {
      totalCalls: "=SUM(C2:C)",
      totalTimeSpoken: "=SUM(D2:D)",
    } as TotalsOfSumary;

    const groupedCallsByStudent = _.groupBy(
      detail,
      (student) => student.student_id
    );

    const longest = _.countBy(groupedCallsByStudent, "length");
    const callsHeaderLength = Object.keys(longest).pop();
    let callsHeader: string[] = [];

    if (callsHeaderLength) {
      for (let i = 0; i < +callsHeaderLength; i++) {
        callsHeader.push(
          `Date of ${i + 1}${this.dayFormat(i)} Call`,
          `Duration of ${i + 1}${this.dayFormat(i)} Call`
        );
      }
    }

    let toPrint:any[][] = [];

    let formatStudentsSummary = sumary.map(student => {
      return [{
        firstName: student.studentFirstName,
        lastName:student.studentLastName,
        totalCalls: student.studentTotalCalls,
        totalTimeSpokenByStudent: student.studentTotalTimeSpoken
      }]
    })
    toPrint.push(
      [...this.header, ...callsHeader],
      ["TOTAL", "", totals.totalCalls, this.totalTimeSpoken],
      ["", "", "", ""],
      [...formatStudentsSummary.flatMap((students) => students)]
    );

    let sheetID = await this.sheetService.createFile(_code);

    let print = [...toPrint.map(student => student)][3][0];
    console.log("🚀 ~ file: CallsV2.ts:70 ~ CallsV2 ~ generateReport ~ print", print)
    let writeFileResource: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdate =
      {
        spreadsheetId: sheetID,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: [
            {
              range: "Sheet1!A1:ZZ" + toPrint.length + 1,
              majorDimension: "ROWS",
              values: [...formatStudentsSummary.map(student => student)],
            },
          ],
        },
      };

    await this.sheetService.writeFile(writeFileResource);

    await this.driveService.shareFiles(
      "anyone",
      "franco.garancini@braintly.com",
      "reader",
      sheetID
    );
    // console.log("🚀 ~ file: CallsV2.ts:54 ~ CallsV2 ~ generateReport ~ groupedCallsByStudent", groupedCallsByStudent)
  }

  private formatDuration(_seconds: number) {
    let seconds = +_seconds;
    return new Date(seconds * 1000).toISOString().substring(11, 19);
  }

  dayFormat(i: number): string {
    let n;
    switch (i + 1) {
      case 1:
        n = "st";
        break;
      case 2:
        n = "nd";
        break;
      case 3:
        n = "rd";
        break;
      default:
        n = "th";
        break;
    }
    return n;
  }
}

export default CallsV2;
