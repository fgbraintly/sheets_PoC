import { Call } from "./Call";

export type Student = {
  studentId: number;
  firstName: string;
  lastName: string;
  totalTimeSpoken:number;
  calls?: Call[];
};
