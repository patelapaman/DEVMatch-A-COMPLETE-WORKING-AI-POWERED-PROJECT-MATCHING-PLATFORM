/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Application, ApplicationStatus, Project, ProjectCategory, ProjectType, ExperienceLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, 
  Plus, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  X, 
  ChevronRight,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';

export function RecruiterStudioView() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'applications' | 'projects'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Status review state
  const [reviewingApp, setReviewingApp] = useState<Application | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ApplicationStatus>('Shortlisted');
  const [reviewNote, setReviewNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Create Project Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProjectCategory>('Full-Stack');
  const [newDesc, setNewDesc] = useState('');
  const [newReqSkills, setNewReqSkills] = useState('React, TypeScript, Node.js');
  const [newOptSkills, setNewOptSkills] = useState('Docker, Tailwind CSS');
  const [newExp, setNewExp] = useState<ExperienceLevel>('Intermediate');
  const [newType, setNewType] = useState<ProjectType>('Open-source');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newRemote, setNewRemote] = useState(true);
  const [newOpenings, setNewOpenings] = useState(2);
  const [newDuration, setNewDuration] = useState('3 months');
  const [newDeadline, setNewDeadline] = useState('2026-12-31');

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [appRes, projRes] = await Promise.all([
        fetch('/api/recruiter/applications', {
          headers: { 'Authorization': `Bearer ${user.uid}`, 'x-devmatch-uid': user.uid }
        }),
        fetch('/api/projects')
      ]);

      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData.applications || []);
      }
      if (projRes.ok) {
        const projData = await projRes.json();
        const allProj = projData.projects as Project[] || [];
        setProjects(allProj.filter(p => p.ownerId === user.uid || user.role === 'admin'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApp || !user) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/recruiter/applications/${reviewingApp.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`,
          'x-devmatch-uid': user.uid
        },
        body: JSON.stringify({
          status: reviewStatus,
          note: reviewNote.trim()
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update application status');
      }

      showToast(`Applicant status successfully updated to "${reviewStatus}".`, 'success');
      setReviewingApp(null);
      setReviewNote('');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error updating status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`,
          'x-devmatch-uid': user.uid
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          category: newCategory,
          requiredSkills: newReqSkills.split(',').map(s => s.trim()).filter(Boolean),
          optionalSkills: newOptSkills.split(',').map(s => s.trim()).filter(Boolean),
          experienceLevel: newExp,
          projectType: newType,
          location: newLocation.trim(),
          remoteAllowed: newRemote,
          numberOfOpenings: Number(newOpenings),
          duration: newDuration,
          applicationDeadline: newDeadline
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create project');
      }

      showToast('New project created and published to DevMatch directory!', 'success');
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error creating project', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseProject = async (projectId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.uid}`,
          'x-devmatch-uid': user.uid
        }
      });
      if (res.ok) {
        showToast('Project closed for new applications.', 'info');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <Lock className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Recruiter Privileges Required</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You are currently signed in as a developer. Click "Switch to Sarah (Lead)" in the header to access Recruiter Studio.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Project Owner Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Recruiter Studio</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your posted engineering opportunities and evaluate candidate submissions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Project</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 text-xs font-bold border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
            activeTab === 'applications'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Candidate Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 text-xs font-bold border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
            activeTab === 'projects'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Your Posted Projects ({projects.length})</span>
        </button>
      </div>

      {/* Tab 1: Candidate Applications Review */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading incoming applications...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No applications received yet</p>
              <p className="text-xs text-slate-500">
                Candidates who discover your projects will appear here for your evaluation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div
                  key={app.id}
                  className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-indigo-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        app.status === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'Shortlisted'
                          ? 'bg-indigo-100 text-indigo-700'
                          : app.status === 'Rejected'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-800">{app.applicantNameSnapshot}</span>
                      <span className="text-xs text-slate-500">({app.applicantEmailSnapshot})</span>
                    </div>

                    <p className="text-xs font-semibold text-indigo-900">
                      Applied for: <span className="font-bold">{app.projectTitleSnapshot}</span>
                    </p>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 line-clamp-2">
                      "{app.coverLetter}"
                    </p>

                    {/* Applicant skills tags */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-400 mr-1">Skills:</span>
                      {app.applicantSkillsSnapshot.slice(0, 6).map(sk => (
                        <span key={sk} className="px-2 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Review Button */}
                  <div className="shrink-0 self-end md:self-center">
                    <button
                      onClick={() => {
                        setReviewingApp(app);
                        setReviewStatus(app.status === 'Pending' ? 'Shortlisted' : app.status);
                        setReviewNote('');
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      Evaluate & Update Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Your Posted Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(proj => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    proj.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {proj.status}
                  </span>
                  <span className="text-xs text-slate-400">{proj.category}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{proj.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{proj.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{proj.numberOfOpenings} openings • Deadline: {proj.applicationDeadline}</span>
                  {proj.status === 'open' && (
                    <button
                      onClick={() => handleCloseProject(proj.id)}
                      className="text-rose-600 hover:underline font-semibold"
                    >
                      Close Project
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluate Applicant Modal */}
      {reviewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Evaluate: {reviewingApp.applicantNameSnapshot}
              </h3>
              <button onClick={() => setReviewingApp(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p><span className="font-semibold text-slate-800">Project:</span> {reviewingApp.projectTitleSnapshot}</p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <p className="font-semibold text-[11px] text-slate-500 uppercase mb-1">Cover Letter Proposal:</p>
                <p className="whitespace-pre-line">{reviewingApp.coverLetter}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Set Decision Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Shortlisted', 'Accepted', 'Rejected'] as ApplicationStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReviewStatus(st)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        reviewStatus === st
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recruiter Feedback / Internal Audit Note
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  placeholder="e.g., Impressive React quiz score and portfolio experience. Scheduled for technical interview..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Post New Engineering Project</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed In-Memory Cache in Node.js"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Full-Stack">Full-Stack</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Open-Source">Open-Source</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Open-source">Open-source</option>
                    <option value="Student Project">Student Project</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  required
                  value={newReqSkills}
                  onChange={e => setNewReqSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Optional / Preferred Skills</label>
                <input
                  type="text"
                  value={newOptSkills}
                  onChange={e => setNewOptSkills(e.target.value)}
                  placeholder="Docker, SQL, Redis"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Description & Deliverables</label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Describe the technical scope, architectural goals, team setup, and what the applicant will build..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience Level</label>
                  <select
                    value={newExp}
                    onChange={e => setNewExp(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Openings</label>
                  <input
                    type="number"
                    min={1}
                    value={newOpenings}
                    onChange={e => setNewOpenings(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {updating ? 'Publishing...' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
