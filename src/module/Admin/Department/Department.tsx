import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import * as Yup from 'yup';
import { useFormik } from 'formik';

// Define TypeScript interfaces
interface Department {
  department_id: number;
  name: string;
  created_at: string;
}

const AdminDepartment: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch Departments
  const fetchDepartments = async () => {
    try {
      const response: AxiosResponse<Department[]> = await axios.get(
        'http://localhost:3301/department/get',
      );
      setDepartments(response.data);
    } catch (err) {
      setError('Failed to fetch departments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Form Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .required('Name is required'),
  });

  // Formik Setup
  const formik = useFormik({
    initialValues: { name: '' },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await axios.post('http://localhost:3301/department/create', values);
        // Re-fetch departments to update UI
        fetchDepartments();
        resetForm();
        setShowModal(false);
      } catch (err) {
        setError('Failed to add department. Please try again.');
      }
    },
  });

  // Delete Department
  const deleteDepartment = async (departmentId: number) => {
    try {
      await axios.delete(
        `http://localhost:3301/department/delete/${departmentId}`,
      );
      fetchDepartments(); // Re-fetch departments after deletion
    } catch (err) {
      setError('Failed to delete department. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600"
          onClick={() => setShowModal(true)}
        >
          Add Department
        </button>
      </div>

      {/* Empty State */}
      {loading ? (
        <div className="mt-10 text-center">
          <p className="text-gray-600">Loading departments...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            No Departments Found
          </h2>
          <p className="text-gray-600 mt-2">
            Get started by adding your first department.
          </p>
        </div>
      ) : (
        // Table
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-6 py-3 font-medium text-gray-600">#</th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Department Name
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Created At
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department, index) => (
                <tr
                  key={department.department_id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-6 py-3">{index + 1}</td>
                  <td className="px-6 py-3">{department.name}</td>
                  <td className="px-6 py-3">
                    {new Date(department.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteDepartment(department.department_id)}
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

      {/* Error Message */}
      {error && (
        <div className="mt-4 text-red-500 text-center">
          <p>{error}</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Add Department
            </h2>
            <form onSubmit={formik.handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department Name
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartment;
