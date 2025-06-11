'use client';
import { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { LogIn, LogOut, User } from 'lucide-react';

export default function AuthButton() {
  const [user, loading] = useAuthState(auth);
  const [signingIn, setSigningIn] = useState(false);

  const signInWithGoogle = async () => {
    try {
      setSigningIn(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="tool-btn animate-pulse">
        <div className="w-5 h-5 bg-gray-600 rounded-full"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="floating-panel px-3 py-2 flex items-center gap-2">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-sm max-w-20 truncate" style={{color: 'var(--text-secondary)'}}>
            {user.displayName}
          </span>
        </div>
        <button 
          className="tool-btn"
          onClick={handleSignOut}
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <button 
      className="tool-btn flex items-center gap-2 px-3 w-auto"
      onClick={signInWithGoogle}
      disabled={signingIn}
      title="Login com Google"
    >
      {signingIn ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <LogIn size={16} />
      )}
      <span className="text-sm">Login</span>
    </button>
  );
}
