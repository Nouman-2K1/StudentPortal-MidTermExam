import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../images/logo/logo.png';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../../context/UserContext';
import User from '../../Interface/User.interface';

interface SignInValues {
  email: string;
  password: string;
}

interface SignInResponse {
  studentToken: string;
  studentdata: User;
}

const SignIn: React.FC = () => {
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const initialValues: SignInValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleSignIn = async (values: SignInValues) => {
    setLoading(true);
    try {
      const requestData = {
        ...values, // email and password
        role: 'student', // Add the role
      };
      const response = await axios.post<SignInResponse>(
        'http://localhost:3301/auth/student/login',
        requestData,
        {
          withCredentials: true,
        },
      );
      const { studentToken, studentdata } = response.data;

      setUser({ token: studentToken, ...studentdata });

      toast.success('Sign-in successful!');
      navigate('/user/dashboard');
    } catch (error: any) {
      console.error('Sign-in failed:', error);

      // Check if the error has a response and if it contains a message
      const errorMessage =
        error.response?.data?.error || 'Invalid credentials, please try again.';
      toast.error(errorMessage);
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
            <span className="mb-1.5 block font-medium">Student Portal</span>
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
