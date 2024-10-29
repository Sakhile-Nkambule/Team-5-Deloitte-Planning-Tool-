import { Navigate } from 'react-router-dom';
import { useUser } from '../componets/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();

  if (!user) {
    // Redirect to login if no user is logged in
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
