import { Navigate, useLocation } from 'react-router-dom';

/**
 * Reads session from localStorage (keys set by the login page).
 * Redirects:
 *   - Not logged in  → /login
 *   - Wrong role     → their own dashboard
 */

const ROLE_HOME = {
  student:   '/student/dashboard',
  organizer: '/organizer-dashboard',
  admin:     '/admin-dashboard',
  cocom:     '/cocom/my-tasks',
};

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const token    = localStorage.getItem('hf_token');
  const userRole = localStorage.getItem('hf_role');

  // Not logged in → send to login, preserve the intended path
  if (!token || !userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their own home
  if (role && userRole !== role) {
    return <Navigate to={ROLE_HOME[userRole] ?? '/login'} replace />;
  }

  return children;
}
