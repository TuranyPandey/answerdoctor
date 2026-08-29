import React, { useState } from 'react';
import { Users, BookOpen, LogIn, UserPlus, Sparkles, Award } from 'lucide-react';

export default function RoleSelector({ onSelectRole, onDirectLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [authType, setAuthType] = useState(null);

  const handleContinue = () => {
    if (selectedRole && authType) {
      onSelectRole({ role: selectedRole, authType });
    }
  };

  const handleTuranyQuickView = () => {
    const turanyUser = {
      id: 4,
      full_name: "Turany Pandey",
      email: "turany@vit.ac.in",
      register_number: "26BCE0646",
      role: "student",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Turany",
      token: "turany-jwt-token-2026"
    };
    localStorage.setItem("user", JSON.stringify(turanyUser));
    if (onDirectLogin) {
      onDirectLogin(turanyUser);
    }
  };

  const handleSohumQuickView = () => {
    const sohumUser = {
      id: 2,
      full_name: "Mangalapalli Sohum Seshu Krish",
      email: "mangalapalli.ss@gmail.com",
      register_number: "26BCE0616",
      role: "student",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sohum",
      token: "sohum-jwt-token-2026"
    };
    localStorage.setItem("user", JSON.stringify(sohumUser));
    if (onDirectLogin) {
      onDirectLogin(sohumUser);
    }
  };

  const handleTeacherQuickView = () => {
    const teacherUser = {
      id: 1,
      full_name: "Prof. Rajesh Sharma",
      email: "prof.sharma@vit.ac.in",
      role: "teacher",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
      token: "teacher-jwt-token-2026"
    };
    localStorage.setItem("user", JSON.stringify(teacherUser));
    if (onDirectLogin) {
      onDirectLogin(teacherUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <LogIn className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">AnswerDoctor</h1>
          </div>
          <p className="text-gray-600 text-xs font-medium">Intelligent Script Assessment & Integrity Insights</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-8">
          
          {/* Step 1: Role Selection */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">I am a</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedRole('teacher')}
                className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                  selectedRole === 'teacher'
                    ? 'border-blue-600 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <Users className={`w-8 h-8 ${selectedRole === 'teacher' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${selectedRole === 'teacher' ? 'text-blue-900' : 'text-gray-700'}`}>
                  Teacher
                </span>
              </button>

              <button
                onClick={() => setSelectedRole('student')}
                className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                  selectedRole === 'student'
                    ? 'border-purple-600 bg-purple-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <BookOpen className={`w-8 h-8 ${selectedRole === 'student' ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${selectedRole === 'student' ? 'text-purple-900' : 'text-gray-700'}`}>
                  Student
                </span>
              </button>
            </div>
          </div>

          {/* Divider */}
          {selectedRole && <div className="border-t border-gray-200"></div>}

          {/* Step 2: Auth Type Selection */}
          {selectedRole && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4">I want to</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAuthType('signin')}
                  className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                    authType === 'signin'
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <LogIn className={`w-8 h-8 ${authType === 'signin' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-bold text-sm ${authType === 'signin' ? 'text-blue-900' : 'text-gray-700'}`}>
                    Sign In
                  </span>
                </button>

                <button
                  onClick={() => setAuthType('signup')}
                  className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                    authType === 'signup'
                      ? 'border-green-600 bg-green-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <UserPlus className={`w-8 h-8 ${authType === 'signup' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-bold text-sm ${authType === 'signup' ? 'text-green-900' : 'text-gray-700'}`}>
                    Sign Up
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Continue Button */}
          {selectedRole && authType && (
            <button
              onClick={handleContinue}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition active:scale-95"
            >
              Continue
            </button>
          )}

          {/* Footer */}
          <p className="text-[11px] text-center text-gray-500 font-mono">
            AnswerDoctor • Enterprise Integrity System
          </p>
        </div>
      </div>
    </div>
  );
}
