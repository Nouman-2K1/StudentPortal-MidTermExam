// components/Teacher/ExamQuestions.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { UserType, Teacher } from '../../../Interface/User.interface';

interface Question {
  question_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

const ExamQuestions: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const api = axios.create({
    baseURL: 'http://localhost:3301/auth/teacher',
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });

  const validationSchema = Yup.object({
    question_text: Yup.string().required('Question text is required'),
    option_a: Yup.string().required('Option A is required'),
    option_b: Yup.string().required('Option B is required'),
    option_c: Yup.string().required('Option C is required'),
    option_d: Yup.string().required('Option D is required'),
    correct_option: Yup.string()
      .required('Correct option is required')
      .oneOf(['A', 'B', 'C', 'D'], 'Invalid correct option'),
  });

  const formik = useFormik({
    initialValues: {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await api.post(`/exams/${examId}/questions`, values);
        setQuestions([...questions, response.data]);
        resetForm();
        setError('');
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error
            : 'Failed to create question',
        );
      }
    },
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get(`/exams/${examId}/questions`);
        setQuestions(response.data);
      } catch (err) {
        setError('Failed to fetch questions');
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [examId]);

  const deleteQuestion = async (questionId: number) => {
    try {
      await api.delete(`/exams/${examId}/questions/${questionId}`);
      setQuestions(questions.filter((q) => q.question_id !== questionId));
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Exam Questions</h1>

          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 hover:text-blue-700"
          >
            <br />← Back to Classes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Question Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text
                </label>
                <textarea
                  name="question_text"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    formik.touched.question_text && formik.errors.question_text
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                  rows={3}
                  value={formik.values.question_text}
                  onChange={formik.handleChange}
                />
                {formik.touched.question_text &&
                  formik.errors.question_text && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.question_text}
                    </p>
                  )}
              </div>

              {['A', 'B', 'C', 'D'].map((option) => (
                <div key={option}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option {option}
                  </label>
                  <input
                    name={`option_${option.toLowerCase()}`}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      formik.touched[
                        `option_${option.toLowerCase()}` as keyof typeof formik.touched
                      ] &&
                      formik.errors[
                        `option_${option.toLowerCase()}` as keyof typeof formik.errors
                      ]
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    value={
                      formik.values[
                        `option_${option.toLowerCase()}` as keyof typeof formik.values
                      ]
                    }
                    onChange={formik.handleChange}
                  />
                  {formik.touched[
                    `option_${option.toLowerCase()}` as keyof typeof formik.touched
                  ] &&
                    formik.errors[
                      `option_${option.toLowerCase()}` as keyof typeof formik.errors
                    ] && (
                      <p className="mt-1 text-sm text-red-600">
                        {
                          formik.errors[
                            `option_${option.toLowerCase()}` as keyof typeof formik.errors
                          ]
                        }
                      </p>
                    )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Option
                </label>
                <select
                  name="correct_option"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    formik.touched.correct_option &&
                    formik.errors.correct_option
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                  value={formik.values.correct_option}
                  onChange={formik.handleChange}
                >
                  <option value="">Select Correct Option</option>
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <option key={option} value={option}>
                      Option {option}
                    </option>
                  ))}
                </select>
                {formik.touched.correct_option &&
                  formik.errors.correct_option && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.correct_option}
                    </p>
                  )}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Question
              </button>
            </form>
          </div>

          {/* Questions Preview */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              Questions Preview ({questions.length})
            </h2>
            {loading ? (
              <p className="text-center text-gray-600">Loading questions...</p>
            ) : questions.length === 0 ? (
              <p className="text-gray-600">No questions added yet</p>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.question_id} className="border-b pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{question.question_text}</h3>
                      <button
                        onClick={() => deleteQuestion(question.question_id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <div
                          key={option}
                          className={`p-2 rounded ${
                            question.correct_option === option
                              ? 'bg-green-100 border border-green-300'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">Option {option}:</span>{' '}
                          {
                            question[
                              `option_${option.toLowerCase()}` as
                                | 'option_a'
                                | 'option_b'
                                | 'option_c'
                                | 'option_d'
                            ]
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamQuestions;
