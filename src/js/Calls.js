"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SequelizeService_1 = __importDefault(require("./services/SequelizeService"));
const moment_1 = __importDefault(require("moment"));
const GoogleSheets_1 = __importDefault(require("./services/GoogleSheets"));
const GoogleDrive_1 = __importDefault(require("./services/GoogleDrive"));
class Calls {
    constructor() {
        this.sequelizeService = new SequelizeService_1.default();
        this.sheetService = new GoogleSheets_1.default();
        this.driveService = new GoogleDrive_1.default();
    }
    getWeeks(_code) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { first, last } = yield this.sequelizeService.getProgramDateCall(_code);
            const fpc = (0, moment_1.default)((_a = first[0]) === null || _a === void 0 ? void 0 : _a.date, "YYYY-MM-DD");
            const lpc = (0, moment_1.default)((_b = last[0]) === null || _b === void 0 ? void 0 : _b.date, "YYYY-MM-DD");
            let diff = moment_1.default.duration(lpc.diff(fpc));
            let totalWeeks = Math.ceil(diff.asWeeks());
            return { totalWeeks, fpc, lpc };
        });
    }
    getCalls(_code) {
        var _a, _b, _c;
        var _d;
        return __awaiter(this, void 0, void 0, function* () {
            let { totalWeeks, fpc } = yield this.getWeeks(_code);
            let callsDividedByWeeks = new Array();
            for (let i = 0; i < totalWeeks; i++) {
                callsDividedByWeeks.push(yield this.sequelizeService.queryCalls(_code, fpc
                    .add(i == 0 ? 0 : 1, "w")
                    .format("YYYY-MM-DD")
                    .toString()));
            }
            let studentsByWeeks = new Array();
            for (let i = 0; i < callsDividedByWeeks.length; i++) {
                if (callsDividedByWeeks[i].length === 0) {
                    studentsByWeeks[i] = new Array();
                }
                for (let call of callsDividedByWeeks[i]) {
                    let studentAux = {
                        studentId: call.student_id,
                        firstName: call.student_name,
                        lastName: call.student_last_name,
                    };
                    if ((studentsByWeeks === null || studentsByWeeks === void 0 ? void 0 : studentsByWeeks[i]) === undefined) {
                        studentsByWeeks[i] = new Array();
                    }
                    if (studentsByWeeks[i].length === 0) {
                        studentsByWeeks[i] = new Array();
                        studentsByWeeks[i].push(studentAux);
                    }
                    let studentIndex = studentsByWeeks[i].findIndex((student) => student.studentId == studentAux.studentId);
                    if (studentIndex !== -1) {
                        if (studentsByWeeks[i][studentIndex].calls === undefined) {
                            studentsByWeeks[i][studentIndex].calls = new Array();
                        }
                        (_a = studentsByWeeks[i][studentIndex].calls) === null || _a === void 0 ? void 0 : _a.push(this.formatCall(call));
                        (_b = (_d = studentsByWeeks[i][studentIndex]).totalTimeSpoken) !== null && _b !== void 0 ? _b : (_d.totalTimeSpoken = 0);
                        studentsByWeeks[i][studentIndex].totalTimeSpoken += call.duration;
                    }
                    else {
                        if (studentAux.calls === undefined) {
                            studentAux.calls = new Array();
                        }
                        (_c = studentAux.calls) === null || _c === void 0 ? void 0 : _c.push(this.formatCall(call));
                        studentAux.totalTimeSpoken = call.duration;
                        studentsByWeeks[i].push(studentAux);
                    }
                }
            }
            return studentsByWeeks;
        });
    }
    formatTotalSessions(studentsByWeeks) {
        var _a, _b;
        let info = new Array();
        let callsInfo = new Array();
        let studentInfo = new Array();
        for (let i = 0; i < studentsByWeeks.length; i++) {
            for (const student of studentsByWeeks[i]) {
                callsInfo = (_a = student.calls) === null || _a === void 0 ? void 0 : _a.map((call) => {
                    return [
                        this.formatDate(call.date),
                        this.formatDuration(call.duration),
                    ];
                });
                studentInfo = [
                    student.firstName,
                    student.lastName,
                    (_b = student.calls) === null || _b === void 0 ? void 0 : _b.length,
                    this.formatDuration(student.totalTimeSpoken),
                    ...callsInfo.flatMap((call) => call),
                ];
                info.push(studentInfo);
            }
        }
        return info;
    }
    formatCall(callResponse) {
        let call = {
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
    formatDuration(_seconds) {
        let seconds = +_seconds;
        return new Date(seconds * 1000).toISOString().substring(11, 19);
    }
    formatDate(_date) {
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
    formatValuesAllcalls(student) {
        var _a;
        return [
            student.firstName,
            student.lastName,
            this.formatDuration(student.totalTimeSpoken),
            (_a = student.calls) === null || _a === void 0 ? void 0 : _a.flatMap((call) => {
                var _a, _b, _c;
                return [
                    `${(_a = call.coach) === null || _a === void 0 ? void 0 : _a.coachFirstName} ${(_b = call.coach) === null || _b === void 0 ? void 0 : _b.coachLastName} (${(_c = call.coach) === null || _c === void 0 ? void 0 : _c.coachNationality})`,
                    this.formatDate(call.date),
                    this.formatDuration(call.duration),
                    `=HYPERLINK("${call.recordingUrl}","RecordingUrl")`,
                ];
            }),
        ];
    }
    generateReport(_code, spreeadSheetId, alreadyExist) {
        return __awaiter(this, void 0, void 0, function* () {
            let callsByWeek = yield this.getCalls(_code);
            let toPrint = this.formatTotalSessions(callsByWeek);
            let values = {
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
            yield this.sheetService.writeFile(values);
            yield this.generateWeeklyReport(_code, spreeadSheetId, callsByWeek, alreadyExist);
        });
    }
    generateWeeklyReport(_code, spreadsheetId, callsByWeek, alreadyExist = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = 1;
            let data = new Array();
            let addSheets = new Array();
            for (const week of callsByWeek) {
                if (week.length >= 1) {
                    if (alreadyExist === false) {
                        addSheets.push({
                            addSheet: {
                                properties: {
                                    title: `Week ${count}`,
                                    hidden: false,
                                },
                            },
                        });
                    }
                    data.push({
                        values: [
                            ...week.map((student) => this.formatValuesAllcalls(student).flat()),
                        ],
                        range: `Week ${count}!A1:BZ${week.length + 1}`,
                        majorDimension: "ROWS",
                    });
                    count++;
                }
            }
            if (alreadyExist === false) {
                const addSheetResource = {
                    spreadsheetId: spreadsheetId,
                    requestBody: {
                        requests: addSheets,
                    },
                };
                yield this.sheetService.addSheet(addSheetResource);
            }
            const writeFileResource = {
                spreadsheetId: spreadsheetId,
                requestBody: {
                    valueInputOption: "USER_ENTERED",
                    data,
                },
            };
            yield this.sheetService.writeFile(writeFileResource);
        });
    }
}
exports.default = Calls;
