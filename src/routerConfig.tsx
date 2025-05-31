import { Navigate, RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from './layout/AuthLayout';
import StudentLayout from './layout/StudentLayout';
import TeacherLayout from './layout/TeacherLayout';
import AdminLayout from './layout/AdminLayout';
import UnauthorizedLayout from './layout/UnauthorizedLayout';
import AdminStudent from './module/Admin/Student/Student';
import ClassAnnouncements from './module/Student/Classes/ClassAnnouncements';
import StudentExams from './module/Student/Exams/StudentExam';
import ExamInstructions from './module/Student/Exams/ExamInstructions';
import ExamInterface from './module/Student/Exams/ExamInterface';
import StudentResults from './module/Student/Results/StudentResult';
import ExamResultDetails from './module/Student/Results/ExamResultDetails';
import TeacherExamsList from './module/Teachers/Results/TeacherExamsList';
import ExamStudentsList from './module/Teachers/Results/ExamStudentsList';
import StudentAttemptDetails from './module/Teachers/Results/StudentAttemptDetails';
import AdminExamsList from './module/Admin/Results/AdminExamsList';
import AdminExamStudentsList from './module/Admin/Results/AdminExamStudentsList';
import AdminStudentAttemptDetails from './module/Admin/Results/AdminStudentAttemptDetails';
import AdminSubjectsList from './module/Admin/Classes/AdminSubjectsList';
import AdminSubjectStudents from './module/Admin/Classes/AdminSubjectStudents';
import AdminExamsLists from './module/Admin/Exams/AdminExamsLists';
import AdminExamQuestions from './module/Admin/Exams/AdminExamQuestions';
// Lazy load components
const SignIn = lazy(() => import('./module/Auth/SignIn'));
const StudentDashboard = lazy(
  () => import('./module/Student/Dashboard/Dashboard'),
);
const TeacherDashboard = lazy(
  () => import('./module/Teachers/Dashboard/Dashboard'),
);
const TeacherClasses = lazy(() => import('./module/Teachers/Classes/Classes'));
const TeacherExams = lazy(() => import('./module/Teachers/Exams/Exams'));
const ExamQuestions = lazy(
  () => import('./module/Teachers/Exams/ExamQuestions'),
);
const StudentEnrollment = lazy(
  () => import('./module/Teachers/Classes/StudentEnrollment'),
);
const AdminDashboard = lazy(() => import('./module/Admin/Dashboard/Dashboard'));
const AdminDepartment = lazy(
  () => import('./module/Admin/Department/Department'),
);
const StudentClasses = lazy(() => import('./module/Student/Classes/Classes'));
const AdminTeacher = lazy(() => import('./module/Admin/Teacher/Teacher'));

// New components for announcements
const ClassLayout = lazy(() => import('./module/Teachers/Classes/ClassLayout'));
const AnnouncementsTab = lazy(
  () => import('./module/Teachers/Classes/AnnouncementTab'),
);

const routes: RouteObject[] = [
  {
    path: '/',
    element: <SignIn />,
  },
  {
    path: 'auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'signin',
        element: <SignIn />,
      },
    ],
  },
  {
    path: 'student',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <StudentDashboard />,
      },
      {
        path: 'classes',
        children: [
          {
            index: true,
            element: <StudentClasses />,
          },
          {
            path: ':subjectId',
            element: <ClassAnnouncements />,
          },
        ],
      },
      {
        path: 'exams',
        children: [
          { index: true, element: <StudentExams /> },
          { path: ':examId/instructions', element: <ExamInstructions /> },
          { path: ':examId/take/:attemptId', element: <ExamInterface /> }, // Fixed path
        ],
      },
      {
        path: 'results',
        children: [
          {
            index: true,
            element: <StudentResults />,
          },
          {
            path: ':examId',
            element: <ExamResultDetails />,
          },
        ],
      },
    ],
  },
  {
    path: 'teacher',
    element: (
      <ProtectedRoute allowedRoles={['teacher']}>
        <TeacherLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <TeacherDashboard />,
      },
      {
        path: 'classes',
        children: [
          {
            index: true,
            element: <TeacherClasses />,
          },
          {
            path: ':subjectId',
            element: <ClassLayout />,
            children: [
              {
                path: 'students',
                element: <StudentEnrollment />,
              },
              {
                path: 'announcements',
                element: <AnnouncementsTab />,
              },
              {
                index: true,
                element: <StudentEnrollment />,
              },
            ],
          },
        ],
      },
      {
        path: 'exams',
        element: <TeacherExams />,
      },
      {
        path: 'examquestions/:examId/students',
        element: <ExamQuestions />,
      },
      {
        path: 'results',
        children: [
          {
            index: true,
            element: <TeacherExamsList />,
          },
          {
            path: ':examId/students',
            element: <ExamStudentsList />,
          },
          {
            path: 'attempt/:attemptId',
            element: <StudentAttemptDetails />,
          },
        ],
      },
    ],
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'department',
        element: <AdminDepartment />,
      },
      {
        path: 'teachers',
        element: <AdminTeacher />,
      },
      {
        path: 'students',
        element: <AdminStudent />,
      },
      {
        path: 'results',
        children: [
          {
            index: true,
            element: <AdminExamsList />,
          },
          {
            path: ':examId/students',
            element: <AdminExamStudentsList />,
          },
          {
            path: 'attempt/:attemptId',
            element: <AdminStudentAttemptDetails />,
          },
        ],
      },
      {
        path: 'classes',
        children: [
          {
            index: true,
            element: <AdminSubjectsList />,
          },
          {
            path: ':subjectId/students',
            element: <AdminSubjectStudents />,
          },
        ],
      },
      {
        path: 'exams',
        children: [
          {
            index: true,
            element: <AdminExamsLists />,
          },
          {
            path: ':examId/questions',
            element: <AdminExamQuestions />,
          },
        ],
      },
    ],
  },
  {
    path: 'unauthorized',
    element: <UnauthorizedLayout />,
  },
  {
    path: '*',
    element: <Navigate to="/auth/signin" replace />,
  },
];

export default routes;
