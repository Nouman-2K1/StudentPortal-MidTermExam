import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserType, Student, Teacher, Admin } from '../Interface/User.interface';

interface UserContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  isStudent: () => boolean;
  isTeacher: () => boolean;
  isAdmin: () => boolean;
  getStudent: () => Student | null;
  getTeacher: () => Teacher | null;
  getAdmin: () => Admin | null;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'user_data';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const isStudent = (): boolean => user?.role === 'student';
  const isTeacher = (): boolean => user?.role === 'teacher';
  const isAdmin = (): boolean => user?.role === 'admin';

  const getStudent = (): Student | null =>
    isStudent() ? (user as Student) : null;

  const getTeacher = (): Teacher | null =>
    isTeacher() ? (user as Teacher) : null;

  const getAdmin = (): Admin | null => (isAdmin() ? (user as Admin) : null);

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const contextValue: UserContextType = {
    user,
    setUser,
    isStudent,
    isTeacher,
    isAdmin,
    getStudent,
    getTeacher,
    getAdmin,
    clearUser,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
