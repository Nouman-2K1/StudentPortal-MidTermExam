// types.ts
export default interface User {
  student_id: number;
  name: string;
  email: string;
  role: string;
  roll_number: string;
  department_id: number;
  semester: number;
  admission_year: number;
  current_year: number;
  active_status: boolean;
  token?: string;
}
