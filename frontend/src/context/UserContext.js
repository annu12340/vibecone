import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // Load role from localStorage or default to 'commonUser'
  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem('userRole');
    return savedRole || 'commonUser';
  });

  // Save role to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userRole', role);
  }, [role]);

  const toggleRole = () => {
    setRole(prev => prev === 'commonUser' ? 'authority' : 'commonUser');
  };

  const isCommonUser = role === 'commonUser';
  const isAuthority = role === 'authority';

  return (
    <UserContext.Provider value={{ role, toggleRole, isCommonUser, isAuthority }}>
      {children}
    </UserContext.Provider>
  );
};
