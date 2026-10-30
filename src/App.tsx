/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { BrowseProjectsView } from './views/BrowseProjectsView';
import { RecommendedMatchesView } from './views/RecommendedMatchesView';
import { SkillAssessmentView } from './views/SkillAssessmentView';
import { QuizResultsView } from './views/QuizResultsView';
import { MyApplicationsView } from './views/MyApplicationsView';
import { RecruiterStudioView } from './views/RecruiterStudioView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { ProjectDetailsModal } from './views/ProjectDetailsModal';
import { AuthModal } from './views/AuthModal';
import { AssessmentResult, Project } from './types';

function MainApp() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentView, setCurrentView] = useState<string>('landing');
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [lastAssessmentResult, setLastAssessmentResult] = useState<AssessmentResult | null>(null);
  const [assessmentTargetSkill, setAssessmentTargetSkill] = useState<string>('React');
  const [bookmarkedProjectIds, setBookmarkedProjectIds] = useState<string[]>([]);

  // Fetch initial projects & bookmarks
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.projects) setFeaturedProjects(data.projects);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (user) {
      fetch('/api/bookmarks', {
        headers: { 'Authorization': `Bearer ${user.uid}`, 'x-devmatch-uid': user.uid }
      })
        .then(res => res.json())
        .then(data => {
          if (data.bookmarkIds) setBookmarkedProjectIds(data.bookmarkIds);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setProjectModalOpen(true);
  };

  const handleOpenProjectById = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setSelectedProject(data.project);
          setProjectModalOpen(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartQuizForSkill = (skill: string) => {
    if (!user) {
      setPendingDestination('assessment');
      setAssessmentTargetSkill(skill);
      setAuthMode('login');
      setAuthModalOpen(true);
      showToast('Please sign in or use Demo Login to launch the adaptive quiz.', 'info');
      return;
    }
    setAssessmentTargetSkill(skill);
    setCurrentView('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAssessmentCompleted = (result: AssessmentResult) => {
    setLastAssessmentResult(result);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBookmark = async (projectId: string) => {
    if (!user) {
      setAuthMode('login');
      setAuthModalOpen(true);
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
          setBookmarkedProjectIds(prev => [...prev, projectId]);
          showToast('Project bookmarked', 'success');
        } else {
          setBookmarkedProjectIds(prev => prev.filter(id => id !== projectId));
          showToast('Bookmark removed', 'info');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [pendingDestination, setPendingDestination] = useState<string | null>(null);

  const handleNavigate = (view: string) => {
    const protectedViews = ['dashboard', 'recommendations', 'assessment', 'applications', 'recruiter', 'profile'];
    if (protectedViews.includes(view) && !user) {
      setPendingDestination(view);
      setAuthMode('login');
      setAuthModalOpen(true);
      showToast('Please sign in or create an account to access this section.', 'info');
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user just logged in and had a pending destination, redirect there
  useEffect(() => {
    if (user && pendingDestination) {
      setCurrentView(pendingDestination);
      setPendingDestination(null);
    }
  }, [user, pendingDestination]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={(mode = 'login') => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingView
            featuredProjects={featuredProjects}
            onExploreProjects={() => handleNavigate('projects')}
            onStartQuiz={() => handleStartQuizForSkill('React')}
            onOpenProject={handleOpenProject}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            onNavigate={handleNavigate}
            onOpenProject={handleOpenProject}
          />
        )}

        {currentView === 'projects' && (
          <BrowseProjectsView
            onOpenProject={handleOpenProject}
            onTakeAssessment={handleStartQuizForSkill}
            onRequireAuth={() => {
              setPendingDestination('projects');
              setAuthMode('login');
              setAuthModalOpen(true);
            }}
          />
        )}

        {currentView === 'recommendations' && (
          <RecommendedMatchesView
            onOpenProject={handleOpenProject}
            onTakeAssessment={handleStartQuizForSkill}
          />
        )}

        {currentView === 'assessment' && (
          <SkillAssessmentView
            initialSkill={assessmentTargetSkill}
            onAssessmentCompleted={handleAssessmentCompleted}
            onCancel={() => handleNavigate('projects')}
          />
        )}

        {currentView === 'results' && lastAssessmentResult && (
          <QuizResultsView
            result={lastAssessmentResult}
            onRetake={() => handleStartQuizForSkill(lastAssessmentResult.skill)}
            onViewMatches={() => handleNavigate('recommendations')}
          />
        )}

        {currentView === 'applications' && (
          <MyApplicationsView
            onOpenProjectById={handleOpenProjectById}
            onExploreProjects={() => handleNavigate('projects')}
          />
        )}

        {currentView === 'recruiter' && (
          <RecruiterStudioView />
        )}

        {currentView === 'profile' && (
          <ProfileView
            onTakeAssessment={handleStartQuizForSkill}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        isBookmarked={selectedProject ? bookmarkedProjectIds.includes(selectedProject.id) : false}
        onToggleBookmark={toggleBookmark}
        onApplicationSuccess={() => {
          setProjectModalOpen(false);
          handleNavigate('applications');
        }}
        onTakeAssessment={handleStartQuizForSkill}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
