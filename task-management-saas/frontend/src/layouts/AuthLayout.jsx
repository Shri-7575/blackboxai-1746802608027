import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.svg"
          alt="Task Management"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Task Management SaaS
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} Task Management SaaS. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthLayout;
