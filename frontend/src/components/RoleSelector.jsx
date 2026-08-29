import React, { useState } from 'react';
import { Users, BookOpen, LogIn, UserPlus } from 'lucide-react';

export default function RoleSelector({ onSelectRole }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [authType, setAuthType] = useState(null);

  const handleContinue = () => {
    if (selectedRole && authType) {
      onSelectRole({ role: selectedRole, authType });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <LogIn className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AnswerDoctor</h1>
          </div>
          <p className="text-gray-600 text-sm">Intelligent Script Assessment & Insights</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Step 1: Role Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">I am a</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedRole('teacher')}
                className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                  selectedRole === 'teacher'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <Users className={`w-8 h-8 ${selectedRole === 'teacher' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`font-semibold text-sm ${selectedRole === 'teacher' ? 'text-blue-900' : 'text-gray-700'}`}>
                  Teacher
                </span>
              </button>

              <button
                onClick={() => setSelectedRole('student')}
                className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                  selectedRole === 'student'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <BookOpen className={`w-8 h-8 ${selectedRole === 'student' ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className={`font-semibold text-sm ${selectedRole === 'student' ? 'text-purple-900' : 'text-gray-700'}`}>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">I want to</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAuthType('signin')}
                  className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                    authType === 'signin'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <LogIn className={`w-8 h-8 ${authType === 'signin' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold text-sm ${authType === 'signin' ? 'text-blue-900' : 'text-gray-700'}`}>
                    Sign In
                  </span>
                </button>

                <button
                  onClick={() => setAuthType('signup')}
                  className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${
                    authType === 'signup'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <UserPlus className={`w-8 h-8 ${authType === 'signup' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold text-sm ${authType === 'signup' ? 'text-green-900' : 'text-gray-700'}`}>
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
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Continue
            </button>
          )}

          {/* Footer */}
          <p className="text-xs text-center text-gray-500">
            Secure. Simple. For educators & students.
          </p>
        </div>
      </div>
    </div>
  );
}
