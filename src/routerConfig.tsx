import { Navigate, RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from './layout/AuthLayout';
import StudentLayout from './layout/StudentLayout';
import TeacherLayout from './layout/TeacherLayout';
import AdminLayout from './layout/AdminLayout';
import UnauthorizedLayout from './layout/UnauthorizedLayout';

// Lazy load components for better performance
const SignIn = lazy(() => import('./module/Auth/SignIn'));
const StudentDashboard = lazy(
  () => import('./module/Student/Dashboard/Dashboard'),
);
const TeacherDashboard = lazy(
  () => import('./module/Teachers/Dashboard/Dashboard'),
);
const AdminDashboard = lazy(() => import('./module/Admin/Dashboard/Dashboard'));

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
