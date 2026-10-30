/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory, ExperienceLevel, ProjectType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Bookmark, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  X,
  Plus,
  Github,
  ExternalLink,
  Code2,
  FolderGit2
} from 'lucide-react';

interface BrowseProjectsViewProps {
  onOpenProject: (project: Project) => void;
  onTakeAssessment?: (skill: string) => void;
  onRequireAuth?: () => void;
}

export function BrowseProjectsView({ onOpenProject, onTakeAssessment, onRequireAuth }: BrowseProjectsViewProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'openings'>('newest');
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);

  // Add Personal Project Modal State
  const [showAddPersonalModal, setShowAddPersonalModal] = useState(false);
  const [personalTitle, setPersonalTitle] = useState('');
  const [personalCategory, setPersonalCategory] = useState<ProjectCategory>('Full-Stack');
  const [personalType, setPersonalType] = useState<ProjectType>('Personal Project');
  const [personalShortDesc, setPersonalShortDesc] = useState('');
  const [personalDesc, setPersonalDesc] = useState('');
  const [personalReqSkills, setPersonalReqSkills] = useState('');
  const [personalOptSkills, setPersonalOptSkills] = useState('');
  const [personalGithub, setPersonalGithub] = useState('');
  const [personalDemo, setPersonalDemo] = useState('');
  const [personalLookingFor, setPersonalLookingFor] = useState('Seeking Collaborators & Feedback');
  const [personalOpenings, setPersonalOpenings] = useState(2);
  const [personalExp, setPersonalExp] = useState<ExperienceLevel>('All Levels');
  const [submittingPersonal, setSubmittingPersonal] = useState(false);

  const categories: (ProjectCategory | 'All')[] = [
    'All',
    'Frontend',
    'Backend',
    'Full-Stack',
    'AI & ML',
    'Mobile',
    'Data Science',
    'Open-Source'
  ];

  const experienceLevels: (ExperienceLevel | 'All')[] = [
    'All',
    'Beginner',
    'Intermediate',
    'Advanced',
    'All Levels'
  ];

  const projectTypes: (ProjectType | 'All')[] = [
    'All',
    'Personal Project',
    'Open-source',
    'Student Project',
    'Internship',
    'Full-time',
    'Part-time',
    'Freelance'
  ];

  const popularSkills = [
    'All',
    'React',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'Python',
    'SQL',
    'REST APIs',
    'Data Structures and Algorithms'
  ];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedExperience !== 'All') params.set('experience', selectedExperience);
      if (selectedType !== 'All') params.set('projectType', selectedType);
      if (selectedSkill !== 'All') params.set('skill', selectedSkill);
      if (remoteOnly) params.set('remote', 'true');

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let list = data.projects as Project[];
        if (sortBy === 'openings') {
          list.sort((a, b) => b.numberOfOpenings - a.numberOfOpenings);
        }
        setProjects(list);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/bookmarks', {
        headers: { 'Authorization': `Bearer ${user.uid}`, 'x-devmatch-uid': user.uid }
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarkIds(data.bookmarkIds || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, selectedCategory, selectedExperience, selectedType, selectedSkill, remoteOnly, sortBy]);

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const toggleBookmark = async (projectId: string) => {
    if (!user) {
      showToast('Please sign in to save bookmarks.', 'info');
      if (onRequireAuth) onRequireAuth();
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.uid}`, 'x-devmatch-uid': user.uid }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bookmarked) {
          setBookmarkIds(prev => [...prev, projectId]);
          showToast('Project added to bookmarks.', 'success');
        } else {
          setBookmarkIds(prev => prev.filter(id => id !== projectId));
          showToast('Project removed from bookmarks.', 'info');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedExperience('All');
    setSelectedType('All');
    setSelectedSkill('All');
    setRemoteOnly(false);
  };

  const handleCreatePersonalProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to publish your personal project.', 'error');
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (!personalTitle.trim() || !personalDesc.trim() || !personalReqSkills.trim()) {
      showToast('Title, description, and at least one required skill are required.', 'error');
      return;
    }

    setSubmittingPersonal(true);
    try {
      const reqSkillsArray = personalReqSkills.split(',').map(s => s.trim()).filter(Boolean);
      const optSkillsArray = personalOptSkills.split(',').map(s => s.trim()).filter(Boolean);

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`,
          'x-devmatch-uid': user.uid
        },
        body: JSON.stringify({
          title: personalTitle.trim(),
          shortDescription: personalShortDesc.trim() || personalDesc.trim().substring(0, 140),
          description: personalDesc.trim(),
          category: personalCategory,
          projectType: personalType,
          isPersonalProject: true,
          requiredSkills: reqSkillsArray,
          optionalSkills: optSkillsArray,
          technologies: [...reqSkillsArray, ...optSkillsArray].slice(0, 6),
          experienceLevel: personalExp,
          location: 'Remote',
          remoteAllowed: true,
          numberOfOpenings: Number(personalOpenings) || 1,
          githubUrl: personalGithub.trim() || undefined,
          liveDemoUrl: personalDemo.trim() || undefined,
          lookingFor: personalLookingFor.trim() || undefined
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish personal project');
      }

      const data = await res.json();
      showToast('Personal project published to Explore Projects!', 'success');
      setShowAddPersonalModal(false);
      setPersonalTitle('');
      setPersonalShortDesc('');
      setPersonalDesc('');
      setPersonalReqSkills('');
      setPersonalOptSkills('');
      setPersonalGithub('');
      setPersonalDemo('');
      setProjects(prev => [data.project, ...prev]);
    } catch (err: any) {
      showToast(err.message || 'Error publishing project', 'error');
    } finally {
      setSubmittingPersonal(false);
    }
  };

  const hasActiveFilters = 
    search !== '' ||
    selectedCategory !== 'All' ||
    selectedExperience !== 'All' ||
    selectedType !== 'All' ||
    selectedSkill !== 'All' ||
    remoteOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Explore Projects</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {projects.length} Available
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse real developer opportunities, open-source initiatives, and developer personal side-projects.
          </p>
        </div>

        {/* Action Controls: Add Personal Project & Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Add Personal Project Button */}
          <button
            onClick={() => {
              if (!user) {
                showToast('Please sign in or use Demo Login to add your personal project.', 'info');
                if (onRequireAuth) onRequireAuth();
                return;
              }
              setShowAddPersonalModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Personal Project</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm text-xs">
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="newest">Recently Added</option>
              <option value="openings">Most Openings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search and Category Pill Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by keywords, technologies (e.g. React, Node, Python, Redis), or role..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filter Ribbon */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Skill selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Skill:</span>
            <select
              value={selectedSkill}
              onChange={e => setSelectedSkill(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700"
            >
              {popularSkills.map(sk => (
                <option key={sk} value={sk}>{sk}</option>
              ))}
            </select>
          </div>

          {/* Project Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700"
            >
              {projectTypes.map(typ => (
                <option key={typ} value={typ}>{typ}</option>
              ))}
            </select>
          </div>

          {/* Experience level */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Level:</span>
            <select
              value={selectedExperience}
              onChange={e => setSelectedExperience(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700"
            >
              {experienceLevels.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* Remote Checkbox */}
          <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={e => setRemoteOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span>Remote Only</span>
          </label>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1 text-[11px]"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Projects List Results */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No matching projects found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, or be the first to publish your personal project!
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear Filters
            </button>
            <button
              onClick={() => {
                if (!user && onRequireAuth) onRequireAuth();
                else setShowAddPersonalModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              + Add Personal Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const isBookmarked = bookmarkIds.includes(project.id);
            const userSkills = user?.skills || [];
            const matchingReqCount = project.requiredSkills.filter(req => 
              userSkills.some(s => s.toLowerCase() === req.toLowerCase())
            ).length;
            const isOwner = user && project.ownerId === user.uid;
            const isPersonal = project.isPersonalProject || project.projectType === 'Personal Project';

            return (
              <div
                key={project.id}
                className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isPersonal ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200 inline-flex items-center gap-1">
                          <FolderGit2 className="w-3 h-3 text-violet-600" />
                          <span>Personal Project</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {project.category}
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {project.projectType}
                      </span>
                      
                      {isOwner && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Yours
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleBookmark(project.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isBookmarked 
                          ? 'bg-amber-50 border-amber-300 text-amber-600' 
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      aria-label="Bookmark project"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <h3 
                    onClick={() => onOpenProject(project)}
                    className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-indigo-600 cursor-pointer mb-1.5"
                  >
                    {project.title}
                  </h3>

                  <p className="text-xs text-slate-500 mb-2 font-medium">
                    By {project.ownerName}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {project.shortDescription}
                  </p>

                  {/* Skills badges */}
                  <div className="space-y-1.5 mb-4">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {project.requiredSkills.map(sk => {
                        const hasIt = userSkills.some(s => s.toLowerCase() === sk.toLowerCase());
                        return (
                          <span
                            key={sk}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              hasIt
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {sk}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* External Project Links if present */}
                  {(project.githubUrl || project.liveDemoUrl) && (
                    <div className="flex items-center gap-2 mb-3 text-xs">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
                        >
                          <Github className="w-3 h-3" />
                          <span>Code</span>
                        </a>
                      )}
                      {project.liveDemoUrl && (
                        <a
                          href={project.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer metadata & CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="text-slate-500 text-[11px]">
                      {project.remoteAllowed ? 'Remote' : project.location} • {project.numberOfOpenings} collaborator{project.numberOfOpenings > 1 ? 's' : ''}
                    </p>
                    {user && (
                      <p className="text-[10px] text-indigo-600 font-semibold">
                        You have {matchingReqCount}/{project.requiredSkills.length} required skills
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenProject(project)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shrink-0"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Personal Project Modal */}
      {showAddPersonalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Your Personal Project</h3>
                  <p className="text-[11px] text-slate-500">Share your side-project or portfolio work with the developer community</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddPersonalModal(false)} 
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePersonalProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Name / Title</label>
                <input
                  type="text"
                  required
                  value={personalTitle}
                  onChange={e => setPersonalTitle(e.target.value)}
                  placeholder="e.g. NextGen Micro-SaaS Dashboard, AI Code Assistant, 3D Canvas Game"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={personalCategory}
                    onChange={e => setPersonalCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Full-Stack">Full-Stack</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Open-Source">Open-Source</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Type</label>
                  <select
                    value={personalType}
                    onChange={e => setPersonalType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Personal Project">Personal Project</option>
                    <option value="Open-source">Open-Source Initiative</option>
                    <option value="Student Project">Student Project</option>
                    <option value="Freelance">Freelance Collaboration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Tagline (1 sentence summary)</label>
                <input
                  type="text"
                  value={personalShortDesc}
                  onChange={e => setPersonalShortDesc(e.target.value)}
                  placeholder="e.g. A lightweight developer analytics engine with sub-second rendering"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tech Stack & Required Skills (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={personalReqSkills}
                  onChange={e => setPersonalReqSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js, Tailwind CSS"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Optional / Nice-to-Have Skills</label>
                <input
                  type="text"
                  value={personalOptSkills}
                  onChange={e => setPersonalOptSkills(e.target.value)}
                  placeholder="Docker, PostgreSQL, GraphQL"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Description & Architecture</label>
                <textarea
                  rows={3}
                  required
                  value={personalDesc}
                  onChange={e => setPersonalDesc(e.target.value)}
                  placeholder="What does this project do? What architecture did you use, and what are you working on next?"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GitHub Repo URL (Optional)</label>
                  <input
                    type="url"
                    value={personalGithub}
                    onChange={e => setPersonalGithub(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Live Demo URL (Optional)</label>
                  <input
                    type="url"
                    value={personalDemo}
                    onChange={e => setPersonalDemo(e.target.value)}
                    placeholder="https://myproject.vercel.app"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">I am Looking For:</label>
                  <select
                    value={personalLookingFor}
                    onChange={e => setPersonalLookingFor(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Seeking Collaborators & Feedback">Seeking Collaborators & Feedback</option>
                    <option value="Looking for Code Reviewers">Looking for Code Reviewers</option>
                    <option value="Looking for Co-developer">Looking for Co-developer</option>
                    <option value="Showcase / Portfolio Only">Showcase / Portfolio Only</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Collaborator Slots</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={personalOpenings}
                    onChange={e => setPersonalOpenings(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPersonalModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPersonal}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{submittingPersonal ? 'Publishing...' : 'Publish Personal Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
