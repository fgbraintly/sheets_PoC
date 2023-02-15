import { TotalsOfSumary } from "./TotalsOfSumary";
import { CallsSumary } from "./CallsSumary";
import { CallResume } from "./CallResume";

export interface Sumary {
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  studentTotalCalls: number;
  studentTotalTimeSpoken:number;
  promotionalCode: string;
  calls?: CallResume[];
}
