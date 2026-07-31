import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';

import LandingPage from './views/LandingPage';
import AuthPage from './views/AuthPage';
import WorkspacePage from './views/WorkspacePage';
import PdfUploadPage from './views/PdfUploadPage';
import ProcessingScreen from './views/ProcessingScreen';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

import DashboardHome from './views/DashboardHome';
import ResearchPapersView from './views/ResearchPapersView';
import ComparisonTableView from './views/ComparisonTableView';
import SemanticSearchView from './views/SemanticSearchView';
import AiChatView from './views/AiChatView';
import KnowledgeGraphView from './views/KnowledgeGraphView';
import CitationRecommendationView from './views/CitationRecommendationView';
import LiteratureReviewView from './views/LiteratureReviewView';
import ResearchTrendsView from './views/ResearchTrendsView';
import ResearchGapsView from './views/ResearchGapsView';
import AuthorAnalyticsView from './views/AuthorAnalyticsView';
import AnalyticsView from './views/AnalyticsView';
import SettingsView from './views/SettingsView';

function MainAppContent() {
  const { isAuthenticated } = useAuth();
  const { activeWorkspace } = useWorkspace();

  // Screen modes: 'landing', 'auth', 'workspace', 'upload', 'processing', 'dashboard'
  const [screen, setScreen] = useState('landing');
  const [authTab, setAuthTab] = useState('login');
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  // Sync dark theme class on HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // State flow handling
  if (!isAuthenticated) {
    if (screen === 'auth') {
      return (
        <AuthPage
          initialTab={authTab}
          onSuccess={() => setScreen('workspace')}
        />
      );
    }
    return (
      <LandingPage
        onLogin={() => { setAuthTab('login'); setScreen('auth'); }}
        onGetStarted={() => { setAuthTab('signup'); setScreen('auth'); }}
      />
    );
  }

  // After login -> Open Workspace Selection Page
  if (screen === 'workspace') {
    return (
      <WorkspacePage
        onSelectWorkspace={(ws) => setScreen('upload')}
        onCreateWorkspaceClick={() => setScreen('upload')}
      />
    );
  }

  // PDF Upload Page
  if (screen === 'upload') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-12">
        <PdfUploadPage
          onUploadFinished={() => setScreen('processing')}
        />
      </div>
    );
  }

  // Multi-step Processing Screen
  if (screen === 'processing') {
    return (
      <ProcessingScreen
        onComplete={() => setScreen('dashboard')}
      />
    );
  }

  // Main Dashboard Shell
  return (
    <div className="min-h-screen bg-surface-bg dark:bg-surface-darkBg text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'workspace') {
            setScreen('workspace');
          } else {
            setCurrentView(view);
          }
        }}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300">
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          toggleTheme={toggleTheme}
          setCurrentView={setCurrentView}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && <DashboardHome setCurrentView={setCurrentView} />}
          {currentView === 'papers' && <ResearchPapersView />}
          {currentView === 'comparison-table' && <ComparisonTableView />}
          {currentView === 'upload' && <PdfUploadPage onUploadFinished={() => setScreen('processing')} />}
          {currentView === 'semantic-search' && <SemanticSearchView />}
          {currentView === 'knowledge-graph' && <KnowledgeGraphView />}
          {currentView === 'ai-chat' && <AiChatView />}
          {currentView === 'citation-rec' && <CitationRecommendationView />}
          {currentView === 'lit-review' && <LiteratureReviewView />}
          {currentView === 'research-trends' && <ResearchTrendsView />}
          {currentView === 'research-gaps' && <ResearchGapsView />}
          {currentView === 'authors' && <AuthorAnalyticsView />}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'settings' && <SettingsView theme={theme} toggleTheme={toggleTheme} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <MainAppContent />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
