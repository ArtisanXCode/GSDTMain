import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { address } = useWallet();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait until auth check is complete
    if (!authLoading && (!requireAdmin || !adminLoading)) {
      setIsChecking(false);
    }
  }, [authLoading, adminLoading, requireAdmin]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // First check: User must be authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Second check: If admin route is required, check admin status
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}