/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Download, Shield, Terminal, ArrowUpRight, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onDownloadZip?: () => void;
}

export function Footer({ onNavigate, onDownloadZip }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Dev<span className="text-indigo-400">Match</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discover Projects. Prove Your Skills. Find Your Match. An AI-powered full-stack matching engine for students, developers, and project leaders.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-emerald-400 border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Gemini 2.5 Server-Side
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('projects')} className="hover:text-white transition-colors">
                  Explore Projects
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('recommendations')} className="hover:text-white transition-colors">
                  AI Recommended Matches
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('assessment')} className="hover:text-white transition-colors">
                  Adaptive Skill Assessment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('applications')} className="hover:text-white transition-colors">
                  Application Tracking
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture & Verification */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Express Node.js Full-Stack</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Firestore Security Rules</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deterministic + AI Scoring</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Built-in Unit Tests Verified</span>
              </li>
            </ul>
          </div>

          {/* Export & Actions */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Developer Tools</h4>
            <p className="text-xs text-slate-400 mb-3">
              Need the full standalone source code for offline deployment or local inspection?
            </p>
            <button
              onClick={() => onNavigate('settings')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Project Settings & ZIP</span>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 DevMatch. All rights reserved. Open-source full-stack platform.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for the global developer ecosystem.
          </p>
        </div>
      </div>
    </footer>
  );
}
