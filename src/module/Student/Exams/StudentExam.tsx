import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';

interface Exam {
  exam_id: number;
  name: string;
  total_marks: number;
  duration_minutes: number;
  scheduled_time: string;
  Subject: { name: string };
  Teacher: { name: string };
}

const StudentExams: React.FC = () => {
  const { getStudent } = useUser();
  const student = getStudent();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'past'>(
    'upcoming',
  );
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        if (!student?.student_id) {
          setError('Student not found in context');
          return;
        }

        const response = await axios.get(
          `http://localhost:3301/auth/student/${student.student_id}/exams?status=${activeTab}`,
        );
        setExams(response.data);
      } catch (err) {
        setError(`Failed to fetch ${activeTab} exams`);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [student?.student_id, activeTab]);

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.scheduled_time);
    const endTime = new Date(
      startTime.getTime() + exam.duration_minutes * 60000,
    );

    if (now < startTime) return 'upcoming';
    if (now <= endTime) return 'ongoing';
    return 'past';
  };

  const ExamTimer = ({ exam }: { exam: Exam }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const status = getExamStatus(exam);

    useEffect(() => {
      const updateTimer = () => {
        const now = new Date();
        const startTime = new Date(exam.scheduled_time);
        const endTime = new Date(
          startTime.getTime() + exam.duration_minutes * 60000,
        );

        let diff = 0;
        if (status === 'upcoming') diff = startTime.getTime() - now.getTime();
        if (status === 'ongoing') diff = endTime.getTime() - now.getTime();

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

          if (status === 'upcoming')
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
          if (status === 'ongoing')
            setTimeLeft(`${hours}h ${minutes}m remaining`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }, [exam, status]);

    return (
      <div
        className={`text-lg font-semibold ${
          status === 'upcoming'
            ? 'text-blue-600'
            : status === 'ongoing'
            ? 'text-green-600'
            : 'text-gray-500'
        }`}
      >
        {status === 'past' ? 'Exam Ended' : timeLeft}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Exams</h1>
          <div className="flex gap-4 border-b">
            {['upcoming', 'ongoing', 'past'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-t-lg ${
                  activeTab === tab
                    ? 'bg-white border-x border-t text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Exams
              </button>
            ))}
          </div>
        </div>

        {!student ? (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
            Please log in as a student to view exams
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading {activeTab} exams...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        ) : exams.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow-sm text-center text-gray-500">
            No {activeTab} exams found
          </div>
        ) : (
          <div className="space-y-6">
            {exams.map((exam) => (
              <div
                key={exam.exam_id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      {exam.name}
                    </h2>
                    <div className="text-sm text-gray-500">
                      <p>Subject: {exam.Subject.name}</p>
                      <p>Conducted by: {exam.Teacher.name}</p>
                      <p>Total Marks: {exam.total_marks}</p>
                      <p>Duration: {exam.duration_minutes} minutes</p>
                    </div>
                  </div>
                  <ExamTimer exam={exam} />
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {new Date(exam.scheduled_time).toLocaleDateString()} -{' '}
                    {new Date(exam.scheduled_time).toLocaleTimeString()}
                  </p>
                  {getExamStatus(exam) === 'ongoing' && (
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      onClick={() => {
                        window.location.href = `/student/exams/${exam.exam_id}/instructions`;
                      }}
                    >
                      Start Exam
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExams;
