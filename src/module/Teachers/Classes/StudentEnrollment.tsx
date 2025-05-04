// StudentEnrollment.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useUser } from '../../../context/UserContext';

interface Student {
  student_id: number;
  name: string;
  email: string;
}

interface Enrollment {
  enrollment_id: number;
  student: Student;
  enrolled_at: string;
}

const StudentEnrollment: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const api = axios.create({
    baseURL: 'http://localhost:3301/auth/teacher',
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });

  // Fetch enrolled students
  const fetchEnrollments = async () => {
    try {
      const response = await api.get(`/subject/${subjectId}/enrollments`);
      setEnrollments(response.data);
    } catch (err) {
      setError('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available students for enrollment
  const fetchAvailableStudents = async () => {
    try {
      const response = await api.get(
        `/subject/${subjectId}/students/available`,
      );
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch available students');
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchAvailableStudents();
  }, [subjectId]);

  // Enrollment Form Validation
  const validationSchema = Yup.object({
    student_id: Yup.number().required('Student selection is required'),
  });

  const formik = useFormik({
    initialValues: { student_id: '' },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await api.post('/enrollment/create', {
          subject_id: Number(subjectId),
          student_id: Number(values.student_id),
        });
        await fetchEnrollments();
        await fetchAvailableStudents();
        resetForm();
        setShowAddModal(false);
      } catch (err) {
        setError('Failed to enroll student');
      }
    },
  });

  const deleteEnrollment = async (enrollmentId: number) => {
    try {
      await api.delete(`/enrollment/delete/${enrollmentId}`);
      setEnrollments(
        enrollments.filter((e) => e.enrollment_id !== enrollmentId),
      );
      await fetchAvailableStudents();
    } catch (err) {
      setError('Failed to remove enrollment');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-700"
      >
        ← Back to Classes
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Student Enrollments
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Student
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading enrollments...</p>
      ) : enrollments.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg">
          <p className="text-gray-600">No students enrolled in this class</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Enrolled At
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.enrollment_id}>
                  <td className="px-6 py-4">
                    {enrollment.student?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {enrollment.student?.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteEnrollment(enrollment.enrollment_id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1000] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Enroll Student
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Student
                </label>
                <select
                  name="student_id"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    formik.touched.student_id && formik.errors.student_id
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  onChange={formik.handleChange}
                  value={formik.values.student_id}
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
                {formik.touched.student_id && formik.errors.student_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.student_id}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEnrollment;
