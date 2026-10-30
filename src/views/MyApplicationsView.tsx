/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Application, ApplicationStatus, Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

interface MyApplicationsViewProps {
  onOpenProjectById: (projectId: string) => void;
  onExploreProjects: () => void;
}

export function MyApplicationsView({
  onOpenProjectById,
  onExploreProjects
}: MyApplicationsViewProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch('/api/applications/my', {
        headers: {
          'Authorization': `Bearer ${user.uid}`,
          'x-devmatch-uid': user.uid
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const handleWithdraw = async (applicationId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/applications/${applicationId}/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.uid}`,
          'x-devmatch-uid': user.uid
        }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to withdraw application');
      }
      showToast('Application successfully withdrawn.', 'info');
      setWithdrawingId(null);
      fetchApplications();
    } catch (err: any) {
      showToast(err.message || 'Error withdrawing application', 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-slate-600">Please sign in to track your applications.</p>
      </div>
    );
  }

  const statuses = ['All', 'Pending', 'Shortlisted', 'Accepted', 'Rejected', 'Withdrawn'];

  const filteredApps = applications.filter(app => {
    if (filterStatus === 'All') return true;
    return app.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Accepted':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Accepted</span>;
      case 'Shortlisted':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">Shortlisted</span>;
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Pending Review</span>;
      case 'Rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Archived</span>;
      case 'Withdrawn':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">Withdrawn</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Applications</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review application status, reciprocal recruiter feedback, and audit history.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {statuses.map(st => {
          const count = st === 'All' 
            ? applications.length 
            : applications.filter(a => a.status.toLowerCase() === st.toLowerCase()).length;
          const isActive = filterStatus === st;

          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{st}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading your applications...</div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No applications in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore active open projects and submit your portfolio directly to project leads.
          </p>
          <button
            onClick={onExploreProjects}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Explore Projects
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map(app => {
            const isExpanded = expandedAppId === app.id;
            const canWithdraw = app.status === 'Pending' || app.status === 'Shortlisted';

            return (
              <div
                key={app.id}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-200 transition-all"
              >
                {/* Main Card */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(app.status)}
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        Submitted {new Date(app.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 
                      onClick={() => onOpenProjectById(app.projectId)}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                    >
                      {app.projectTitleSnapshot}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-1 italic">
                      "{app.coverLetter}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View History'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => onOpenProjectById(app.projectId)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Project</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {canWithdraw && (
                      <button
                        onClick={() => setWithdrawingId(app.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Status Timeline & Cover Letter */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4 text-xs">
                    {/* Cover Note Snapshot */}
                    <div>
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                        Your Submitted Proposal
                      </h4>
                      <p className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line">
                        {app.coverLetter}
                      </p>
                    </div>

                    {/* Status History Timeline */}
                    <div>
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                        Status History & Recruiter Notes
                      </h4>
                      <div className="space-y-2">
                        {app.statusHistory.map((entry, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-3">
                            <Clock className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{entry.status}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(entry.changedAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Updated by: <span className="font-medium text-slate-700">{entry.changedBy}</span>
                              </p>
                              {entry.note && (
                                <p className="text-xs text-indigo-950 bg-indigo-50/60 p-2 rounded-lg mt-1 font-medium">
                                  "{entry.note}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Withdrawal */}
      {withdrawingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Withdraw Application?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to withdraw this application? The project owner will be notified and your submission will be archived.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setWithdrawingId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Application
              </button>
              <button
                onClick={() => handleWithdraw(withdrawingId)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Confirm Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
