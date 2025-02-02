import { Link } from 'react-router-dom';

const UnauthorizedLayout = () => {
  return (
    <div className="container mx-auto mt-10 text-center">
      <h1 className="text-3xl font-bold mb-4">Unauthorized Access</h1>
      <p className="text-lg mb-8">
        You are not authorized to access this page.
      </p>
      <Link
        to="/auth/signin"
        className="bg-blue-500 hover:bg-blue-950 text-white font-bold py-2 px-4 rounded"
      >
        Sign In
      </Link>
    </div>
  );
};

export default UnauthorizedLayout;
