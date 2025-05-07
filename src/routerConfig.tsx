import { Navigate, RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from './layout/AuthLayout';
import StudentLayout from './layout/StudentLayout';
import TeacherLayout from './layout/TeacherLayout';
import AdminLayout from './layout/AdminLayout';
import UnauthorizedLayout from './layout/UnauthorizedLayout';
import AdminStudent from './module/Admin/Student/Student';

// Lazy load components for better performance
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
        element: <StudentClasses />,
      },
      // Add more student routes here
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
        element: <TeacherClasses />,
      },
      {
        path: 'classes/:subjectId/students',
        element: <StudentEnrollment />,
      },
      {
        path: 'exams',
        element: <TeacherExams />,
      },
      {
        path: 'examquestions/:examId/students',
        element: <ExamQuestions />,
      },
      // Add more teacher routes here
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
      // Add more admin routes here
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
