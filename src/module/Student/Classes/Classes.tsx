import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import { UserType, Student } from '../../../Interface/User.interface';
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

const StudentClasses: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();

  // Type guard to check if user is Student
  const isStudent = (user: UserType | null): user is Student =>
    user?.role === 'student';

  const api = axios.create({
    baseURL: 'http://localhost:3301',
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });

  // Fetch departments for department name lookup
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

  // Fetch enrolled subjects
  useEffect(() => {
    const fetchStudentSubjects = async () => {
      if (!isStudent(user) || !user.student_id) return;
      try {
        const response = await api.get(
          `/auth/student/student/${user.student_id}/enrolled-classes`,
        );
        setSubjects(response.data);
      } catch (err) {
        setError('Failed to fetch enrolled classes');
      }
      setLoading(false);
    };
    fetchStudentSubjects();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading classes...</p>
      ) : subjects.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg">
          <p className="text-gray-600">
            You are not enrolled in any classes yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Link
              to={`/student/classes/${subject.subject_id}`}
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
    </div>
  );
};

export default StudentClasses;
