import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';

type Exam = {
  exam_id: number;
  name: string;
  scheduled_time: string;
  total_marks: number;
  Subject: {
    name: string;
  };
};

const TeacherExamsList: React.FC = () => {
  const { getTeacher } = useUser();
  const teacher = getTeacher();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError('');
        if (!teacher || !teacher.token || !teacher.teacher_id) {
          setError('Authentication required');
          return;
        }
        const response = await axios.get(
          `http://localhost:3301/auth/teacher/${teacher.teacher_id}/exams`,
          {
            headers: { Authorization: `Bearer ${teacher.token}` },
            withCredentials: true,
          },
        );
        setExams(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to fetch exams');
        } else {
          setError('Failed to fetch exams');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [teacher]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getExamStatus = (scheduledTime: string) => {
    return new Date() > new Date(scheduledTime) ? 'Completed' : 'Upcoming';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Exams</h1>
          <p className="text-gray-600">Manage and review your created exams</p>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            You haven't created any exams yet
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => {
              const { date, time } = formatDateTime(exam.scheduled_time);
              const status = getExamStatus(exam.scheduled_time);
              const statusClass =
                status === 'Completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800';

              return (
                <div
                  key={exam.exam_id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-1">
                        {exam.name}
                      </h2>
                      <p className="text-gray-600">{exam.Subject.name}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
                      >
                        {status}
                      </span>
                      <Link
                        to={`/teacher/results/${exam.exam_id}/students`}
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                      >
                        View Results
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{time}</span>
                    </div>
                    <div>
                      <span className="font-medium">Total Marks:</span>{' '}
                      {exam.total_marks}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherExamsList;
