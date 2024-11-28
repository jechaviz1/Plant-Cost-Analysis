import React, { useState } from 'react';
import { LogIn, LogOut, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AuthButton() {
  const { user, signInWithGoogle, signOut, error: authError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (isSigningIn) return;

    try {
      setIsSigningIn(true);
      setLocalError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err?.code === 'auth/popup-blocked') {
        setLocalError('Popup was blocked. Continuing with redirect sign-in...');
        // The redirect will happen automatically from the context
      } else if (err?.code === 'auth/cancelled-popup-request' || err?.code === 'auth/popup-closed-by-user') {
        setLocalError('Sign-in was cancelled. Please try again.');
      } else {
        setLocalError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      // Only set signing in to false if we're not doing a redirect
      if (!localError?.includes('redirect')) {
        setIsSigningIn(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err: any) {
      console.error('Sign-out error:', err);
      setLocalError('Failed to sign out. Please try again.');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="relative inline-block">
      {user ? (
        <div className="flex items-center space-x-4">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {user.displayName || user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed`}
          >
            {isSigningIn ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
          </button>

          {displayError && (
            <div className="absolute top-full left-0 mt-2 w-64 p-2 bg-red-50 border border-red-200 rounded-md shadow-sm z-50">
              <div className="flex items-center text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{displayError}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}