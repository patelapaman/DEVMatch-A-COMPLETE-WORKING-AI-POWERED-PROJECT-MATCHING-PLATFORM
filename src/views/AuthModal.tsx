/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Sparkles, User, Mail, Lock, Briefcase, Code, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, register, switchDemoUser } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('developer');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const success = await login(email, password);
        if (success) {
          showToast('Welcome back to DevMatch!', 'success');
          onClose();
        } else {
          showToast('Invalid email or password. Please verify your credentials.', 'error');
        }
      } else if (mode === 'register') {
        const success = await register(name, email, password, role);
        if (success) {
          showToast('Your DevMatch account has been created successfully!', 'success');
          onClose();
        } else {
          showToast('Failed to create account. Email may already be in use.', 'error');
        }
      } else if (mode === 'forgot') {
        await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        showToast('Password reset instructions dispatched to your email.', 'info');
        setMode('login');
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred during authentication.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSelect = async (selectedRole: 'developer' | 'recruiter') => {
    setSubmitting(true);
    await switchDemoUser(selectedRole);
    showToast(`Logged in as ${selectedRole === 'developer' ? 'Alex Rivera (Developer)' : 'Sarah Chen (Lead)'}`, 'success');
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-indigo-200" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            {mode === 'login' ? 'Sign in to DevMatch' : mode === 'register' ? 'Join the DevMatch Network' : 'Reset Password'}
          </h3>
          <p className="text-xs text-indigo-100 mt-1">
            {mode === 'login' 
              ? 'Access personalized project matches and your verified assessments.' 
              : mode === 'register'
              ? 'Build your verified developer profile or recruit top technical talent.'
              : 'Enter your registered email to receive recovery instructions.'}
          </p>
        </div>

        {/* Content body */}
        <div className="p-6">
          {/* Quick 1-Click Demo Accounts */}
          {mode === 'login' && (
            <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                1-Click Instant Demo Login:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDemoSelect('developer')}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-800 transition-colors shadow-sm"
                >
                  <Code className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Alex (Dev)</span>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDemoSelect('recruiter')}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-300 text-xs font-semibold text-slate-800 transition-colors shadow-sm"
                >
                  <Briefcase className="w-3.5 h-3.5 text-violet-600" />
                  <span>Sarah (Lead)</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jordan Blake"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-indigo-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">I want to:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('developer')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      role === 'developer'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>Find Projects</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      role === 'recruiter'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Post & Recruit</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <span>{mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle mode links */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : mode === 'register' ? (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <button
                onClick={() => setMode('login')}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
