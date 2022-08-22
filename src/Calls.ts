import SequelizeService from "./services/SequelizeService";
import { sheets_v4 } from "googleapis";
import moment from "moment";
import GoogleSheets from "./services/GoogleSheets";
import GoogleDrive from "./services/GoogleDrive";
import { CallResponse } from "./types/CallResponse";
import { Student } from "./types/Student";
import { Call } from "./types/Call";

class Calls {
  private sequelizeService;
  private sheetService;
  private driveService;

  constructor() {
    this.sequelizeService = new SequelizeService();
    this.sheetService = new GoogleSheets();
    this.driveService = new GoogleDrive();
  }

  async getWeeks(_code: string) {
    const { first, last } = await this.sequelizeService.getProgramDateCall(
      _code
    );

    const fpc = moment(first[0]?.date, "YYYY-MM-DD");
    const lpc = moment(last[0]?.date, "YYYY-MM-DD");

    let diff = moment.duration(lpc.diff(fpc));

    let totalWeeks = Math.ceil(diff.asWeeks());
    return { totalWeeks, fpc, lpc };
  }

  async getCalls(_code: string) {
    let { totalWeeks, fpc } = await this.getWeeks(_code);

    let callsDividedByWeeks: Array<Array<CallResponse>> = [];

    for (let i = 0; i < totalWeeks; i++) {
      let calls = await this.sequelizeService.queryCalls(
        _code,
        fpc
          .add(i == 0 ? 0 : 1, "w")
          .format("YYYY-MM-DD")
          .toString()
      );

      callsDividedByWeeks.push(calls);
    }

    let studentsByWeeks: Array<Array<Student>> = [];
    for (let i = 0; i < callsDividedByWeeks.length; i++) {
      if (callsDividedByWeeks[i].length === 0) {
        studentsByWeeks[i] = [];
      }
      for (let call of callsDividedByWeeks[i]) {
        let studentAux: Student = {
          studentId: call.student_id,
          firstName: call.student_name,
          lastName: call.student_last_name,
        };

        if (studentsByWeeks?.[i] === undefined) {
          studentsByWeeks[i] = [];
        }
        if (studentsByWeeks[i].length === 0) {
          studentsByWeeks[i] = [];
          studentsByWeeks[i].push(studentAux);
        }
        let studentIndex = studentsByWeeks[i]!.findIndex(
          (student) => student.studentId == studentAux.studentId
        );

        if (studentIndex !== -1) {
          if (studentsByWeeks[i][studentIndex].calls === undefined) {
            studentsByWeeks[i][studentIndex].calls = [];
          }
          studentsByWeeks[i][studentIndex].calls?.push(this.formatCall(call));
          studentsByWeeks[i][studentIndex].totalTimeSpoken ??= 0;
          studentsByWeeks[i][studentIndex].totalTimeSpoken! += call.duration;
        } else {
          if (studentAux.calls === undefined) {
            studentAux.calls = [];
          }
          studentAux.calls?.push(this.formatCall(call));
          studentAux.totalTimeSpoken = call.duration;
          studentsByWeeks[i].push(studentAux);
        }
      }
    }
    return studentsByWeeks;
  }

  formatTotalSessions(studentsByWeeks: Student[][]) {
    let info: Array<any[]> = new Array();
    let callsInfo: any[] = new Array();
    let studentInfo: string[] = new Array();
    for (let i = 0; i < studentsByWeeks.length; i++) {
      for (const student of studentsByWeeks[i]) {
        callsInfo = <string[][]>student.calls?.map((call) => {
          return [
            this.formatDate(call.date),
            this.formatDuration(call.duration),
          ];
        });

        studentInfo = <string[]>[
          student.firstName,
          student.lastName,
          student.calls?.length,
          this.formatDuration(<number>student.totalTimeSpoken),
          ...callsInfo.flatMap((call) => call),
        ];
        info.push(studentInfo);
      }
    }

    return info;
  }

  formatCall(callResponse: CallResponse): Call {
    let call: Call = {
      date: callResponse.date,
      duration: callResponse.duration,
      recordingUrl: callResponse.recording_url,
      id: callResponse.id,
      coach: {
        coachFirstName: callResponse.coach_name,
        coachLastName: callResponse.coach_last_name,
        coachNationality: callResponse.coach_nationality,
      },
    };
    return call;
  }

  private formatDuration(_seconds: number) {
    let seconds = +_seconds;
    return new Date(seconds * 1000).toISOString().substring(11, 19);
  }

  private formatDate(_date: Date) {
    let date = new Date(_date);
    let [dd, mm, yyyy] = [
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear(),
    ];
    let day = dd < 10 ? "0" + dd : dd;
    let month = mm < 10 ? "0" + mm : mm;
    return `${day}/${month}/${yyyy}`;
  }

  private formatValuesAllcalls(student: Student) {
    return [
      student.firstName,
      student.lastName,
      this.formatDuration(<number>student.totalTimeSpoken),
      student.calls?.flatMap((call) => [
        `${call.coach?.coachFirstName} ${call.coach?.coachLastName} (${call.coach?.coachNationality})`,
        this.formatDate(call.date),
        this.formatDuration(call.duration),
        `=HYPERLINK("${call.recordingUrl}","RecordingUrl")`,
      ]),
    ];
  }

  async generateReport(
    _code: string,
    spreeadSheetId: string,
    alreadyExist?: boolean
  ) {
    let callsByWeek = await this.getCalls(_code);
    let toPrint = this.formatTotalSessions(callsByWeek);
    console.log(callsByWeek);
    
    let values: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdate = {
      spreadsheetId: spreeadSheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range: "Sheet1!A1:Z" + toPrint.length + 1,
            majorDimension: "ROWS",
            values: [...toPrint.map((students) => students)],
          },
        ],
      },
    };

    await this.sheetService.writeFile(values);

    await this.generateWeeklyReport(
      _code,
      spreeadSheetId,
      callsByWeek,
      alreadyExist
    );
  }

  async generateWeeklyReport(
    _code: string,
    spreadsheetId: string,
    callsByWeek: Student[][],
    alreadyExist?: boolean
  ) {
    let weekCounter = 1;
    let data: sheets_v4.Schema$ValueRange[] = new Array();
    let addSheets: sheets_v4.Schema$Request[] = new Array();
    let lastPageWeek = <number>await this.sheetService.getLastSheet(spreadsheetId);
    for (const week of callsByWeek) {
      if (week.length >= 1) {
        if (!alreadyExist || weekCounter >= lastPageWeek) {
          addSheets.push({
            addSheet: {
              properties: {
                title: `Week ${weekCounter}`,
                hidden: false,
              },
            },
          });
        }
        data.push({
          values: [
            ...week.map((student) => this.formatValuesAllcalls(student).flat()),
          ],
          range: `Week ${weekCounter}`,
          majorDimension: "ROWS",
        });
        weekCounter++;
      }
    }

    if (addSheets.length >= 1) {      
      const addSheetResource: sheets_v4.Params$Resource$Spreadsheets$Batchupdate =
        {
          spreadsheetId: spreadsheetId,
          requestBody: {
            requests: addSheets,
          },
        };
      await this.sheetService.addSheet(addSheetResource);
    }
    const writeFileResource: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdate =
      {
        spreadsheetId: spreadsheetId,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data,
        },
      };
    await this.sheetService.writeFile(writeFileResource);
  }
}

export default Calls;
