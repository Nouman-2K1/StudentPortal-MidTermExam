import { Outlet } from "react-router-dom";
const AuthLayout = () => {
  return (
    <>
      <div className="m-0 p-0">
        <Outlet />
      </div>
    </>
  );
};

export default AuthLayout;
