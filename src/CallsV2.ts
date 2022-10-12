import _ from "lodash";
import moment, { Duration } from "moment";
import GoogleDrive from "./services/GoogleDrive";
import GoogleSheets from "./services/GoogleSheets";
import SequelizeService from "./services/SequelizeService";
import { Call } from "./types/Call";
import { CallTyped } from "./types/CallTyped";
import { Student } from "./types/Student";
import { Week } from "./types/Week";

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

  async getWeeks(_code: string) {
    const codeRedeemDate = await this.sequelizeService.getProgramDateCallV2(
      _code
    );
    const weekOfFirstProgramCall = moment(
      codeRedeemDate[0]?.redeemDate,
      "YYYY-MM-DD"
    )
      .startOf("week")
      .add(1, "day")
      .utcOffset("GMT-00:00");

    const lastWeekOfProgramCall = moment(
      codeRedeemDate[0]?.redeemDate,
      "YYYY-MM-DD"
    )
      .endOf("week")
      .add(1, "day")
      .utcOffset("GMT-00:00");

    let diff = moment.duration(
      lastWeekOfProgramCall.diff(weekOfFirstProgramCall)
    );

    let totalWeeks = Math.ceil(diff.asWeeks());

    return { totalWeeks, weekOfFirstProgramCall, lastWeekOfProgramCall };
  }

  async getCallsByWeeksV2(_code: string) {
    let { totalWeeks, weekOfFirstProgramCall } = await this.getWeeks(_code);
    let callsDividedByWeeks: Week[] = [];
    let formatedv2 = new Array();
    for (let i = 0; i < totalWeeks + 1; i++) {
      let from = weekOfFirstProgramCall
        .add(i == 0 ? 0 : 1, "w")
        .format("YYYY-MM-DD")
        .toString();

      let calls = await this.sequelizeService.queryCallsV2(_code, from);

      callsDividedByWeeks.push({
        calls: calls,
        date: from,
      });
    }
  }

  async getTotalCallsV2(_code: string) {
    let printableArray: any[] = new Array();

    this.totalTimeSpoken = undefined;

    const allCalls = await this.sequelizeService.queryTotalCallsV2(_code);

    const studentsTotalSessionsOrdered = this.formatCallsToStudent(allCalls);

    printableArray = this.formatPrintableStudent(studentsTotalSessionsOrdered);

    return printableArray;
  }

  formatCallsToStudent(allCalls: CallTyped[]) {
    const groupedCalls = _.groupBy(allCalls, (call) => call.StudentID);

    const students: Student[] = _.map(groupedCalls, (callList, StudentID) => {
      const student = callList[0] as CallTyped;

      const studentCalls = callList.map((detail) => {
        return {
          id: +detail.CallID,
          date: detail.CallDate,
          duration: +detail.CallDuration,
          recordingUrl: detail.CallRecord,
        } as Call;
      });

      const totalTimeSpoken = callList.reduce(
        (acc, row) => acc + +row.CallDuration,
        0
      );

      return {
        studentId: +StudentID,
        firstName:
          student.StudentFirstName.charAt(0).toUpperCase() +
          student.StudentFirstName.slice(1),
        lastName:
          student.StudentLastName === "lastName"
            ? " "
            : student.StudentLastName,
        totalTimeSpoken: totalTimeSpoken,
        calls: studentCalls,
      };
    });

    const studentsTotalSessionsOrdered = _.sortBy(students, [
      "lastName",
      "firstName",
    ]);

    return studentsTotalSessionsOrdered;
  }

  formatPrintableStudent(studentsTotalSessions: Student[]) {
    let printableArray: any[] = new Array();
    for (const student of studentsTotalSessions) {
      let callsDetail = <string[][]>student.calls?.map((call) => {
        return [this.formatDate(call.date), this.formatDuration(call.duration)];
      });

      this.totalTimeSpoken = moment
        .duration(this.totalTimeSpoken)
        .add(this.formatDuration(student.totalTimeSpoken));

      let detailedStudent = <string[]>[
        student.firstName,
        student.lastName,
        student.calls?.length,
        this.formatDuration(<number>student.totalTimeSpoken),
        ...callsDetail.flatMap((call) => call),
      ];
      printableArray.push(detailedStudent);
    }

    return printableArray;
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

  private formatDuration(_seconds: number) {
    let seconds = +_seconds;
    return new Date(seconds * 1000).toISOString().substring(11, 19);
  }
}

export default CallsV2;
