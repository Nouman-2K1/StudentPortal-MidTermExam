import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interfaces for Department and Student
interface Department {
  department_id: number;
  name: string;
  created_at: string;
}

interface Student {
  student_id: number;
  roll_number: string;
  name: string;
  email: string;
  department_id: number;
  department_name?: string;
  semester: number;
  admission_year: number;
  current_year: number;
  active_status: boolean;
  created_at: string;
  role: string;
}

const AdminStudent: React.FC = () => {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch Students
  const fetchStudents = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        'http://localhost:3301/auth/student/getAllStudent',
      );
      setStudents(response.data.students);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch students. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch Departments
  const fetchDepartments = async () => {
    try {
      const response: AxiosResponse<Department[]> = await axios.get(
        'http://localhost:3301/department/get',
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        },
      );
      setDepartments(response.data);
    } catch (err) {
      setError('Failed to fetch departments. Please try again.');
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, []);

  // Form Validation Schema
  const validationSchema = Yup.object({
    roll_number: Yup.string()
      .required('Roll number is required')
      .max(50, 'Roll number cannot exceed 50 characters'),
    name: Yup.string()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
      .max(100, 'Email cannot exceed 100 characters'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must include uppercase, lowercase, number, and special character',
      )
      .required('Password is required'),
    department_id: Yup.number()
      .required('Department is required')
      .positive('Please select a valid department'),
    semester: Yup.number()
      .required('Semester is required')
      .min(1, 'Semester must be at least 1')
      .max(8, 'Semester cannot exceed 8'),
    admission_year: Yup.number()
      .required('Admission year is required')
      .min(2000, 'Invalid admission year')
      .max(new Date().getFullYear(), 'Invalid admission year'),
    current_year: Yup.number()
      .required('Current year is required')
      .min(
        Yup.ref('admission_year'),
        'Current year cannot be before admission year',
      )
      .max(new Date().getFullYear(), 'Invalid current year'),
    active_status: Yup.boolean().default(true),
  });

  // Formik Setup
  const formik = useFormik({
    initialValues: {
      roll_number: '',
      name: '',
      email: '',
      password: '',
      department_id: 0,
      semester: 1,
      admission_year: new Date().getFullYear(),
      current_year: new Date().getFullYear(),
      active_status: true,
      role: 'student',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await axios.post(
          'http://localhost:3301/auth/student/register',
          values,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          },
        );
        fetchStudents();
        resetForm();
        setShowModal(false);
        toast.success('Student added successfully!');
      } catch (err) {
        setError('Failed to add student. Please try again.');
        toast.error('Failed to add student');
      }
    },
  });

  // Delete Student
  const deleteStudent = async (studentId: number) => {
    try {
      await axios.delete(
        `http://localhost:3301/auth/student/deleteStudent/${studentId}`,
      );
      fetchStudents();
      toast.success('Student deleted successfully!');
    } catch (err) {
      setError('Failed to delete student. Please try again.');
      toast.error('Failed to delete student');
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Students</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition-colors w-full md:w-auto"
          onClick={() => setShowModal(true)}
        >
          Add Student
        </button>
      </div>

      {/* Loading and Empty State */}
      {loading ? (
        <div className="mt-10 text-center">
          <p className="text-gray-600">Loading students...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            No Students Found
          </h2>
          <p className="text-gray-600 mt-2">
            Get started by adding your first student.
          </p>
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-gray-600 text-sm hidden sm:table-cell">
                  #
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-sm">
                  Roll No.
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-sm">
                  Name
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-sm hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-sm hidden lg:table-cell">
                  Department
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-sm">
                  Sem
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-sm hidden sm:table-cell">
                  Year
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-sm">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr key={student.student_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm hidden sm:table-cell">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {student.roll_number}
                  </td>
                  <td className="px-4 py-3 text-sm">{student.name}</td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell">
                    {student.email}
                  </td>
                  <td className="px-4 py-3 text-sm hidden lg:table-cell">
                    {student.department_name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">{student.semester}</td>
                  <td className="px-4 py-3 text-sm hidden sm:table-cell">
                    {student.current_year}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.active_status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {student.active_status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                      onClick={() => deleteStudent(student.student_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Adding Student */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-start justify-center p-4 z-[1000] pt-20">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-5rem)] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-800">Add Student</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Roll Number */}
                <div>
                  <label
                    htmlFor="roll_number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Roll Number
                  </label>
                  <input
                    type="text"
                    id="roll_number"
                    name="roll_number"
                    className={`w-full px-3 py-2 border rounded-md ${
                      formik.touched.roll_number && formik.errors.roll_number
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.roll_number}
                  />
                  {formik.touched.roll_number && formik.errors.roll_number && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.roll_number}
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`w-full px-3 py-2 border rounded-md ${
                      formik.touched.name && formik.errors.name
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full px-3 py-2 border rounded-md ${
                      formik.touched.email && formik.errors.email
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`w-full px-3 py-2 border rounded-md ${
                      formik.touched.password && formik.errors.password
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="department_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Department
                  </label>
                  <select
                    id="department_id"
                    name="department_id"
                    className={`w-full px-3 py-2 border rounded-md ${
                      formik.touched.department_id &&
                      formik.errors.department_id
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.department_id}
                  >
                    <option value={0}>Select Department</option>
                    {departments.map((dept) => (
                      <option
                        key={dept.department_id}
                        value={dept.department_id}
                      >
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.department_id &&
                    formik.errors.department_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.department_id}
                      </p>
                    )}
                </div>

                {/* Semester and Admission Year */}
                <div>
                  <label
                    htmlFor="semester"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    className={`w-full px-3 py-2 border rounded-md ${
                      formik.touched.semester && formik.errors.semester
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.semester}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                  {formik.touched.semester && formik.errors.semester && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.semester}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="admission_year"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Admission Year
                  </label>
                  <input
                    type="number"
                    id="admission_year"
                    name="admission_year"
                    className={`w-full px-3 py-2 border rounded-md ${
                      formik.touched.admission_year &&
                      formik.errors.admission_year
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.admission_year}
                    min={2000}
                    max={new Date().getFullYear()}
                  />
                  {formik.touched.admission_year &&
                    formik.errors.admission_year && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.admission_year}
                      </p>
                    )}
                </div>

                {/* Current Year and Active Status */}
                <div>
                  <label
                    htmlFor="current_year"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Year
                  </label>
                  <input
                    type="number"
                    id="current_year"
                    name="current_year"
                    className={`w-full px-3 py-2 border rounded-md ${
                      formik.touched.current_year && formik.errors.current_year
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.current_year}
                    min={formik.values.admission_year}
                    max={new Date().getFullYear()}
                  />
                  {formik.touched.current_year &&
                    formik.errors.current_year && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.current_year}
                      </p>
                    )}
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    name="active_status"
                    checked={formik.values.active_status}
                    onChange={formik.handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="active_status"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Active Status
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-950 transition-colors flex-1"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudent;
