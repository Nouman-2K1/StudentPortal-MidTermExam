import React from 'react';
import StudentDefaultLayout from './StudentDefaultLayout';
import { Outlet } from 'react-router-dom';

const StudentLayout: React.FC = () => {
  return (
    <StudentDefaultLayout>
      <Outlet />
    </StudentDefaultLayout>
  );
};

export default StudentLayout;
