import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';

interface AttemptDetails {
  attempt: {
    Exam: {
      name: string;
      total_marks: number;
      Subject: {
        name: string;
      };
    };
    Student: {
      name: string;
      roll_number: string;
    };
    total_score: number;
    status: string;
  };
  responses: {
    response_id: string | number;
    question: {
      question_text: string;
      correct_option: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      [key: string]: any;
    };
    selected_option: string;
    is_correct: boolean;
  }[];
}

const StudentAttemptDetails: React.FC = () => {
  const { attemptId } = useParams();
  const { getTeacher } = useUser();
  const teacher = getTeacher();
  const [data, setData] = useState<AttemptDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        if (!teacher?.teacher_id || !attemptId) return;

        const response = await axios.get(
          `http://localhost:3301/auth/teacher/attempts/${attemptId}/details`,
          {
            headers: { Authorization: `Bearer ${teacher.token}` },
            withCredentials: true,
          },
        );

        if (!response.data.responses) {
          setData({ ...response.data, responses: [] });
        } else {
          setData(response.data);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.error || 'Failed to fetch attempt details',
          );
        } else {
          setError('Failed to fetch attempt details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attemptId, teacher]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
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
            Back to Results
          </button>

          {data && (
            <>
              <h1 className="text-2xl font-bold text-gray-800">
                {data.attempt.Exam.name} - Student Responses
              </h1>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                <div>
                  <span className="font-medium">Student:</span>{' '}
                  {data.attempt.Student.name}
                </div>
                <div>
                  <span className="font-medium">Roll Number:</span>{' '}
                  {data.attempt.Student.roll_number}
                </div>
                <div>
                  <span className="font-medium">Score:</span>{' '}
                  {data.attempt.total_score}/{data.attempt.Exam.total_marks}
                </div>
                <div>
                  <span className="font-medium">Subject:</span>{' '}
                  {data.attempt.Exam.Subject.name}
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      data.attempt.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : data.attempt.status === 'disqualified'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {data.attempt.status}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        ) : data && data.responses.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Question Responses
            </h2>
            <div className="space-y-8">
              {data.responses.map((response, index) => (
                <div
                  key={response.response_id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start">
                    <div className="bg-gray-200 text-gray-700 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {response.question.question_text}
                    </h3>
                  </div>

                  <div className="mt-4">
                    {!response.is_correct && (
                      <div className="mb-3">
                        <div className="font-medium text-red-700 mb-1">
                          Student's Answer:
                        </div>
                        <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700">
                          <div className="flex items-start">
                            <span className="font-medium mr-2">
                              {response.selected_option}:
                            </span>
                            <span>
                              {
                                response.question[
                                  `option_${response.selected_option.toLowerCase()}`
                                ]
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="font-medium text-green-700 mb-1">
                        Correct Answer:
                      </div>
                      <div className="p-3 bg-green-50 border border-green-300 rounded-lg text-green-700">
                        <div className="flex items-start">
                          <span className="font-medium mr-2">
                            {response.question.correct_option}:
                          </span>
                          <span>
                            {
                              response.question[
                                `option_${response.question.correct_option.toLowerCase()}`
                              ]
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center">
                    <span className="font-medium mr-2">Result:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        response.is_correct
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {response.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            No responses found for this attempt
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttemptDetails;
