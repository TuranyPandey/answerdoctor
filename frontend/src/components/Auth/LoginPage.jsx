import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import env from '../../config/env';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../../services/api';
import { useToast } from '../Toast';

export default function LoginPage({ onLoginSuccess }) {
  const [role, setRole] = useState('teacher');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      toast('Please fill in all fields', 'err');
      return;
    }
    setLoading(true);
    try {
      let data;
      if (isRegister) {
        data = await registerWithEmail(email, password, name, role);
        toast('Account created successfully!', 'ok');
      } else {
        data = await loginWithEmail(email, password);
        toast('Welcome back!', 'ok');
      }
      onLoginSuccess(data.user, data.access_token);
    } catch (err) {
      toast(err.message || 'Authentication failed', 'err');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential, role);
      toast(`Signed in as ${data.user.name}`, 'ok');
      onLoginSuccess(data.user, data.access_token);
    } catch (err) {
      toast(err.message || 'Google authentication failed', 'err');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-header">
          <div className="auth-brand">{env.appName}</div>
          <div className="auth-tagline">{env.appTagline}</div>
        </div>

        <div className="auth-panel-body">
          <div className="auth-section-label">Select Account Type</div>
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn${role === 'teacher' ? ' selected' : ''}`}
              onClick={() => setRole('teacher')}
            >
              Instructor / Teacher
            </button>
            <button
              type="button"
              className={`role-btn${role === 'student' ? ' selected' : ''}`}
              onClick={() => setRole('student')}
            >
              Student
            </button>
          </div>

          {env.googleClientId && (
            <div className="mb-16 flex flex-col items-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast('Google authentication failed or popup closed', 'err')}
                useOneTap={false}
                shape="square"
                theme="filled_black"
                width="356px"
              />
              <div className="auth-divider full-width mt-12">OR EMAIL & PASSWORD</div>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="email-form">
            {isRegister && (
              <div className="form-field">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="form-field">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="primary-btn full-width mt-12" disabled={loading}>
              {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
            </button>

            <div className="mt-16 text-center text-sm text-mute">
              {isRegister ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="ghost-btn"
                    style={{ textDecoration: 'underline', padding: 0 }}
                    onClick={() => setIsRegister(false)}
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  New to AnswerDoctor?{' '}
                  <button
                    type="button"
                    className="ghost-btn"
                    style={{ textDecoration: 'underline', padding: 0 }}
                    onClick={() => setIsRegister(true)}
                  >
                    Register
                  </button>
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
