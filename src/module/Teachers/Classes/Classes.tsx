import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useUser } from '../../../context/UserContext';
import { UserType, Teacher } from '../../../Interface/User.interface'; // Import your types
import { Link } from 'react-router-dom';

interface Subject {
  subject_id: number;
  name: string;
  department_id: number;
  semester: number;
  academic_year: number;
  teacher_id: number;
  created_at?: string;
}

interface Department {
  department_id: number;
  name: string;
}

const TeacherClasses: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteSubjectId, setDeleteSubjectId] = useState<number | null>(null);
  // Type guard to check if user is Teacher
  const isTeacher = (user: UserType | null): user is Teacher =>
    user?.role === 'teacher';

  const api = axios.create({
    baseURL: 'http://localhost:3301',
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });

  // Fetch departments for dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/department/get');
        setDepartments(response.data);
      } catch (err) {
        setError('Failed to fetch departments');
      }
    };
    fetchDepartments();
  }, []);

  // Fetch subjects
  useEffect(() => {
    const fetchTeacherSubjects = async () => {
      if (!isTeacher(user) || !user.teacher_id) return;
      try {
        const response = await api.get(
          `/auth/teacher/teacher/${user.teacher_id}/classes`,
        );
        setSubjects(response.data);
      } catch (err) {
        setError('Failed to fetch subjects');
      }
      setLoading(false);
    };
    fetchTeacherSubjects();
  }, []);

  // Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Class name is required'),
    department_id: Yup.number()
      .required('Department is required')
      .typeError('Please select a department'),
    semester: Yup.number()
      .min(1, 'Semester must be at least 1')
      .max(8, 'Semester cannot exceed 8')
      .required('Semester is required'),
    academic_year: Yup.number()
      .min(2000, 'Year must be after 2000')
      .max(2100, 'Year cannot exceed 2100')
      .required('Academic year is required'),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: '',
      department_id: '',
      semester: '',
      academic_year: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (!isTeacher(user)) {
          throw new Error('User is not a teacher');
        }

        const response = await api.post('/auth/teacher/createclasses', {
          name: values.name,
          department_id: Number(values.department_id),
          semester: Number(values.semester),
          academic_year: Number(values.academic_year),
          teacher_id: user.teacher_id, // Properly accessed teacher_id
        });

        setSubjects([...subjects, response.data]);
        resetForm();
        setShowModal(false);
        setError('');
      } catch (err) {
        setError(
          (axios.isAxiosError(err) && err.response?.data?.error) ||
            'Failed to create subject. Please try again.',
        );
      }
    },
  });

  const deleteSubject = async () => {
    if (!deleteSubjectId) return;

    try {
      await api.delete(`/auth/teacher/deleteclasses/${deleteSubjectId}`);
      setSubjects(
        subjects.filter((subject) => subject.subject_id !== deleteSubjectId),
      );
      setError('');
    } catch (err) {
      setError('Failed to delete subject. Please try again.');
    } finally {
      setDeleteSubjectId(null);
      setShowDeleteConfirmation(false);
    }
  };

  // Handle body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showModal]);
  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Class
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading classes...</p>
      ) : subjects.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg">
          <p className="text-gray-600">
            No classes found. Create your first class!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Link
              to={`/teacher/classes/${subject.subject_id}`}
              key={subject.subject_id}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  {subject.name}
                </h3>
                <div className="space-y-1 text-gray-600">
                  <p className="text-sm">
                    <span className="font-medium">Department:</span>{' '}
                    {departments.find(
                      (d) => d.department_id === subject.department_id,
                    )?.name || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Semester:</span>{' '}
                    {subject.semester}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Academic Year:</span>{' '}
                    {subject.academic_year}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDeleteSubjectId(subject.subject_id);
                    setShowDeleteConfirmation(true);
                  }}
                  className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete Class
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {showDeleteConfirmation && (
        <div
          className="fixed inset-0 z-[1000] bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setShowDeleteConfirmation(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this class? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={deleteSubject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Class
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Improved Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[1000] bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md my-8 mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                Create New Class
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
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

            <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-6">
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    name="name"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${
                      formik.touched.name && formik.errors.name
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department_id"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${
                      formik.touched.department_id &&
                      formik.errors.department_id
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    value={formik.values.department_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Select Department</option>
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
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.department_id}
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    name="semester"
                    min="1"
                    max="8"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${
                      formik.touched.semester && formik.errors.semester
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    value={formik.values.semester}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.semester && formik.errors.semester && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.semester}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="number"
                    name="academic_year"
                    min="2000"
                    max="2100"
                    placeholder="YYYY"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${
                      formik.touched.academic_year &&
                      formik.errors.academic_year
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    value={formik.values.academic_year}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.academic_year &&
                    formik.errors.academic_year && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.academic_year}
                      </p>
                    )}
                </div>

                <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-white pb-4 -mx-6 px-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 transition-colors"
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
