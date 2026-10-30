/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AssessmentResult, ExperienceLevel } from '../types';
import { 
  User, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Globe, 
  Github, 
  Linkedin, 
  Plus, 
  X, 
  Save, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ProfileViewProps {
  onTakeAssessment: (skill: string) => void;
}

export function ProfileView({ onTakeAssessment }: ProfileViewProps) {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Intermediate');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setEducation(user.education || '');
      setExperienceLevel(user.experienceLevel || 'Intermediate');
      setSkills(user.skills || []);
      setPortfolioUrl(user.portfolioUrl || '');
      setGithubUrl(user.githubUrl || '');
      setLinkedinUrl(user.linkedinUrl || '');

      fetch('/api/assessments/history', {
        headers: { 'Authorization': `Bearer ${user.uid}`, 'x-devmatch-uid': user.uid }
      })
        .then(r => r.json())
        .then(d => setAssessments(d.assessments || []))
        .catch(err => console.error(err));
    }
  }, [user]);

  if (!user) return null;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSkill.trim();
    if (!clean) return;
    if (skills.some(s => s.toLowerCase() === clean.toLowerCase())) {
      showToast('Skill already added', 'info');
      return;
    }
    setSkills(prev => [...prev, clean]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await updateProfile({
        name,
        bio,
        location,
        education,
        experienceLevel,
        skills,
        portfolioUrl,
        githubUrl,
        linkedinUrl
      });
      if (ok) {
        showToast('Profile successfully updated and synchronized.', 'success');
      } else {
        showToast('Failed to update profile.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Developer Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Your declared skills and verified assessment records drive recommendation scoring.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Personal Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA / Remote"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Education / Degree</label>
              <input
                type="text"
                value={education}
                onChange={e => setEducation(e.target.value)}
                placeholder="e.g. B.S. Computer Science"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={e => setExperienceLevel(e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">About Me / Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Share your software engineering focus, preferred tech stacks, and career goals..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Skills Tag Management Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Technical Skills ({skills.length})
            </h3>
            <span className="text-[11px] text-slate-400">Add languages, frameworks, and databases</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map(sk => (
              <span
                key={sk}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold"
              >
                <span>{sk}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(sk)}
                  className="text-indigo-400 hover:text-indigo-700 p-0.5"
                  aria-label={`Remove ${sk}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add skill input */}
          <div className="flex items-center gap-2 max-w-sm pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              placeholder="e.g. Docker, GraphQL, Redis"
              className="flex-1 p-2 border border-slate-300 rounded-lg text-xs"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* External Links Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Online Presence</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Portfolio Website</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={e => setPortfolioUrl(e.target.value)}
                placeholder="https://myportfolio.dev"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GitHub Profile</label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/myusername"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/myusername"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Verified Assessments Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Verified Assessments ({assessments.length})
            </h3>
            <p className="text-xs text-slate-500">Official quiz ratings stored in database</p>
          </div>
        </div>

        {assessments.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No assessments completed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assessments.map(asmt => (
              <div key={asmt.assessmentId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{asmt.skill}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-100 text-emerald-800">
                      {asmt.proficiencyLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Score: <span className="font-bold text-slate-800">{asmt.percentageScore}%</span> ({asmt.correctAnswers}/{asmt.totalQuestions} questions)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Completed: {new Date(asmt.completedAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => onTakeAssessment(asmt.skill)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50"
                >
                  Retake
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
