/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Sparkles, 
  Award, 
  FileText, 
  LayoutDashboard, 
  Briefcase, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Repeat,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export function Navbar({ currentView, onNavigate, onOpenAuth }: NavbarProps) {
  const { user, logout, switchDemoUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Compass, public: true },
    { id: 'projects', label: 'Explore Projects', icon: Briefcase, public: true },
    { id: 'recommendations', label: 'AI Matches', icon: Sparkles, authRequired: true, badge: 'Smart' },
    { id: 'assessment', label: 'Skill Quiz', icon: Award, authRequired: true },
    { id: 'applications', label: 'Applications', icon: FileText, authRequired: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, authRequired: true },
  ];

  if (user?.role === 'recruiter' || user?.role === 'admin') {
    navItems.push({ id: 'recruiter', label: 'Recruiter Studio', icon: ShieldCheck, authRequired: true, badge: 'Lead' });
  }

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">Dev<span className="text-indigo-600">Match</span></span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded">AI</span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium hidden sm:block">Match • Assess • Build</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            if (item.authRequired && !user) return null;
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                    item.badge === 'Smart' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Demo Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Quick 1-click Role Switcher Pill */}
              <button
                onClick={() => switchDemoUser(user.role === 'recruiter' ? 'developer' : 'recruiter')}
                className="hidden lg:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                title="Switch between Developer and Recruiter view"
              >
                <Repeat className="w-3.5 h-3.5 text-indigo-500" />
                <span>Switch to {user.role === 'recruiter' ? 'Alex (Dev)' : 'Sarah (Lead)'}</span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  aria-expanded={profileDropdownOpen}
                >
                  <img
                    src={user.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[100px]">{user.name}</p>
                    <p className="text-[10px] text-slate-600 capitalize leading-tight">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => { handleNavClick('profile'); setProfileDropdownOpen(false); }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile & Skills</span>
                    </button>

                    <button
                      onClick={() => { handleNavClick('dashboard'); setProfileDropdownOpen(false); }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>User Dashboard</span>
                    </button>

                    <button
                      onClick={() => { handleNavClick('settings'); setProfileDropdownOpen(false); }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings & Seed Data</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => { logout(); setProfileDropdownOpen(false); handleNavClick('landing'); }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => switchDemoUser('developer')}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                title="1-Click Demo Login as Alex (Developer)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Login</span>
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-lg shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02]"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1">
          {navItems.map(item => {
            if (item.authRequired && !user) return null;
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-indigo-100 text-indigo-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {user && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => { switchDemoUser(user.role === 'recruiter' ? 'developer' : 'recruiter'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100"
              >
                <Repeat className="w-3.5 h-3.5 text-indigo-500" />
                <span>Switch to {user.role === 'recruiter' ? 'Alex (Dev)' : 'Sarah (Lead)'}</span>
              </button>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); handleNavClick('landing'); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 bg-rose-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
