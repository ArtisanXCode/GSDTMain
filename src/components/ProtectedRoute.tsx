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
  const { isConnected, loading: walletLoading, address } = useWallet();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Wait until all auth checks are complete
    if (!authLoading && !walletLoading && (!requireAdmin || !adminLoading)) {
      setIsChecking(false);
      
      // Check if we should redirect due to missing authentication
      if (!isAuthenticated) {
        setShouldRedirect(true);
      } else {
        setShouldRedirect(false);
      }
    }
  }, [authLoading, walletLoading, adminLoading, requireAdmin, isAuthenticated]);

  // Real-time check for authentication status
  useEffect(() => {
    if (!isChecking) {
      if (!isAuthenticated) {
        setShouldRedirect(true);
      }
    }
  }, [isAuthenticated, isChecking]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (shouldRedirect || !isAuthenticated) {
    // Redirect to home if not authenticated
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to home if admin access is required but user is not admin
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}