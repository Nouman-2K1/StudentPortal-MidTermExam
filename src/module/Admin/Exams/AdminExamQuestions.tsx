import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';

type Question = {
  question_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
};

const AdminExamQuestions: React.FC = () => {
  const { examId } = useParams();
  const { getAdmin } = useUser();
  const admin = getAdmin();
  const [examInfo, setExamInfo] = useState({
    name: '',
    subject_name: '',
    teacher_name: '',
    total_marks: 0,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!admin?.token || !examId) return;

        const response = await axios.get(
          `http://localhost:3301/auth/admin/exams/${examId}/questions`,
          {
            headers: { Authorization: `Bearer ${admin.token}` },
            withCredentials: true,
          },
        );

        setExamInfo({
          name: response.data.exam_name,
          subject_name: response.data.subject_name,
          teacher_name: response.data.teacher_name,
          total_marks: response.data.total_marks,
        });
        setQuestions(response.data.questions);
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
  }, [examId, admin]);

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
            Back to Exams
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Exam: {examInfo.name}
          </h1>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
            <div>
              <span className="font-medium">Subject:</span>{' '}
              {examInfo.subject_name}
            </div>
            <div>
              <span className="font-medium">Teacher:</span>{' '}
              {examInfo.teacher_name}
            </div>
            <div>
              <span className="font-medium">Total Marks:</span>{' '}
              {examInfo.total_marks}
            </div>
          </div>
          <p className="mt-4 text-gray-600">Exam Questions</p>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            No questions found for this exam
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question.question_id}
                  className="border border-gray-200 rounded-lg p-5"
                >
                  <div className="flex items-start mb-4">
                    <div className="bg-gray-200 text-gray-700 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {question.question_text}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-3 rounded-lg border ${
                        question.correct_option === 'a'
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <span className="font-medium mr-2">A:</span>{' '}
                      {question.option_a}
                    </div>
                    <div
                      className={`p-3 rounded-lg border ${
                        question.correct_option === 'b'
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <span className="font-medium mr-2">B:</span>{' '}
                      {question.option_b}
                    </div>
                    <div
                      className={`p-3 rounded-lg border ${
                        question.correct_option === 'c'
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <span className="font-medium mr-2">C:</span>{' '}
                      {question.option_c}
                    </div>
                    <div
                      className={`p-3 rounded-lg border ${
                        question.correct_option === 'd'
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <span className="font-medium mr-2">D:</span>{' '}
                      {question.option_d}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center">
                    <span className="font-medium mr-2">Correct Answer:</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {question.correct_option.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExamQuestions;
