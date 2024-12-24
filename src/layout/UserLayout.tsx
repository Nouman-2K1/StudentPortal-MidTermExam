import React from 'react';
import DefaultLayout from './DefaultLayout';
import { Outlet } from 'react-router-dom';

const UserLayout: React.FC = () => {
  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
};

export default UserLayout;
