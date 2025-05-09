import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Dashboard Pages
import Dashboard from '@/pages/dashboard/Dashboard';
import Tasks from '@/pages/dashboard/Tasks';
import TaskDetails from '@/pages/dashboard/TaskDetails';
import Team from '@/pages/dashboard/Team';
import Profile from '@/pages/dashboard/Profile';
import Settings from '@/pages/dashboard/Settings';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import WorkspaceManagement from '@/pages/admin/WorkspaceManagement';
import UserManagement from '@/pages/admin/UserManagement';
import SubscriptionManagement from '@/pages/admin/SubscriptionManagement';

// Super Admin Pages
import SuperAdminDashboard from '@/pages/superadmin/Dashboard';
import SystemSettings from '@/pages/superadmin/SystemSettings';

// Error Pages
import NotFound from '@/pages/error/NotFound';
import Unauthorized from '@/pages/error/Unauthorized';

const App = () => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute user={user} />}>
        <Route element={<DashboardLayout />}>
          {/* Regular User & Admin Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/team" element={<Team />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin Only Routes */}
          <Route element={<AdminRoute user={user} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/workspaces" element={<WorkspaceManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/subscriptions" element={<SubscriptionManagement />} />
          </Route>

          {/* Super Admin Only Routes */}
          <Route element={<SuperAdminRoute user={user} />}>
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
            <Route path="/superadmin/settings" element={<SystemSettings />} />
          </Route>
        </Route>
      </Route>

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Protected Route Component
const ProtectedRoute = ({ user, children }) => {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ user, children }) => {
  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Super Admin Route Component
const SuperAdminRoute = ({ user, children }) => {
  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default App;
