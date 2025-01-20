import React from 'react';
import AdminDefaultLayout from './AdminDefaultLayout';
import { Outlet } from 'react-router-dom';

const UserLayout: React.FC = () => {
  return (
    <AdminDefaultLayout>
      <Outlet />
    </AdminDefaultLayout>
  );
};

export default UserLayout;
