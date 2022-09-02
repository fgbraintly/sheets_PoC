import { QueryTypes, Sequelize } from "sequelize";
import { Options } from "sequelize/types";
import mysql2 from "mysql2";
import { CallResponse } from "../types/CallResponse";
import { Institution } from "../types/Institution";

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
      WHERE calls.duration >= 120 and (calls.created_at between '${_startDate}' and DATE_ADD('${_startDate}', INTERVAL 6 DAY)) order by calls.created_at`,
      { type: QueryTypes.SELECT, raw: true }
    );
  }

  async queryCodes(): Promise<Array<Institution>> {
    return await this.sequelize.query(
      "SELECT promotional_codes.title, promotional_codes.enabled,promotional_codes.code,promotional_codes.created_at,promotional_codes.temary,promotional_codes.generate_report,institutions.name FROM promotional_codes left join institutions on institutions.id = promotional_codes.institution_id where promotional_codes.generate_report = 1",
      { type: QueryTypes.SELECT, raw: true }
    );
  }
}
export default SequelizeService;
