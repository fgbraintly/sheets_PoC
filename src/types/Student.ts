import { Call } from "./Call";

export type Student = {
  studentId: number;
  firstName: string;
  lastName: string;
  totalTimeSpoken?:number | 0;
  calls?: Call[];
};
