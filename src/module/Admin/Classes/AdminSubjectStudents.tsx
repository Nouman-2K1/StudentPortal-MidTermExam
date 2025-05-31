import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';

type Student = {
  student_id: number;
  name: string;
  roll_number: string;
  email: string;
  semester: number;
  admission_year: number;
};

const AdminSubjectStudents: React.FC = () => {
  const { subjectId } = useParams();
  const { getAdmin } = useUser();
  const admin = getAdmin();
  const [subjectInfo, setSubjectInfo] = useState({
    name: '',
    teacher_name: '',
    department_name: '',
    semester: 0,
    academic_year: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!admin?.token || !subjectId) return;

        const response = await axios.get(
          `http://localhost:3301/auth/admin/subjects/${subjectId}/students`,
          {
            headers: { Authorization: `Bearer ${admin.token}` },
            withCredentials: true,
          },
        );

        setSubjectInfo({
          name: response.data.subject_name,
          teacher_name: response.data.teacher_name,
          department_name: response.data.department_name,
          semester: response.data.semester,
          academic_year: response.data.academic_year,
        });
        setStudents(response.data.students);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to fetch data');
        } else {
          setError('Failed to fetch data');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectId, admin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Subjects
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Subject: {subjectInfo.name}
          </h1>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-600">
            <div>
              <span className="font-medium">Teacher:</span>{' '}
              {subjectInfo.teacher_name}
            </div>
            <div>
              <span className="font-medium">Department:</span>{' '}
              {subjectInfo.department_name}
            </div>
            <div>
              <span className="font-medium">Academic Year:</span>{' '}
              {subjectInfo.academic_year}
            </div>
            <div>
              <span className="font-medium">Semester:</span>{' '}
              {subjectInfo.semester}
            </div>
          </div>
          <p className="mt-4 text-gray-600">
            Students enrolled in this subject
          </p>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            No students enrolled in this subject
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.roll_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.admission_year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.semester}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubjectStudents;
