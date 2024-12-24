import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../../supabaseClient";
import logoicon from "../../images/logo/logoicon.png";

const ForgotPasswordRequestSent: React.FC = () => {
  const location = useLocation();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (resendDisabled && countdown > 0) {
      const id = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      setTimerId(id);
    } else {
      if (timerId) clearInterval(timerId);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [resendDisabled, countdown, timerId]);

  const handleResend = async () => {
    setResendDisabled(true);
    setCountdown(60);
    try {
      await supabase.auth.resetPasswordForEmail(location.state.email, {
        redirectTo: "http://localhost:5173/auth/reset-password",
      });
      toast.success("Password reset link sent!");
    } catch (error: unknown) {
      toast.error((error as Error).message);
      setResendDisabled(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 sm:p-8 ">
          <a
            href="#"
            className="flex flex-col items-center justify-center mb-4 text-2xl font-semibold text-gray-900 dark:text-white"
          >
            <img src={logoicon} alt="logo" className="logo" />
            <h1> WPGC Library Management SYSTEM</h1>
          </a>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Reset Password Request Sent
          </h1>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            An email has been sent to <strong>{location.state.email}</strong>{" "}
            with instructions to reset your password.
          </p>
          <div className="text-center">
            {resendDisabled ? (
              <button
                className="text-sm text-gray-600 hover:underline dark:text-gray-400"
                disabled
              >
                Resend in {countdown} seconds
              </button>
            ) : (
              <button
                className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                onClick={handleResend}
              >
                Resend
              </button>
            )}
          </div>
          <div className="text-center">
            <Link
              to="/auth/signin"
              className="text-sm text-primary-600 hover:underline dark:text-primary-400"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default ForgotPasswordRequestSent;
