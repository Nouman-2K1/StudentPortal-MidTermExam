// ClassAnnouncements.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import { UserType, Student } from '../../../Interface/User.interface';

interface Announcement {
  announcement_id: number;
  title: string;
  content: string;
  created_at: string;
  teacher: {
    name: string;
  };
}

const ClassAnnouncements: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();

  const api = axios.create({
    baseURL: 'http://localhost:3301',
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get(
          `/auth/student/subject/${subjectId}/announcements`,
        );
        setAnnouncements(response.data);
      } catch (err) {
        setError('Failed to fetch announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [subjectId]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            Class Announcements
          </h1>
          <Link
            to="/student/classes"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Classes
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        ) : announcements.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow-sm text-center text-gray-500">
            No announcements available for this class
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <div
                key={announcement.announcement_id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      {announcement.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Posted by {announcement.teacher.name} •{' '}
                      {new Date(announcement.created_at).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassAnnouncements;
