import { QueryTypes, Sequelize } from "sequelize";
import { Options } from "sequelize/types";
import mysql2 from "mysql2";
import { CallResponse } from "../types/CallResponse";
import { Institution } from "../types/Institution";
import { CallTyped } from "../types/CallTyped";
import { Week } from "../types/Week";
import { Sumary } from "../types/Sumary";
import { WeekDetails } from "../types/WeekDetail";

class SequelizeService {
  private sequelize: Sequelize;
  constructor() {
    const options: Options = {
      database: process.env.MYSQL_DATABASE,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      host: process.env.MYSQL_HOST,
      dialect: "mysql",
      dialectModule: mysql2,
      logging: false,
    };
    this.sequelize = new Sequelize(options);
  }

  private async connect() {
    try {
      await this.sequelize.authenticate();
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  }

  async getProgramDateCall(_code: string) {
    const first: Array<any> = await this.sequelize.query(
      `SELECT DATE(calls.created_at) as date from calls join students on students.id = calls.student_id join institution_student on institution_student.student_id = students.id join promotional_codes on promotional_codes.institution_id = institution_student.institution_id where promotional_codes.code = '${_code}' order by calls.created_at asc limit 1`,
      { type: QueryTypes.SELECT, raw: true }
    );
    const last: Array<any> = await this.sequelize.query(
      `SELECT DATE(calls.created_at) as date from calls join students on students.id = calls.student_id join institution_student on institution_student.student_id = students.id join promotional_codes on promotional_codes.institution_id = institution_student.institution_id where promotional_codes.code = '${_code}' order by calls.created_at desc limit 1`,
      { type: QueryTypes.SELECT, raw: true }
    );

    return { first, last };
  }

  async queryCalls(
    _code: string,
    _startDate: string
  ): Promise<Array<CallResponse>> {
    return await this.sequelize.query(
      `SELECT DISTINCT
      calls.id AS id,
      calls.created_at AS date,
      calls.duration,
      calls.student_id,
      calls.recording_url,
      coaches_info.first_name AS coach_name,
      coaches_info.last_name AS coach_last_name,
      student_info.first_name AS student_name,
      student_info.last_name AS student_last_name,
      countries.name AS coach_nationality
  FROM
      calls
          INNER JOIN
      coaches ON coaches.id = calls.coach_id
          INNER JOIN
      students ON students.id = calls.student_id
          INNER JOIN
      users AS coaches_info ON coaches_info.id = coaches.user_id
          INNER JOIN
      users AS student_info ON student_info.id = students.user_id
          INNER JOIN
      institution_student ON institution_student.student_id = students.id
          INNER JOIN
      promotional_codes ON promotional_codes.institution_id = institution_student.institution_id
          INNER JOIN
      (SELECT 
          promotional_codes_students.student_id,
              promotional_codes_students.promotional_code_id,
              promotional_codes.code,
              max
      FROM
          promotional_codes_students
      INNER JOIN promotional_codes ON promotional_codes.id = promotional_codes_students.promotional_code_id
      INNER JOIN (SELECT 
          student_id, MAX(created_at) AS max
      FROM
          promotional_codes_students
      GROUP BY student_id) AS temp ON temp.student_id = promotional_codes_students.student_id
          AND temp.max = promotional_codes_students.created_at
      WHERE
          code = '${_code}') AS lastCodeRedeem ON lastCodeRedeem.student_id = calls.student_id
          INNER JOIN
      countries ON countries.id = coaches.nationality
      WHERE calls.duration >= 120 and calls.created_at >= lastCodeRedeem.max and (calls.created_at between '${_startDate}' and DATE_ADD('${_startDate}', INTERVAL 7 DAY)) order by calls.created_at`,
      { type: QueryTypes.SELECT, raw: true }
    );
  }

  async queryCodes(): Promise<Array<Institution>> {
    return await this.sequelize.query(
      "SELECT promotional_codes.title, promotional_codes.enabled,promotional_codes.code,promotional_codes.created_at,promotional_codes.temary,promotional_codes.generate_report,institutions.name FROM promotional_codes left join institutions on institutions.id = promotional_codes.institution_id",
      { type: QueryTypes.SELECT, raw: true }
    );
  }

  async queryCallsV2(_code: string, _startDate: string): Promise<CallTyped[]> {
    return await this.sequelize.query(
      `SELECT 
    calls.id AS CallID,
    calls.duration AS CallDuration,
    calls.created_at AS CallDate,
    students.id as StudentID,
    uStudent.first_name AS StudentFirstName,
    uStudent.last_name AS StudentLastName,
    uCoaches.first_name AS CoachFirstName,
    uCoaches.last_name AS CoachLastName,
    countries.name AS CoachNationality
      FROM
    students
        INNER JOIN
    (SELECT 
        promotional_codes_students.student_id,
            promotional_codes_students.promotional_code_id,
            promotional_codes.code,
            max
    FROM
        promotional_codes_students
    INNER JOIN promotional_codes ON promotional_codes.id = promotional_codes_students.promotional_code_id
    INNER JOIN (SELECT 
        student_id, MAX(created_at) AS max
    FROM
        promotional_codes_students
    GROUP BY student_id) AS temp ON temp.student_id = promotional_codes_students.student_id
        AND temp.max = promotional_codes_students.created_at
    WHERE
        code = '${_code}') AS lastCode ON lastCode.student_id = students.id
        INNER JOIN
    calls ON calls.student_id = students.id
        INNER JOIN
    coaches ON coaches.id = calls.coach_id
        INNER JOIN
    users AS uStudent ON uStudent.id = students.user_id
        INNER JOIN
    users AS uCoaches ON uCoaches.id = coaches.user_id
        INNER JOIN
    countries ON countries.id = coaches.nationality
        WHERE
    duration >= 120
        AND calls.created_at >= lastCode.max
        AND (calls.created_at 
            BETWEEN '${_startDate}' 
        AND DATE_ADD('${_startDate}', INTERVAL 7 DAY)) 
        ORDER BY calls.created_at`,
      { type: QueryTypes.SELECT, raw: true }
    );
  }

  async queryTotalCallsV2(_code: string): Promise<CallTyped[]> {
    return await this.sequelize.query(
      `SELECT 
    calls.id AS CallID,
    calls.duration AS CallDuration,
    calls.created_at AS CallDate,
    students.id as StudentID,
    uStudent.first_name AS StudentFirstName,
    uStudent.last_name AS StudentLastName,
    uCoaches.first_name AS CoachFirstName,
    uCoaches.last_name AS CoachLastName,
    countries.name AS CoachNationality
      FROM
    students
        INNER JOIN
    (SELECT 
        promotional_codes_students.student_id,
            promotional_codes_students.promotional_code_id,
            promotional_codes.code,
            max
    FROM
        promotional_codes_students
    INNER JOIN promotional_codes ON promotional_codes.id = promotional_codes_students.promotional_code_id
    INNER JOIN (SELECT 
        student_id, MAX(created_at) AS max
    FROM
        promotional_codes_students
    GROUP BY student_id) AS temp ON temp.student_id = promotional_codes_students.student_id
        AND temp.max = promotional_codes_students.created_at
    WHERE
        code = '${_code}') AS lastCode ON lastCode.student_id = students.id
        INNER JOIN
    calls ON calls.student_id = students.id
        INNER JOIN
    coaches ON coaches.id = calls.coach_id
        INNER JOIN
    users AS uStudent ON uStudent.id = students.user_id
        INNER JOIN
    users AS uCoaches ON uCoaches.id = coaches.user_id
        INNER JOIN
    countries ON countries.id = coaches.nationality
        WHERE
    duration >= 120
        AND calls.created_at >= lastCode.max
        ORDER BY calls.created_at`,
      { type: QueryTypes.SELECT, raw: true }
    );
  }

  async getProgramDateCallV2(_code: string) {
    return (await this.sequelize.query(
      `SELECT 
          promotional_codes_students.student_id,
          promotional_codes_students.promotional_code_id,
          promotional_codes.code,
          redeemDate
          FROM
              promotional_codes_students
          INNER JOIN promotional_codes ON promotional_codes.id = promotional_codes_students.promotional_code_id
          INNER JOIN (SELECT 
              student_id, MAX(created_at) AS redeemDate
          FROM
              promotional_codes_students
          GROUP BY student_id) AS temp ON temp.student_id = promotional_codes_students.student_id
              AND temp.redeemDate = promotional_codes_students.created_at
          WHERE
        code = '${_code}' ORDER BY redeemDate LIMIT 1`,
      { type: QueryTypes.SELECT, raw: true }
    )) as Array<any>;
  }

  async getSummary(_code: string) {
    return (await this.sequelize.query(
      `SELECT 
      students.id AS studentId,
      users.first_name AS studentFirstName,
      users.last_name AS studentLastName,
      promotional_codes.code AS promotionalCode,
      SUM(calls.duration) AS studentTotalTimeSpoken,
      COUNT(calls.id) AS studentTotalCalls
  FROM
      calls
          JOIN
      students ON calls.student_id = students.id
          JOIN
      users ON students.user_id = users.id
          JOIN
      institution_student ON students.id = institution_student.student_id
          JOIN
      (SELECT 
          student_id, MAX(created_at) AS max_created_at
      FROM
          institution_student
      GROUP BY student_id) AS last_redeem ON institution_student.student_id = last_redeem.student_id
          AND institution_student.created_at = last_redeem.max_created_at
          JOIN
      promotional_codes ON institution_student.promotional_code_id = promotional_codes.id
  WHERE
      promotional_codes.code = '${_code}'
          AND calls.created_at >= last_redeem.max_created_at
          AND calls.duration > 120
  GROUP BY students.id , users.first_name , users.last_name , promotional_codes.code`,
      { type: QueryTypes.SELECT, raw: true }
    )) as Sumary[];
  }

  async allCalls(_code: string) {
    return (await this.sequelize.query(
      `SELECT DISTINCT
      s.id AS student_id,
      u.first_name AS studentFirstName,
      u.last_name AS studentLastName,
      coaches.id AS coach_id,
      cu.first_name AS coachFirstName,
      cu.last_name AS coachLastName,
      calls.duration AS duration,
      calls.recording_url AS recording,
      calls.created_at AS dateTime,
      countries.name AS coachNationality
  FROM
      students s
          JOIN
      calls ON calls.student_id = s.id
          JOIN
      users u ON s.user_id = u.id
          JOIN
      institution_student ON s.id = institution_student.student_id
          INNER JOIN
      promotional_codes ON promotional_codes.institution_id = institution_student.institution_id
          INNER JOIN
      (SELECT 
          promotional_codes_students.student_id,
              promotional_codes_students.promotional_code_id,
              promotional_codes.code,
              max
      FROM
          promotional_codes_students
      INNER JOIN promotional_codes ON promotional_codes.id = promotional_codes_students.promotional_code_id
      INNER JOIN (SELECT 
          student_id, MAX(created_at) AS max
      FROM
          promotional_codes_students
      GROUP BY student_id) AS temp ON temp.student_id = promotional_codes_students.student_id
          AND temp.max = promotional_codes_students.created_at
      WHERE
          code = '${_code}') AS lastCodeRedeem ON lastCodeRedeem.student_id = calls.student_id
          JOIN
      coaches ON calls.coach_id = coaches.id
          JOIN
      users cu ON coaches.user_id = cu.id
          JOIN
      countries ON coaches.nationality = countries.id
  WHERE
      calls.created_at >= institution_student.created_at
          AND calls.duration > 120
  ORDER BY s.id , calls.created_at`,
      { type: QueryTypes.SELECT, raw: true }
    )) as WeekDetails[];
  }
}

export default SequelizeService;
