import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';

interface Subject {
  name: string;
}

interface Teacher {
  name: string;
}

interface Exam {
  exam_id: number;
  name: string;
  total_marks: number;
  duration_minutes: number;
  scheduled_time: string;
  Subject: Subject;
  Teacher: Teacher;
}

interface Attempt {
  started_at: string;
  submitted_at: string;
  total_score: number;
  status: string;
}

interface Question {
  question_id: number;
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: string;
  student_answer: string | null;
  is_correct: boolean;
}

interface Stats {
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  percentage: number;
}

const ExamResultDetails: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { getStudent } = useUser();
  const student = getStudent();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResultDetails = async () => {
      try {
        if (!student?.student_id || !examId) {
          setError('Student or exam not found');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:3301/auth/student/${student.student_id}/exams/${examId}/result-details`,
          {
            headers: { Authorization: `Bearer ${student?.token}` },
            withCredentials: true,
          },
        );

        setExam(response.data.exam);
        setAttempt(response.data.attempt);
        setQuestions(response.data.questions);
        setStats(response.data.stats);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch exam details');
      } finally {
        setLoading(false);
      }
    };

    fetchResultDetails();
  }, [student?.student_id, student?.token, examId]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'disqualified':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOptionClass = (question: Question, option: string) => {
    const baseClass = 'p-3 rounded-lg border ';

    if (option === question.correct_option) {
      return baseClass + 'border-green-500 bg-green-50';
    }

    if (option === question.student_answer) {
      return baseClass + 'border-red-500 bg-red-50';
    }

    return baseClass + 'border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Results
        </button>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exam details...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        ) : exam && attempt && stats ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {exam.name} - Result Details
                </h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Subject:</span>{' '}
                    {exam.Subject.name}
                  </p>
                  <p>
                    <span className="font-medium">Teacher:</span>{' '}
                    {exam.Teacher.name}
                  </p>
                  <p>
                    <span className="font-medium">Total Marks:</span>{' '}
                    {exam.total_marks}
                  </p>
                </div>
              </div>

              <div className="mt-4 md:mt-0 bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">
                  Performance Summary
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-green-100 rounded">
                    <p className="text-xl font-bold text-green-800">
                      {stats.correct_count}
                    </p>
                    <p className="text-sm text-green-700">Correct</p>
                  </div>
                  <div className="text-center p-2 bg-red-100 rounded">
                    <p className="text-xl font-bold text-red-800">
                      {stats.incorrect_count}
                    </p>
                    <p className="text-sm text-red-700">Incorrect</p>
                  </div>
                  <div className="text-center p-2 bg-blue-100 rounded col-span-2">
                    <p className="text-xl font-bold text-blue-800">
                      {stats.percentage}%
                    </p>
                    <p className="text-sm text-blue-700">Overall Score</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">
                  Exam Information
                </h3>
                <p>
                  <span className="text-gray-600">Date:</span>{' '}
                  {formatDate(exam.scheduled_time)}
                </p>
                <p>
                  <span className="text-gray-600">Duration:</span>{' '}
                  {exam.duration_minutes} minutes
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">
                  Attempt Information
                </h3>
                <p>
                  <span className="text-gray-600">Started:</span>{' '}
                  {formatDate(attempt.started_at)}
                </p>
                <p>
                  <span className="text-gray-600">Submitted:</span>{' '}
                  {formatDate(attempt.submitted_at)}
                </p>
                <p>
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      attempt.status,
                    )}`}
                  >
                    {attempt.status.charAt(0).toUpperCase() +
                      attempt.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Questions & Answers
              </h2>

              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div
                    key={question.question_id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start mb-4">
                      <div className="bg-gray-200 text-gray-700 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="font-medium text-gray-800">
                        {question.question_text}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <div
                          key={option}
                          className={getOptionClass(question, option)}
                        >
                          <div className="flex items-start">
                            <span className="font-medium mr-2">{option}:</span>
                            <span>
                              {
                                question.options[
                                  option as keyof typeof question.options
                                ]
                              }
                            </span>
                          </div>

                          {option === question.correct_option && (
                            <div className="mt-1 flex items-center text-green-600 text-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Correct Answer
                            </div>
                          )}

                          {option === question.student_answer &&
                            option !== question.correct_option && (
                              <div className="mt-1 flex items-center text-red-600 text-sm">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Your Answer
                              </div>
                            )}
                        </div>
                      ))}
                    </div>

                    {!question.student_answer && (
                      <div className="mt-3 p-2 bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 inline mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        You did not answer this question
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-lg shadow-sm text-center text-gray-500">
            No exam details found
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResultDetails;
