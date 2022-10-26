import SequelizeService from "./services/SequelizeService";
import { sheets_v4 } from "googleapis";
import moment, { Duration } from "moment";
import GoogleSheets from "./services/GoogleSheets";
import GoogleDrive from "./services/GoogleDrive";
import { CallResponse } from "./types/CallResponse";
import { Student } from "./types/Student";
import { Call } from "./types/Call";
import _ from "lodash";
import { writeFile } from "fs";
class Calls {
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
  /**
   * This function returns an total of weeks between the first call and the last call
   * @param _code
   * @returns
   */
  async getWeeks(_code: string) {
    const { first, last } = await this.sequelizeService.getProgramDateCall(
      _code
    );

    const fpc = moment(first[0]?.date, "YYYY-MM-DD")
      .subtract(1,"w")
      .add(1, "day")
      .utcOffset("GMT-00:00");
    const lpc = moment(last[0]?.date, "YYYY-MM-DD")
      .endOf("week")
      .add(1, "day")
      .utcOffset("GMT-00:00");

    let diff = moment.duration(lpc.diff(fpc));

    let totalWeeks = Math.ceil(diff.asWeeks());

    return { totalWeeks, fpc, lpc };
  }
  /**
   * Get calls divided by weeks using getWeeks()
   * Eliminate all the weeks without calls
   * Format all de calls from diferent weeks into Student[]
   * @param _code promotional code
   * @returns
   */
  async getCalls(_code: string) {
    let { totalWeeks, fpc } = await this.getWeeks(_code);

    let callsDividedByWeeks: Array<Array<CallResponse>> = [];

    for (let i = 0; i < totalWeeks + 1; i++) {
      let calls = await this.sequelizeService.queryCalls(
        _code,
        fpc
          .add(i == 0 ? 0 : 1, "w")
          .format("YYYY-MM-DD")
          .toString()
      );

      callsDividedByWeeks.push(calls);
    }
    
    // writeFile(
    //   `${_code}_log.txt`,
    //   JSON.stringify(callsDividedByWeeks, null, 2),
    //   () => {}
    // );

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
          totalTimeSpoken: 0,
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
          studentsByWeeks[i][studentIndex].totalTimeSpoken =
            studentsByWeeks[i][studentIndex].totalTimeSpoken + call.duration;
        } else {
          if (studentAux.calls === undefined) {
            studentAux.calls = [];
          }
          studentAux.calls?.push(this.formatCall(call));
          studentAux.totalTimeSpoken =
            studentAux.totalTimeSpoken + call.duration;
          studentsByWeeks[i].push(studentAux);
        }
      }
    }
    return studentsByWeeks;
  }

  removeStudents(arr: Student[][], value: number[]) {}

  formatTotalSessions(studentsByWeeks: Student[][]) {
    let info: Array<any[]> = new Array();
    let callsInfo: any[] = new Array();
    let studentInfo: string[] = new Array();
    let groupArr: any;

    const flattedStudents = [...studentsByWeeks.flatMap((week) => week)];

    const groupedStudentsByWeek = _.groupBy(
      flattedStudents,
      (s) => s.studentId
    );

    const studentsTotalSessions: Student[] = _.map(
      groupedStudentsByWeek,
      (studentList, studentId) => {
        const callList: Call[] = studentList.flatMap(
          (student) => student.calls!
        );
        const totalTimeSpoken = callList.reduce(
          (acc, call) => acc + call.duration,
          0
        );
        const firstStudent = studentList[0] as Student;

        return {
          studentId: +studentId,
          firstName:
            firstStudent.firstName.charAt(0).toUpperCase() +
            firstStudent.firstName.slice(1),
          lastName:
            firstStudent.lastName === "lastName" ? " " : firstStudent.lastName,
          totalTimeSpoken: totalTimeSpoken,
          calls: callList,
        };
      }
    );
    const studentsTotalSessionsOrdered = _.sortBy(studentsTotalSessions, [
      "lastName",
      "firstName",
    ]);
    this.totalTimeSpoken = undefined;
    for (const student of studentsTotalSessionsOrdered) {
      callsInfo = <string[][]>student.calls?.map((call) => {
        return [this.formatDate(call.date), this.formatDuration(call.duration)];
      });

      this.totalTimeSpoken = moment
        .duration(this.totalTimeSpoken)
        .add(this.formatDuration(student.totalTimeSpoken));

      studentInfo = <string[]>[
        student.firstName,
        student.lastName,
        student.calls?.length,
        this.formatDuration(<number>student.totalTimeSpoken),
        ...callsInfo.flatMap((call) => call),
      ];
      info.push(studentInfo);
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
        coachLastName:
          callResponse.coach_last_name === "lastName"
            ? " "
            : callResponse.coach_last_name,
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
      date.getFullYear().toString().slice(2),
    ];
    let day = dd < 10 ? "0" + dd : dd;
    let month = mm < 10 ? "0" + mm : mm;
    return `${month}/${day}/${yyyy}`;
  }

  private formatValuesAllcalls(student: Student) {
    if (student.lastName === "lastName") {
      student.lastName = " ";
    }

    return [
      student.firstName.charAt(0).toUpperCase() + student.firstName.slice(1),
      student.lastName,
      student.calls?.length,
      this.formatDuration(<number>student.totalTimeSpoken),
      student.calls?.flatMap((call) => [
        this.formatDate(call.date),
        `${call.coach?.coachFirstName} (${call.coach?.coachNationality})`,
        `=HYPERLINK("${call.recordingUrl}","Click to listen")`,
        this.formatDuration(call.duration),
      ]),
    ];
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

  async generateReport(
    _code: string,
    spreeadSheetId: string,
    alreadyExist?: boolean
  ) {
    let durationDateHeader: string[] = [];
    let callsByWeek = await this.getCalls(_code);

    let toPrint = this.formatTotalSessions(callsByWeek);

    let { condition, largest } = this.headersAmount(toPrint, this.header);

    const totalCallsCount = toPrint.reduce((acc, curr) => acc + curr[2], 0);

    let formatedTotalTimeSpoken = this.formatTotalTimeOfCalls();

    let formatingRule: sheets_v4.Schema$Request[] = new Array();
    let colorIndex = 0;

    for (let i = 0; i < condition; i++) {
      durationDateHeader.push(
        `Date of ${i + 1}${this.dayFormat(i)} Call`,
        `Duration of ${i + 1}${this.dayFormat(i)} Call`
      );
    }

    toPrint.unshift(
      [...this.header, ...durationDateHeader],
      ["TOTAL", "", totalCallsCount, formatedTotalTimeSpoken],
      ["", "", "", ""]
    );

    for (let i = 4; i < largest - 1; i += 2) {
      colorIndex = colorIndex == 0 ? 1 : 0;
      formatingRule.push({
        repeatCell: {
          range: {
            sheetId: 0,
            startColumnIndex: i,
            endColumnIndex: i + 2,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: this.headersColors()[colorIndex],
            },
          },
          fields: "userEnteredFormat(backgroundColor)",
        },
      });
    }

    await this.generateWeeklyReport(
      _code,
      spreeadSheetId,
      callsByWeek,
      toPrint,
      formatingRule,
      alreadyExist
    );
  }

  async generateWeeklyReport(
    _code: string,
    spreadsheetId: string,
    callsByWeek: Student[][],
    toPrint: any[][],
    totalSessionFormatingRule: sheets_v4.Schema$Request[],
    alreadyExist?: boolean
  ) {
    let weekCounter = 1;
    let formatedCalls: sheets_v4.Schema$ValueRange[] = new Array();
    let addSheets: sheets_v4.Schema$Request[] = new Array();
    let formatingRule: sheets_v4.Schema$Request[] = new Array();
    let lastPageWeek = <number>(
      await this.sheetService.getLastSheet(spreadsheetId)
    );
    for (const week of callsByWeek) {
      if (week.length >= 1) {
        let header: any[] = [
          "First Name",
          "Last Name",
          "Total Calls",
          "Total Time Spoken",
        ];
        if (!alreadyExist || weekCounter >= lastPageWeek) {
          addSheets.push({
            addSheet: {
              properties: {
                title: `Week ${weekCounter}`,
                hidden: false,
                sheetId: weekCounter,
              },
            },
          });
          formatingRule.push(...this.formatingRuleOfWeeks(weekCounter));
        }
        let amountOfCalls = week.map(
          (student) => <number>student.calls?.length
        );
        let largestCalls = Math.max(...amountOfCalls);

        for (let i = 0; i < largestCalls; i++) {
          header.push("Date Time", "Coach", "Recording", "Duration");
        }
        const weekOrdered = _.sortBy(week, ["lastName", "firstName"]);

        formatedCalls.push({
          values: [
            header,
            ...weekOrdered.map((student) =>
              this.formatValuesAllcalls(student).flat()
            ),
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
            requests: [...addSheets, ...formatingRule],
          },
        };
      await this.sheetService.addSheet(addSheetResource);
    }

    let writeFileResource: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdate =
      {
        spreadsheetId: spreadsheetId,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: [
            {
              range: "Sheet1!A1:ZZ" + toPrint.length + 1,
              majorDimension: "ROWS",
              values: [...toPrint.map((students) => students)],
            },
            ...formatedCalls,
          ],
        },
      };

    await this.sheetService.writeFile(writeFileResource);
    await this.sheetService.updateFile(
      spreadsheetId,
      totalSessionFormatingRule
    );
  }

  formatTotalTimeOfCalls() {
    return this.totalTimeSpoken
      ?.toISOString()
      .slice(2)
      .split("")
      .map((c) => {
        switch (c) {
          case "H":
            return ":";
          case "M":
            return ":";
          case "S":
            return "";
          default:
            return c;
        }
      })
      .join("");
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

  formatingRuleOfWeeks(sheet_id: number) {
    const rule = [
      {
        repeatCell: {
          range: {
            sheetId: sheet_id,
            startRowIndex: 0,
            endRowIndex: 1,
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
            sheetId: sheet_id,
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
        updateDimensionProperties: {
          range: {
            sheetId: sheet_id,
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
            sheetId: sheet_id,
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
    return rule;
  }

  headersColors() {
    return [
      {
        red: 80 / 255,
        green: 227 / 255,
        blue: 207 / 255,
        alpha: 1.0,
      },
      {
        red: 197 / 255,
        green: 190 / 255,
        blue: 234 / 255,
        alpha: 1.0,
      },
    ];
  }

  headersAmount(toPrint: any[][], header: string[]) {
    const lengths = toPrint.map((student) => student?.length);
    let largest = Math.max(...lengths);
    let condition = (largest - header.length) / 2;
    return { condition, largest };
  }
}

export default Calls;
