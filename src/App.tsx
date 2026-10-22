import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { XpRewardToast } from './components/common/XpRewardToast';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingSurvey } from './pages/OnboardingSurvey';
import { DashboardPage } from './pages/DashboardPage';
import { SkillsCatalogPage } from './pages/SkillsCatalogPage';
import { SkillDetailPage } from './pages/SkillDetailPage';
import { AssessmentSetupPage } from './pages/AssessmentSetupPage';
import { AssessmentRunnerPage } from './pages/AssessmentRunnerPage';
import { AssessmentResultPage } from './pages/AssessmentResultPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { LearningRoadmapPage } from './pages/LearningRoadmapPage';
import { AITutorPage } from './pages/AITutorPage';
import { ProgressAnalyticsPage } from './pages/ProgressAnalyticsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { TestsPortalPage } from './pages/TestsPortalPage';
import { ExamInstructionsPage } from './pages/ExamInstructionsPage';
import { CodingLabPage } from './pages/CodingLabPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { ReattemptManagementPage } from './pages/ReattemptManagementPage';

function AppContent() {
  const { user, isAuthenticated, isApproved, accessStatus, isLoaded } = useAuth();
  const { currentView } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If user explicitly navigated to or is on access-denied
  if (currentView === 'access-denied') {
    return <AccessDeniedPage />;
  }

  // If user is not authenticated and is on auth page (or login/register)
  if (!isAuthenticated && (currentView === 'auth' || currentView === 'login' || currentView === 'register')) {
    return <AuthPage />;
  }

  // If user is not authenticated and on landing page
  if (!isAuthenticated && currentView === 'landing') {
    return <LandingPage />;
  }

  // If user is not authenticated and wants to browse tests or coding lab preview
  if (!isAuthenticated && (currentView === 'tests' || currentView === 'coding-lab')) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentView === 'tests' && <TestsPortalPage />}
          {currentView === 'coding-lab' && <CodingLabPage />}
        </main>
      </div>
    );
  }

  // If user is not authenticated, default to landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // If authenticated user is NOT approved by administrator -> Display Access Restricted Page!
  // Wait until access status check has executed (accessStatus.checked === true)
  if (accessStatus.checked && !isApproved) {
    return <AccessDeniedPage />;
  }

  // If user is authenticated & approved, but on survey/onboarding
  if (user && user.role !== 'admin' && (!user.onboardingCompleted || currentView === 'survey' || currentView === 'onboarding')) {
    return <OnboardingSurvey />;
  }

  // Full-screen test runner mode
  if (currentView === 'assessment') {
    return <AssessmentRunnerPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 min-w-0">
          {(currentView === 'dashboard' || currentView === 'landing') && <DashboardPage />}
          {currentView === 'tests' && <TestsPortalPage />}
          {(currentView === 'reattempts' || currentView === 'reattempt-tests') && <ReattemptManagementPage />}
          {currentView === 'exam-instructions' && <ExamInstructionsPage />}
          {currentView === 'coding-lab' && <CodingLabPage />}
          {currentView === 'skills' && <SkillsCatalogPage />}
          {currentView === 'skill-detail' && <SkillDetailPage />}
          {currentView === 'assessment-setup' && <AssessmentSetupPage />}
          {currentView === 'assessment-result' && <AssessmentResultPage />}
          {currentView === 'ai-insights' && <AIInsightsPage />}
          {(currentView === 'roadmap' || currentView === 'learning-roadmap') && <LearningRoadmapPage />}
          {currentView === 'ai-tutor' && <AITutorPage />}
          {(currentView === 'progress' || currentView === 'progress-analytics') && <ProgressAnalyticsPage />}
          {currentView === 'achievements' && <AchievementsPage />}
          {(currentView === 'admin' || currentView === 'admin-dashboard') && <AdminDashboardPage />}
          {currentView === 'profile' && <ProfilePage />}
          {currentView === 'settings' && <SettingsPage />}
        </main>
      </div>

      <XpRewardToast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
