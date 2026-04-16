import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

const RoleGuard = ({ children, requiredRole }) => {
  const { role, toggleRole } = useUser();
  const navigate = useNavigate();

  // If no required role is specified, allow access
  if (!requiredRole) {
    return children;
  }

  // If user has the required role, show content
  if (role === requiredRole) {
    return children;
  }

  // Otherwise, show access denied message
  const roleNames = {
    commonUser: 'Common Users',
    authority: 'Authorities'
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="border-2 border-red-500 bg-red-50 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="font-playfair text-3xl font-bold text-[#0B192C] mb-4">
            Access Restricted
          </h1>
          <p className="text-slate-700 mb-6">
            This page is only accessible to <strong>{roleNames[requiredRole]}</strong>.
          </p>
          <p className="text-sm text-slate-600 mb-6">
            You are currently signed in as: <strong>{roleNames[role]}</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={toggleRole}
              className="bg-[#0B192C] text-white px-6 py-3 border-2 border-[#0B192C] hover:bg-white hover:text-[#0B192C] transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Switch to {roleNames[requiredRole]}
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-slate-600 px-6 py-3 border-2 border-slate-300 hover:bg-slate-50 transition-all"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleGuard;
