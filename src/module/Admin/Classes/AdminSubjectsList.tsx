import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';

type Subject = {
  subject_id: number;
  name: string;
  semester: number;
  academic_year: number;
  Teacher: {
    name: string;
    email: string;
  };
  Department: {
    name: string;
  };
};

const AdminSubjectsList: React.FC = () => {
  const { getAdmin } = useUser();
  const admin = getAdmin();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError('');
        if (!admin || !admin.token) {
          setError('Authentication required');
          return;
        }
        const response = await axios.get(
          'http://localhost:3301/auth/admin/subjects',
          {
            headers: { Authorization: `Bearer ${admin.token}` },
            withCredentials: true,
          },
        );
        setSubjects(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to fetch subjects');
        } else {
          setError('Failed to fetch subjects');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [admin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Classes</h1>
          <p className="text-gray-600">
            Review all subjects across the platform
          </p>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            No subjects found
          </div>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject) => (
              <div
                key={subject.subject_id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">
                      {subject.name}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Teacher:</span>{' '}
                        {subject.Teacher.name}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span>{' '}
                        {subject.Department.name}
                      </div>
                      <div>
                        <span className="font-medium">Academic Year:</span>{' '}
                        {subject.academic_year}
                      </div>
                      <div>
                        <span className="font-medium">Semester:</span>{' '}
                        {subject.semester}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>{' '}
                        {subject.Teacher.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Link
                      to={`/admin/classes/${subject.subject_id}/students`}
                      className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      View Students
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubjectsList;
