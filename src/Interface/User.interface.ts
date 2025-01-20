export interface BaseUser {
  name: string;
  email: string;
  role: 'admin' | 'student' | 'teacher';
  token?: string;
}

export interface Student extends BaseUser {
  role: 'student';
  student_id: number;
  roll_number: string;
  department_id: number;
  semester: number;
  admission_year: number;
  current_year: number;
  active_status: boolean;
}

export interface Teacher extends BaseUser {
  role: 'teacher';
  teacher_id: number;
  department_id: number;
}

export interface Admin extends BaseUser {
  role: 'admin';
  admin_id: number;
}

export type UserType = Student | Teacher | Admin;
export type UserRole = 'admin' | 'student' | 'teacher';
