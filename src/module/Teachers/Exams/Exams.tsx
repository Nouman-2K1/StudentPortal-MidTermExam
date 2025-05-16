import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useUser } from '../../../context/UserContext';
import { UserType, Teacher } from '../../../Interface/User.interface';
import { Link } from 'react-router-dom';

interface Exam {
  exam_id: number;
  subject_id: number;
  name: string;
  total_marks: number;
  duration_minutes: number;
  scheduled_time: string;
  academic_year: number;
}

interface Subject {
  subject_id: number;
  name: string;
}

const TeacherExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteExamId, setDeleteExamId] = useState<number | null>(null);

  const isTeacher = (user: UserType | null): user is Teacher =>
    user?.role === 'teacher';

  const api = axios.create({
    baseURL: 'http://localhost:3301',
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        if (isTeacher(user)) {
          const response = await api.get<Subject[]>(
            `/auth/teacher/teacher/${user.teacher_id}/classes`,
          );
          setSubjects(response.data);
        }
      } catch (err) {
        setError('Failed to fetch subjects');
      }
    };
    fetchSubjects();
  }, [user]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        if (isTeacher(user)) {
          const response = await api.get<Exam[]>(
            `/auth/teacher/teacher/${user.teacher_id}/exams`,
          );
          setExams(response.data);
        }
      } catch (err) {
        setError('Failed to fetch exams');
      }
      setLoading(false);
    };
    fetchExams();
  }, [user]);

  const validationSchema = Yup.object({
    name: Yup.string().required('Exam name is required'),
    subject_id: Yup.number().required('Subject is required'),
    total_marks: Yup.number().min(1, 'Must be at least 1').required(),
    duration_minutes: Yup.number().min(1, 'Must be at least 1').required(),
    scheduled_time: Yup.string().required('Scheduled time is required'),
    academic_year: Yup.number().min(2000).max(2100).required(),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      subject_id: '',
      total_marks: '',
      duration_minutes: '',
      scheduled_time: '',
      academic_year: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (!isTeacher(user)) throw new Error('User is not a teacher');

        const response = await api.post<Exam>(
          `/auth/teacher/teacher/${user.teacher_id}/exams`,
          {
            ...values,
            subject_id: Number(values.subject_id),
            total_marks: Number(values.total_marks),
            duration_minutes: Number(values.duration_minutes),
            academic_year: Number(values.academic_year),
          },
        );

        setExams([...exams, response.data]);
        resetForm();
        setShowModal(false);
        setError('');
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error
            : 'Failed to create exam',
        );
      }
    },
  });

  const deleteExam = async () => {
    if (!deleteExamId || !isTeacher(user)) return;

    try {
      await api.delete(
        `/auth/teacher/teacher/${user.teacher_id}/exams/${deleteExamId}`,
      );
      setExams(exams.filter((exam) => exam.exam_id !== deleteExamId));
      setError('');
    } catch (err) {
      setError('Failed to delete exam. Please try again.');
    } finally {
      setDeleteExamId(null);
      setShowDeleteConfirmation(false);
    }
  };
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Exams</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Exam
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading exams...</p>
      ) : exams.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg">
          <p className="text-gray-600">
            No exams found. Create your first exam!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.exam_id}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Wrap only the clickable content in Link */}
              <Link
                to={`/teacher/examquestions/${exam.exam_id}/students`}
                className="block hover:no-underline"
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  {exam.name}
                </h3>
                <div className="space-y-1 text-gray-600">
                  <p className="text-sm">
                    <span className="font-medium">Subject:</span>{' '}
                    {subjects.find((s) => s.subject_id === exam.subject_id)
                      ?.name || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Total Marks:</span>{' '}
                    {exam.total_marks}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Duration:</span>{' '}
                    {exam.duration_minutes} mins
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Scheduled:</span>{' '}
                    {formatDateTime(exam.scheduled_time)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Academic Year:</span>{' '}
                    {exam.academic_year}
                  </p>
                </div>
              </Link>

              {/* Place delete button OUTSIDE the Link */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteExamId(exam.exam_id);
                  setShowDeleteConfirmation(true);
                }}
                className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium absolute top-2 right-4"
              >
                Delete Exam
              </button>
            </div>
          ))}
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-[1000] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this exam? This action cannot be
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
                onClick={deleteExam}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[1000] bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md my-8 mx-4 relative">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                Create New Exam
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-6">
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Name
                  </label>
                  <input
                    name="name"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      formik.touched.name && formik.errors.name
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    name="subject_id"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      formik.touched.subject_id && formik.errors.subject_id
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    value={formik.values.subject_id}
                    onChange={formik.handleChange}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option
                        key={subject.subject_id}
                        value={subject.subject_id}
                      >
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.subject_id && formik.errors.subject_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.subject_id}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      name="total_marks"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        formik.touched.total_marks && formik.errors.total_marks
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      value={formik.values.total_marks}
                      onChange={formik.handleChange}
                    />
                    {formik.touched.total_marks &&
                      formik.errors.total_marks && (
                        <p className="mt-1 text-sm text-red-600">
                          {formik.errors.total_marks}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (mins)
                    </label>
                    <input
                      type="number"
                      name="duration_minutes"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        formik.touched.duration_minutes &&
                        formik.errors.duration_minutes
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      value={formik.values.duration_minutes}
                      onChange={formik.handleChange}
                    />
                    {formik.touched.duration_minutes &&
                      formik.errors.duration_minutes && (
                        <p className="mt-1 text-sm text-red-600">
                          {formik.errors.duration_minutes}
                        </p>
                      )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_time"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      formik.touched.scheduled_time &&
                      formik.errors.scheduled_time
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    value={formik.values.scheduled_time}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.scheduled_time &&
                    formik.errors.scheduled_time && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.scheduled_time}
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
                    className={`w-full px-4 py-2 rounded-lg border ${
                      formik.touched.academic_year &&
                      formik.errors.academic_year
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    value={formik.values.academic_year}
                    onChange={formik.handleChange}
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
                    className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Exam
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

export default TeacherExams;
