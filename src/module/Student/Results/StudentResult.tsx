import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import { useNavigate } from 'react-router-dom';

interface Subject {
  name: string;
}

interface Teacher {
  name: string;
}

interface ExamResult {
  exam_id: number;
  name: string;
  total_marks: number;
  duration_minutes: number;
  scheduled_time: string;
  Subject: Subject;
  Teacher: Teacher;
  attempted: boolean;
  status: string;
  score: number;
}

const StudentResults: React.FC = () => {
  const { getStudent } = useUser();
  const student = getStudent();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!student?.student_id) {
          setError('Student not found in context');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:3301/auth/student/${student.student_id}/results`,
          {
            headers: {
              Authorization: `Bearer ${student?.token}`,
            },
            withCredentials: true,
          },
        );

        setResults(response.data);
      } catch (err) {
        setError('Failed to fetch your results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [student?.student_id, student?.token]);

  const handleViewResult = (examId: number) => {
    navigate(`/student/results/${examId}`);
  };

  const getStatusInfo = (status: string, attempted: boolean) => {
    switch (status) {
      case 'completed':
        return { text: 'Completed', color: 'bg-green-100 text-green-800' };
      case 'disqualified':
        return { text: 'Disqualified', color: 'bg-red-100 text-red-800' };
      default:
        return attempted
          ? { text: 'In Progress', color: 'bg-yellow-100 text-yellow-800' }
          : { text: 'Not Attempted', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Format date to display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Your Exam Results
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            View your completed exam results and performance
          </p>
        </div>

        {!student ? (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
            Please log in as a student to view results
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your results...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        ) : results.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow-sm text-center text-gray-500">
            No completed exams found. Check back after your exams have ended.
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {results.map((result) => {
              const statusInfo = getStatusInfo(result.status, result.attempted);
              const percentage = result.attempted
                ? Math.round((result.score / result.total_marks) * 100)
                : 0;

              return (
                <div
                  key={result.exam_id}
                  className="bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 md:p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-3 md:mb-4">
                    <div className="mb-3 md:mb-0">
                      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-1 md:mb-2">
                        {result.name}
                      </h2>
                      <div className="text-xs md:text-sm text-gray-500 space-y-1">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            <strong>Subject:</strong> {result.Subject.name}
                          </span>
                          <span>
                            <strong>Teacher:</strong> {result.Teacher.name}
                          </span>
                          <span>
                            <strong>Total Marks:</strong> {result.total_marks}
                          </span>
                          <span>
                            <strong>Duration:</strong> {result.duration_minutes}{' '}
                            mins
                          </span>
                        </div>
                        {result.attempted && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                            <span>
                              <strong>Your Score:</strong> {result.score}/
                              {result.total_marks}
                            </span>
                            <span>
                              <strong>Percentage:</strong> {percentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} self-start`}
                    >
                      {statusInfo.text}
                    </span>
                  </div>
                  <div className="border-t pt-3 md:pt-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-0">
                      {formatDate(result.scheduled_time)}
                    </p>
                    {result.attempted && (
                      <button
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base"
                        onClick={() => handleViewResult(result.exam_id)}
                      >
                        View Details
                      </button>
                    )}
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

export default StudentResults;
