import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import {
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  FlagIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

interface Exam {
  exam_id: number;
  name: string;
  scheduled_time: string;
  Subject: { name: string };
  student_count: number;
}

interface Announcement {
  announcement_id: number;
  title: string;
  content: string;
  created_at: string;
  Subject: { name: string };
}

interface Flag {
  flag_id: number;
  flag_type: string;
  flagged_at: string;
  reason: string;
  ExamAttempt: {
    Exam: { name: string };
    Student: { name: string };
  };
}

const TeacherDashboard: React.FC = () => {
  const { getTeacher } = useUser();
  const teacher = getTeacher();
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    Announcement[]
  >([]);
  const [recentFlags, setRecentFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    upcomingExamsCount: 0,
    totalStudents: 0,
    pendingFlags: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!teacher?.teacher_id) return;

        const response = await axios.get(
          `http://localhost:3301/auth/teacher/${teacher.teacher_id}/dashboard`,
          {
            headers: { Authorization: `Bearer ${teacher?.token}` },
            withCredentials: true,
          },
        );

        setUpcomingExams(response.data.upcomingExams);
        setRecentAnnouncements(response.data.recentAnnouncements);
        setRecentFlags(response.data.recentFlags);
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [teacher?.teacher_id, teacher?.token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Welcome back, Professor {teacher?.name}!
          </h1>
          <p className="text-gray-600">
            Here's your teaching overview for today
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Your Subjects</p>
                  <p className="text-xl font-bold">{stats.totalSubjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Upcoming Exams</p>
                  <p className="text-xl font-bold">
                    {stats.upcomingExamsCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Exams */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Your Upcoming Exams
              </h2>
            </div>

            {upcomingExams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AcademicCapIcon className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4">No upcoming exams scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingExams.map((exam) => (
                  <div
                    key={exam.exam_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {exam.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {exam.Subject.name} • {exam.student_count} students
                        </p>
                      </div>
                      <Link
                        to={`/teacher/exams/${exam.exam_id}/manage`}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                      >
                        Manage
                      </Link>
                    </div>

                    <div className="flex items-center mt-3 text-sm text-gray-500">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      <span className="mr-4">
                        {formatDate(exam.scheduled_time)}
                      </span>

                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{formatTime(exam.scheduled_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Flags */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Flags</h2>
            </div>

            {recentFlags.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FlagIcon className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4">No flags requiring attention</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFlags.map((flag) => (
                  <div
                    key={flag.flag_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {flag.ExamAttempt.Exam.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {flag.ExamAttempt.Student.name} • {flag.flag_type}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm">
                        {formatDate(flag.flagged_at)}
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-600">{flag.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 gap-6 mt-6">
          {/* Recent Announcements */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Your Recent Announcements
              </h2>
            </div>

            {recentAnnouncements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4">No announcements created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAnnouncements.map((announcement) => (
                  <div
                    key={announcement.announcement_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-800">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {announcement.content}
                    </p>

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {announcement.Subject.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(announcement.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/teacher/classes"
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200"
            >
              <BookOpenIcon className="h-10 w-10 text-blue-600 mb-2" />
              <span>My Subjects</span>
            </Link>

            <Link
              to="/teacher/exams"
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200"
            >
              <ClipboardDocumentListIcon className="h-10 w-10 text-green-600 mb-2" />
              <span>Create Exam</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
