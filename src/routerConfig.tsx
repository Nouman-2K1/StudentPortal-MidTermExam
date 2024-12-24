// routesConfig.js
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from './layout/AuthLayout';
import UserLayout from './layout/UserLayout';
import UnauthorizedLayout from './layout/UnauthorizedLayout';
import SignIn from './module/Auth/SignIn';

import Dashboard from './module/Users/Dashboard/Dashboard';

const routes = [
  {
    path: '/',
    element: <SignIn />,
  },
  {
    path: 'auth',
    element: <AuthLayout />,
    children: [{ path: 'signin', element: <SignIn /> }],
  },
  {
    path: 'user',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="dashboard" /> },
      { path: 'dashboard', element: <Dashboard /> },
    ],
  },
  {
    path: 'unauthorized',
    element: <UnauthorizedLayout />,
  },
];

export default routes;
