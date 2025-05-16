import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import axios from 'axios';

interface ExamDetails {
  exam_id: number;
  name: string;
  total_marks: number;
  duration_minutes: number;
  scheduled_time: string;
  Subject: { name: string };
  Teacher: { name: string };
}

const ExamInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { getStudent } = useUser();
  const student = getStudent();
  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create axios instance with authentication
  const api = axios.create({
    baseURL: 'http://localhost:3301',
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${student?.token}`,
    },
  });

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        if (!student?.student_id) {
          setError('Student authentication required');
          return;
        }

        const response = await api.get(`/auth/student/exams/${examId}`);
        setExam(response.data);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || 'Failed to fetch exam details'
            : 'Failed to fetch exam details',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [examId, student?.student_id]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!student) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
        Please log in as a student to view exam details
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exam details...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        ) : exam ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {exam.name}
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="font-semibold">Subject:</p>
                  <p>{exam.Subject.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Conducted by:</p>
                  <p>{exam.Teacher.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Total Marks:</p>
                  <p>{exam.total_marks}</p>
                </div>
                <div>
                  <p className="font-semibold">Duration:</p>
                  <p>{formatDuration(exam.duration_minutes)}</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Important Instructions
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The exam must be taken in fullscreen mode</li>
                  <li>Do not switch tabs or windows during the exam</li>
                  <li>You will get 3 flags for suspicious activity </li>
                  <li>
                    If you switch tabs of exit full screen, You will get 1 flags
                    and on the 3rd flag you will be disqualified from the exam{' '}
                  </li>
                  <li>Use of external materials is strictly prohibited</li>
                  <li>Do not communicate with others during the exam</li>
                  <li>Technical issues must be reported immediately</li>
                </ul>
              </div>

              <button
                onClick={() => navigate(`/student/exams/${examId}/take`)}
                className="w-full py-3 text-white rounded-lg hover:bg-green-700 text-lg font-semibold"
                style={{ backgroundColor: '#025B7D' }}
              >
                Start Exam
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ExamInstructions;
