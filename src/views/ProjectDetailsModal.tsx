/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Bookmark, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ExternalLink,
  Github,
  FolderGit2,
  Trash2
} from 'lucide-react';

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (projectId: string) => void;
  onApplicationSuccess?: () => void;
  onTakeAssessment?: (skill: string) => void;
}

export function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  isBookmarked = false,
  onToggleBookmark,
  onApplicationSuccess,
  onTakeAssessment
}: ProjectDetailsModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const userSkills = user?.skills || [];
  const missingSkills = project.requiredSkills.filter(
    req => !userSkills.some(s => s.toLowerCase() === req.toLowerCase())
  );
  const matchingSkills = project.requiredSkills.filter(
    req => userSkills.some(s => s.toLowerCase() === req.toLowerCase())
  );

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to submit an application.', 'error');
      return;
    }
    if (!coverLetter.trim()) {
      showToast('Please include a brief cover letter outlining your background.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`,
          'x-devmatch-uid': user.uid
        },
        body: JSON.stringify({
          projectId: project.id,
          coverLetter: coverLetter.trim(),
          relevantSkills: user.skills
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit application');
      }

      showToast(`Application successfully submitted for "${project.title}"!`, 'success');
      setShowApplyForm(false);
      setCoverLetter('');
      onClose();
      if (onApplicationSuccess) onApplicationSuccess();
    } catch (err: any) {
      showToast(err.message || 'Error submitting application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to remove your project "${project.title}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.uid}`,
          'x-devmatch-uid': user?.uid || ''
        }
      });
      if (res.ok) {
        showToast('Personal project deleted.', 'info');
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="space-y-1 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              {project.isPersonalProject || project.projectType === 'Personal Project' ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-violet-100 text-violet-800 border border-violet-200 inline-flex items-center gap-1">
                  <FolderGit2 className="w-3 h-3 text-violet-600" />
                  <span>Personal Project</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                  {project.category}
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700">
                {project.projectType}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                {project.experienceLevel}
              </span>
              {project.status === 'closed' && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-700">
                  Closed
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{project.title}</h2>
            <p className="text-xs text-slate-500 font-medium">Posted by {project.ownerName}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(project.id)}
                className={`p-2 rounded-xl border transition-colors ${
                  isBookmarked
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
                aria-label="Bookmark project"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* Key metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{project.remoteAllowed ? 'Remote / ' + project.location : project.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{project.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{project.numberOfOpenings} open slot{project.numberOfOpenings > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Deadline: {project.applicationDeadline}</span>
            </div>
          </div>

          {/* GitHub / Demo / Scope Link Bar */}
          {(project.githubUrl || project.liveDemoUrl || project.lookingFor) && (
            <div className="p-3.5 rounded-xl bg-violet-50/70 border border-violet-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-violet-950">Personal Project Scope & Links</p>
                {project.lookingFor && (
                  <p className="text-violet-700 text-[11px] mt-0.5">Looking for: <span className="font-semibold">{project.lookingFor}</span></p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-violet-200 text-slate-800 font-semibold hover:text-indigo-600 transition-colors shadow-sm"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                )}
                {project.liveDemoUrl && (
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">About the Project</h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{project.description}</p>
          </div>

          {/* Skills Breakdown with User Compatibility */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Skill Requirements</h4>
            
            <div>
              <p className="text-xs font-semibold text-slate-800 mb-1.5">Required Skills (Must Have):</p>
              <div className="flex flex-wrap gap-1.5">
                {project.requiredSkills.map(skill => {
                  const hasSkill = userSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                  return (
                    <span
                      key={skill}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        hasSkill
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {hasSkill ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      )}
                      <span>{skill}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {project.optionalSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-800 mb-1.5">Preferred / Nice-to-Have Skills:</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.optionalSkills.map(skill => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50/70 text-indigo-700 border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-800 mb-1.5">Technologies Used:</p>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map(tech => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Missing Skills Guidance */}
          {user && missingSkills.length > 0 && onTakeAssessment && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900">Skill Gap Detected</p>
                <p className="text-amber-800 mt-0.5">
                  You are missing: <span className="font-semibold">{missingSkills.join(', ')}</span>. Take an adaptive assessment to verify and boost your match ranking!
                </p>
                <div className="flex gap-2 mt-2">
                  {missingSkills.map(sk => (
                    <button
                      key={sk}
                      onClick={() => { onClose(); onTakeAssessment(sk); }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Take {sk} Quiz</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Apply Form */}
          {showApplyForm ? (
            <form onSubmit={handleApply} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Submit Your Project Application
                </h4>
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Why are you a great fit for this project? (Cover Note)
                </label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Describe your hands-on experience with the required tech stack, relevant GitHub repos, or motivation for joining this project..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-500">
                  Your profile snapshot and verified assessment scores will be sent with this submission.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Confirm Application'}</span>
                </button>
              </div>
            </form>
          ) : null}
        </div>

        {/* Footer Action Bar */}
        {!showApplyForm && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {project.status === 'closed' ? (
                <span className="text-rose-600 font-medium">This project is closed for new submissions.</span>
              ) : (
                <span>Ready to collaborate? Submit your proposal directly.</span>
              )}
            </div>
            
            {user && project.ownerId === user.uid ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Your Published Project
                </span>
              </div>
            ) : project.status !== 'closed' && (
              <button
                onClick={() => {
                  if (!user) {
                    showToast('Please sign in to apply.', 'info');
                    return;
                  }
                  setShowApplyForm(true);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply Now</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
