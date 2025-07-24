import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useAdmin } from '../hooks/useAdmin';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { isConnected, loading: walletLoading, address } = useWallet();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Wait until all auth checks are complete
    if (!walletLoading && (!requireAdmin || !adminLoading)) {
      setIsChecking(false);
      
      // Check if we should redirect due to wallet disconnection
      if (!isConnected || !address) {
        setShouldRedirect(true);
      } else {
        setShouldRedirect(false);
      }
    }
  }, [walletLoading, adminLoading, requireAdmin, isConnected, address]);

  // Real-time check for wallet disconnection
  useEffect(() => {
    if (!isChecking) {
      if (!isConnected || !address) {
        setShouldRedirect(true);
      }
    }
  }, [isConnected, address, isChecking]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (shouldRedirect || !isConnected) {
    // Redirect to home if not connected or wallet was disconnected
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to home if admin access is required but user is not admin
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}