import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type DashboardData = {
  totalStudents: number;
  totalTeachers: number;
  totalExams: number;
  totalSubjects: number;
  totalDepartments: number;
  recentExams: {
    exam_id: number;
    name: string;
    scheduled_time: string;
    subject_name: string;
  }[];
  examStats: {
    name: string;
    attempts: number;
    avg_score: number;
  }[];
};

const AdminDashboard: React.FC = () => {
  const { getAdmin } = useUser();
  const admin = getAdmin();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        if (!admin || !admin.token) {
          setError('Authentication required');
          return;
        }
        const response = await axios.get(
          'http://localhost:3301/auth/admin/dashboard',
          {
            headers: { Authorization: `Bearer ${admin.token}` },
            withCredentials: true,
          },
        );
        setData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.error || 'Failed to fetch dashboard data',
          );
        } else {
          setError('Failed to fetch dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [admin]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of the platform</p>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        ) : data ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <UserGroupIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Students</p>
                    <p className="text-2xl font-bold">{data.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <AcademicCapIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Teachers</p>
                    <p className="text-2xl font-bold">{data.totalTeachers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <BookOpenIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Subjects</p>
                    <p className="text-2xl font-bold">{data.totalSubjects}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <DocumentTextIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Exams</p>
                    <p className="text-2xl font-bold">{data.totalExams}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                    <AcademicCapIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Departments</p>
                    <p className="text-2xl font-bold">
                      {data.totalDepartments}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Exam Performance Chart */}
              {/* Exam Performance Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Exam Performance
                </h2>
                <div className="h-80">
                  {data.examStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.examStats}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-4 border border-gray-200 rounded-md shadow-lg">
                                  <p className="font-medium text-gray-900">{`Exam: ${label}`}</p>
                                  <div className="mt-2">
                                    <p className="text-indigo-600">
                                      <span className="font-medium">
                                        Attempts:
                                      </span>{' '}
                                      {payload[0].value}
                                    </p>
                                    <p className="text-green-600">
                                      <span className="font-medium">
                                        Avg. Marks:
                                      </span>{' '}
                                      {payload[1].value}
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey="attempts"
                          name="Attempts"
                          fill="#4f46e5"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="avg_score"
                          name="Average Marks"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No exam data available
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Exams */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Upcoming Exams
                </h2>
                <div className="space-y-4">
                  {data.recentExams.length > 0 ? (
                    data.recentExams.map((exam) => (
                      <div
                        key={exam.exam_id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {exam.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {exam.subject_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="flex items-center text-sm text-gray-500">
                              <CalendarDaysIcon className="h-4 w-4 mr-1" />
                              {formatDate(exam.scheduled_time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No upcoming exams
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
