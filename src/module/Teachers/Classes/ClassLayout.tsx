// src/components/Teacher/ClassLayout.tsx
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ClassLayout = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();

  // Redirect to students tab by default
  useEffect(() => {
    if (subjectId) {
      navigate(`/teacher/classes/${subjectId}/students`, { replace: true });
    }
  }, [subjectId, navigate]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
        <div className="flex gap-4">
          <NavLink
            to={`/teacher/classes/${subjectId}/students`}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`
            }
          >
            Students
          </NavLink>
          <NavLink
            to={`/teacher/classes/${subjectId}/announcements`}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`
            }
          >
            Announcements
          </NavLink>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default ClassLayout;
