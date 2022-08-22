import { QueryTypes, Sequelize } from "sequelize";
import { Options } from "sequelize/types";
import mysql2 from 'mysql2';
import {CallResponse} from "../types/CallResponse";
import {Institution} from "../types/Institution";

class SequelizeService {
  private sequelize: Sequelize;
  constructor() {
    const options: Options = {
      database: process.env.MYSQL_DATABASE,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      host: process.env.MYSQL_HOST,
      dialect: "mysql",
      dialectModule: mysql2 
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
      `SELECT distinct calls.id,calls.id as id, calls.created_at as date,calls.duration, calls.student_id, calls.recording_url, coaches_info.first_name as coach_name, coaches_info.last_name as coach_last_name, student_info.first_name as student_name, student_info.last_name as student_last_name, countries.name as coach_nationality from calls join coaches on coaches.id = calls.coach_id join students on students.id = calls.student_id join users as coaches_info on coaches_info.id = coaches.id join users as student_info on student_info.id = students.id join institution_student on institution_student.student_id = students.id join promotional_codes on promotional_codes.institution_id = institution_student.institution_id join countries on countries.id = coaches.nationality where calls.status = 'finished' and promotional_codes.code ='${_code}' and calls.duration >= 120 and (calls.created_at between '${_startDate}' and DATE_ADD('${_startDate}', INTERVAL 6 DAY)) order by calls.created_at`,
      { type: QueryTypes.SELECT, raw: true }
    );
  }

  async queryCodes():Promise<Array<Institution>>  {
    return await this.sequelize.query(
      "SELECT promotional_codes.title, promotional_codes.enabled,promotional_codes.code,promotional_codes.created_at,promotional_codes.temary,promotional_codes.generate_report,institutions.name FROM promotional_codes left join institutions on institutions.id = promotional_codes.institution_id where promotional_codes.generate_report = 1",
      { type: QueryTypes.SELECT, raw: true }
    );
  }
}
export default SequelizeService;
