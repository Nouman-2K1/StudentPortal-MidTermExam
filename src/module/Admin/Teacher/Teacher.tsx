import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interfaces for Department and Teacher
interface Department {
  department_id: number;
  name: string;
  created_at: string;
}

interface Teacher {
  teacher_id: number;
  name: string;
  email: string;
  department_id: number;
  department_name?: string;
  created_at: string;
  role: string;
}

const AdminTeacher: React.FC = () => {
  // State management
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch Teachers
  const fetchTeachers = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        'http://localhost:3301/auth/teacher/getAllTeacher',
      );
      setTeachers(response.data.teachers);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch teachers. Please try again later');
      console.error(err);
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
    fetchTeachers();
    fetchDepartments();
  }, []);

  // Form Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must include uppercase, lowercase, number, and special character',
      )
      .required('Password is required'),
    department_id: Yup.number()
      .required('Department is required')
      .positive('Please select a valid department'),
    role: Yup.string()
      .required('Role is required')
      .oneOf(['admin', 'teacher'], 'Invalid role selected'),
  });

  // Formik Setup
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      department_id: 0,
      role: 'teacher',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await axios.post(
          'http://localhost:3301/auth/teacher/register',
          values,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          },
        );
        fetchTeachers();
        resetForm();
        setShowModal(false);
        toast.success('Teacher added successfully!');
      } catch (err) {
        setError('Failed to add teacher. Please try again.');
      }
    },
  });

  // Delete Teacher
  const deleteTeacher = async (teacherId: number) => {
    try {
      await axios.delete(
        `http://localhost:3301/auth/teacher/deleteTeacher/${teacherId}`,
      );
      fetchTeachers();
      toast.success('Teacher deleted successfully!');
    } catch (err) {
      setError('Failed to delete teacher. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600"
          onClick={() => setShowModal(true)}
        >
          Add Teacher
        </button>
      </div>

      {/* Loading and Empty State */}
      {loading ? (
        <div className="mt-10 text-center">
          <p className="text-gray-600">Loading teachers...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            No Teachers Found
          </h2>
          <p className="text-gray-600 mt-2">
            Get started by adding your first teacher.
          </p>
        </div>
      ) : (
        <div className="mt-6 bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full table-auto min-w-[800px]">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-6 py-3 font-medium text-gray-600">#</th>
                <th className="px-6 py-3 font-medium text-gray-600">Name</th>
                <th className="px-6 py-3 font-medium text-gray-600">Email</th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Department
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">Role</th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Created At
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr
                  key={teacher.teacher_id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-6 py-3">{index + 1}</td>
                  <td className="px-6 py-3">{teacher.name}</td>
                  <td className="px-6 py-3">{teacher.email}</td>
                  <td className="px-6 py-3">
                    {teacher.department_name || 'N/A'}
                  </td>
                  <td className="px-6 py-3">{teacher.role}</td>
                  <td className="px-6 py-3">
                    {new Date(teacher.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteTeacher(teacher.teacher_id)}
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

      {/* Modal for Adding Teacher */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-start justify-center pt-16 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 my-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Add Teacher
            </h2>
            <form onSubmit={formik.handleSubmit}>
              {/* Name Input */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`w-full px-3 py-2 border rounded ${
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

              {/* Email Input */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full px-3 py-2 border rounded ${
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

              {/* Password Input */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`w-full px-3 py-2 border rounded ${
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

              {/* Department Dropdown */}
              <div className="mb-4">
                <label
                  htmlFor="department_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department
                </label>
                <select
                  id="department_id"
                  name="department_id"
                  className={`w-full px-3 py-2 border rounded ${
                    formik.touched.department_id && formik.errors.department_id
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.department_id}
                >
                  <option value={0}>Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
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

              {/* Role Dropdown */}
              <div className="mb-4">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className={`w-full px-3 py-2 border rounded ${
                    formik.touched.role && formik.errors.role
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.role}
                >
                  <option value="teacher">Teacher</option>
                </select>
                {formik.touched.role && formik.errors.role && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.role}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded mr-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
                >
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeacher;
