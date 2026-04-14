import React, { createContext, useState, useContext, useCallback } from 'react';

interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  dateOfBirth?: string;
  address?: UserAddress;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): User | null {
  const saved = localStorage.getItem('user') || localStorage.getItem('authUser') || localStorage.getItem('adminUser');
  if (!saved) return null;
  try {
    const u = JSON.parse(saved);
    return {
      id: u._id || u.id || '',
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      role: u.role || 'user',
      phone: u.phone || '',
      dateOfBirth: u.dateOfBirth || '',
      address: u.address || {},
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken') || localStorage.getItem('adminToken');
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback((newToken: string, newUser: any) => {
    const u: User = {
      id: newUser._id || newUser.id || '',
      firstName: newUser.firstName || '',
      lastName: newUser.lastName || '',
      email: newUser.email || '',
      role: newUser.role || 'user',
      phone: newUser.phone || '',
      dateOfBirth: newUser.dateOfBirth || '',
      address: newUser.address || {},
    };
    setToken(newToken);
    setUser(u);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('authUser', JSON.stringify(u));
    // If the user is an admin, also store admin-specific tokens/users
    if (u.role === 'admin') {
      localStorage.setItem('adminToken', newToken);
      localStorage.setItem('adminUser', JSON.stringify(u));
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('authUser');
    localStorage.removeItem('adminToken'); // Remove admin token on logout
    localStorage.removeItem('adminUser'); // Remove admin user on logout
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // If the updated user is an admin, also update admin-specific storage
    if (updatedUser.role === 'admin') {
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
