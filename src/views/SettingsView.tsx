/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Settings, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  Shield, 
  Terminal, 
  Sparkles, 
  Cpu, 
  Database,
  ExternalLink
} from 'lucide-react';

export function SettingsView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleResetSeed = async () => {
    if (!confirm('This will reset and re-seed sample projects, verified assessments, and demonstration users. Proceed?')) {
      return;
    }
    setSeeding(true);
    try {
      const res = await fetch('/api/dev/seed', { method: 'POST' });
      if (res.ok) {
        showToast('Demonstration projects and records re-seeded successfully.', 'success');
        window.location.reload();
      }
    } catch (err: any) {
      showToast(err.message || 'Error seeding database', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleDownloadZip = () => {
    setDownloadingZip(true);
    showToast('Starting DevMatch full project download...', 'info');
    // Direct link to downloadable archive in workspace
    const link = document.createElement('a');
    link.href = '/devmatch-full-project.zip';
    link.download = 'devmatch-full-project.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingZip(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Platform Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Full-stack runtime configuration, environment variables, and source code archive.
        </p>
      </div>

      {/* Export Standalone Project ZIP */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold">
            <Download className="w-3.5 h-3.5" />
            <span>Standalone Package</span>
          </div>
          <h3 className="text-xl font-bold">Download Complete Project Archive (ZIP)</h3>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Get the full source code with TypeScript, Express backend, React Vite frontend, adaptive AI engine, test suite, and configuration files ready to run anywhere.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloadingZip}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 text-xs font-bold shadow-md transition-all hover:scale-[1.02] shrink-0"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>{downloadingZip ? 'Preparing ZIP...' : 'Download devmatch.zip'}</span>
        </button>
      </div>

      {/* Active Architecture Status */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Architecture & Verified Integrations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <Cpu className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">Backend Runtime</p>
              <p className="text-slate-500 mt-0.5">Express Node.js runtime mounted with Vite dev middleware on port 3000.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">Gemini AI Service</p>
              <p className="text-slate-500 mt-0.5">Server-side @google/genai SDK with safe question bank fallbacks and quota protections.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <Database className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">Persistence Layer</p>
              <p className="text-slate-500 mt-0.5">Firestore-compatible atomic JSON storage engine + firestore.rules security specification.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <Shield className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">Unit Test Suite</p>
              <p className="text-slate-500 mt-0.5">Built-in node:test runner verifying match scores, difficulty rules, and role security.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Development Tools & Data Management */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Development Tools & Demo Data
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Need to test with a clean baseline? Re-seed the sample projects, verified assessments, and applications with realistic demonstration content.
        </p>

        <div className="pt-2">
          <button
            onClick={handleResetSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>{seeding ? 'Re-seeding Data...' : 'Reset & Re-seed Sample Content'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
