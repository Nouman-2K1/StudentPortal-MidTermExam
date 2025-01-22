import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../../context/UserContext';
import {
  Student,
  Teacher,
  Admin,
  UserType,
} from '../../Interface/User.interface';
import Logo from '../../images/logo/logo.png';

interface SignInValues {
  email: string;
  password: string;
  role: 'admin' | 'student' | 'teacher';
}

// Define response interfaces for each role
interface AdminResponse {
  adminToken: string;
  admindata: Admin;
}

interface TeacherResponse {
  teacherToken: string;
  teacherdata: Teacher;
}

interface StudentResponse {
  studentToken: string;
  studentdata: Student;
}

type AuthResponse = AdminResponse | TeacherResponse | StudentResponse;

const SignIn: React.FC = () => {
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const initialValues: SignInValues = {
    email: '',
    password: '',
    role: 'student',
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    role: Yup.string()
      .oneOf(['admin', 'student', 'teacher'] as const, 'Invalid role')
      .required('Role is required'),
  });

  const extractUserData = (response: any, role: string): UserType => {
    let userData: UserType;

    switch (role) {
      case 'admin':
        userData = {
          ...response.admindata,
          token: response.adminToken,
        } as Admin;
        break;
      case 'teacher':
        userData = {
          ...response.teacherdata,
          token: response.teacherToken,
        } as Teacher;
        break;
      case 'student':
        userData = {
          ...response.studentdata,
          token: response.studentToken,
        } as Student;
        break;
      default:
        throw new Error('Invalid role specified');
    }

    return userData;
  };

  const validateUserData = (data: any, role: string): boolean => {
    const baseFields = ['name', 'email', 'role'];
    const hasBaseFields = baseFields.every((field) => field in data);

    if (!hasBaseFields) {
      console.error(
        'Missing base fields:',
        baseFields.filter((field) => !(field in data)),
      );
      return false;
    }

    switch (role) {
      case 'student':
        return (
          'student_id' in data &&
          'roll_number' in data &&
          'department_id' in data &&
          'semester' in data &&
          'admission_year' in data &&
          'current_year' in data &&
          'active_status' in data
        );
      case 'teacher':
        return 'teacher_id' in data && 'department_id' in data;
      case 'admin':
        return 'admin_id' in data;
      default:
        return false;
    }
  };

  const handleSignIn = async (values: SignInValues) => {
    setLoading(true);
    try {
      const response = await axios.post<AuthResponse>(
        `http://localhost:3301/auth/${values.role}/login`,
        values,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const userData = extractUserData(response.data, values.role);

      if (!validateUserData(userData, values.role)) {
        throw new Error(
          `Invalid ${values.role} data structure received from server`,
        );
      }

      setUser(userData);

      toast.success('Sign-in successful!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setTimeout(() => {
        navigate(`/${values.role}/dashboard`);
      }, 1000);
    } catch (error: any) {
      console.error('Sign-in error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Sign-in failed. Please try again.';

      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      style={{ height: '100vh' }}
    >
      <div className="flex flex-wrap items-center">
        <div className="hidden w-full xl:block xl:w-1/2">
          <div className="py-17.5 px-26 text-center">
            <Link className="mb-5.5 inline-block" to="/">
              <img className="dark:block" src={Logo} alt="Logo" width={100} />
            </Link>
            <h1 className="mb-3 text-4xl font-bold text-black dark:text-white">
              WAPDA POST GRADUATE COLLEGE
            </h1>
            <p className="2xl:px-20">Empowering Minds, Shaping Futures</p>
          </div>
        </div>

        <div
          className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2"
          style={{ height: '100vh' }}
        >
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Sign In to Exam Portal
            </h2>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSignIn}
            >
              {() => (
                <Form>
                  <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Role
                    </label>
                    <Field
                      as="select"
                      name="role"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </Field>
                    <ErrorMessage
                      name="role"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Password
                    </label>
                    <Field
                      type="password"
                      name="password"
                      placeholder="6+ Characters, 1 Capital letter"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div className="mb-5">
                    <button
                      type="submit"
                      className="w-full rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignIn;
