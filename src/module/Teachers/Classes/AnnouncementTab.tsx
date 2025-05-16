// src/components/Teacher/AnnouncementsTab.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Announcement,
  CreateAnnouncementDTO,
} from '../../../Interface/announcement.interface';

const AnnouncementsTab: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const api = axios.create({
    baseURL: 'http://localhost:3301',
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get<Announcement[]>(
        `/announcement/${subjectId}`,
      );
      setAnnouncements(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching announcements:', err);
      setError(
        err.response?.data?.error ||
          'Failed to load announcements. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchAnnouncements();
    }
  }, [subjectId]);

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    content: Yup.string().required('Content is required'),
  });

  const formik = useFormik<CreateAnnouncementDTO>({
    initialValues: {
      title: '',
      content: '',
      subject_id: subjectId ? parseInt(subjectId, 10) : 0,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setSubmitLoading(true);
        setError('');

        // Log the submission values
        console.log('Submitting announcement with values:', values);

        await api.post('/announcement', {
          ...values,
          subject_id: parseInt(subjectId || '0', 10),
        });

        await fetchAnnouncements();
        resetForm();
      } catch (err: any) {
        console.error('Error creating announcement:', err);
        setError(
          err.response?.data?.error ||
            'Failed to create announcement. Please try again.',
        );
      } finally {
        setSubmitLoading(false);
      }
    },
  });

  const handleDelete = async (announcementId: number) => {
    try {
      setDeleteLoading(announcementId);
      setError('');

      await api.delete(`/announcement/${announcementId}`);

      setAnnouncements(
        announcements.filter((a) => a.announcement_id !== announcementId),
      );
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      setError(
        err.response?.data?.error ||
          'Failed to delete announcement. Please try again.',
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Announcement Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">New Announcement</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <input
              name="title"
              placeholder="Title"
              className={`w-full p-2 border rounded ${
                formik.touched.title && formik.errors.title
                  ? 'border-red-500'
                  : ''
              }`}
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={submitLoading}
            />
            {formik.touched.title && formik.errors.title && (
              <div className="text-red-500 text-sm">{formik.errors.title}</div>
            )}
          </div>

          <div>
            <textarea
              name="content"
              placeholder="Content"
              className={`w-full p-2 border rounded h-32 ${
                formik.touched.content && formik.errors.content
                  ? 'border-red-500'
                  : ''
              }`}
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={submitLoading}
            />
            {formik.touched.content && formik.errors.content && (
              <div className="text-red-500 text-sm">
                {formik.errors.content}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              submitLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={submitLoading}
          >
            {submitLoading ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="text-center p-8 bg-white rounded-lg">
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg">
          <p className="text-gray-600">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.announcement_id}
              className="bg-white p-6 rounded-lg shadow-sm relative"
            >
              <button
                onClick={() => handleDelete(announcement.announcement_id)}
                className={`absolute top-4 right-4 text-red-600 hover:text-red-700 ${
                  deleteLoading === announcement.announcement_id
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                disabled={deleteLoading === announcement.announcement_id}
              >
                {deleteLoading === announcement.announcement_id
                  ? 'Deleting...'
                  : 'Delete'}
              </button>
              <h3 className="text-lg font-semibold mb-2">
                {announcement.title}
              </h3>
              <p className="text-gray-600 mb-4">{announcement.content}</p>
              <div className="text-sm text-gray-500">
                <span>Posted by {announcement.teacher_name}</span>
                <span className="mx-2">•</span>
                <span>
                  {new Date(announcement.created_at).toLocaleDateString()}
                </span>
                <span className="mx-2">•</span>
                <span>{announcement.subject_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
    </div>
  );
};

export default AnnouncementsTab;
