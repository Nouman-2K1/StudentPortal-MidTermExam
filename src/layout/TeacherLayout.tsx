import React from 'react';
import TeacherDefaultLayout from './TeacherDefaultLayout';
import { Outlet } from 'react-router-dom';

const UserLayout: React.FC = () => {
  return (
    <TeacherDefaultLayout>
      <Outlet />
    </TeacherDefaultLayout>
  );
};

export default UserLayout;
