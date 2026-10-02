import React from 'react';
import { isUserLoggedIn } from '../api/client';
import { Login } from './Login';
import { UserSummary } from '../api/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onLoginSuccess: (user?: UserSummary) => void;
  onBypass?: () => void;
}

/**
 * ProtectedRoute Component:
 * Guards sensitive routes/features. Displays JWT Login prompt if user is not authenticated.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated,
  onLoginSuccess,
  onBypass,
}) => {
  if (!isAuthenticated && !isUserLoggedIn()) {
    return (
      <Login
        onSuccess={onLoginSuccess}
        onCancel={onBypass}
      />
    );
  }

  return <>{children}</>;
};
