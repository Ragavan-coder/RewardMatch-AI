import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CinematicIntro } from './components/CinematicIntro';
import { LoginPage } from './components/LoginPage';
import { LoginSuccessLoading } from './components/LoginSuccessLoading';
import { Dashboard } from './components/Dashboard';
import { PublicExplorerPage, type ExplorerTab } from './components/PublicExplorerPage';

interface UserSession {
  name: string;
  email: string;
  isDemoUser?: boolean;
}

export const App: React.FC = () => {
  // Page routing state: 'intro' | 'explorer' | 'login' | 'loading' | 'dashboard'
  const [currentView, setCurrentView] = useState<'intro' | 'explorer' | 'login' | 'loading' | 'dashboard'>('intro');
  const [explorerTab, setExplorerTab] = useState<ExplorerTab>('cards');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Authentication handlers
  const handleAuthenticated = (email: string, name?: string) => {
    setCurrentUser({
      name: name && name.trim() ? name : email.split('@')[0],
      email,
      isDemoUser: false,
    });
    // Smoothly transition into the Login Successful pipeline verification screen
    setCurrentView('loading');
  };

  const handleDemoAccess = () => {
    localStorage.setItem('rewardmatch_token', 'demo_session_token_rewardmatch');
    setCurrentUser({
      name: 'Ragavan (Demo)',
      email: 'ragavan@example.com',
      isDemoUser: true,
    });
    // Smoothly transition into the Login Successful pipeline verification screen
    setCurrentView('loading');
  };

  const handleSignOut = () => {
    localStorage.removeItem('rewardmatch_token');
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleOpenExplorer = (tab?: ExplorerTab) => {
    if (tab) setExplorerTab(tab);
    setCurrentView('explorer');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] antialiased overflow-x-hidden font-sans">
      <AnimatePresence mode="wait">
        {/* PAGE 1: CINEMATIC INTRO & PRODUCT SHOWCASE */}
        {currentView === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
          >
            <CinematicIntro
              onGetStarted={() => setCurrentView('login')}
              onOpenExplorer={handleOpenExplorer}
            />
          </motion.div>
        )}

        {/* PAGE 1.5: PUBLIC CARD & REWARDS CATALOG EXPLORER (BEFORE ENTERING DASHBOARD) */}
        {currentView === 'explorer' && (
          <motion.div
            key="explorer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <PublicExplorerPage
              initialTab={explorerTab}
              onBackToIntro={() => setCurrentView('intro')}
              onEnterDashboard={() => setCurrentView('login')}
            />
          </motion.div>
        )}

        {/* PAGE 2: SECURE LOGIN & AUTHENTICATION */}
        {currentView === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <LoginPage
              onLoginSuccess={handleAuthenticated}
              onExploreDemo={handleDemoAccess}
              onViewIntro={() => setCurrentView('intro')}
              onOpenExplorer={() => handleOpenExplorer('cards')}
            />
          </motion.div>
        )}

        {/* PAGE 2.5: LOGIN SUCCESSFUL PIPELINE VERIFICATION (AS REQUESTED) */}
        {currentView === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <LoginSuccessLoading
              userName={currentUser?.name || 'Ragavan'}
              userEmail={currentUser?.email || 'user@example.com'}
              onComplete={() => setCurrentView('dashboard')}
              onSignOut={handleSignOut}
            />
          </motion.div>
        )}

        {/* PAGE 3: REWARDMATCH FINTECH DASHBOARD */}
        {currentView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <Dashboard
              currentUser={currentUser || { name: 'Ragavan', email: 'ragavan@example.com', isDemoUser: true }}
              onBackToIntro={() => setCurrentView('intro')}
              onSignOut={handleSignOut}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
