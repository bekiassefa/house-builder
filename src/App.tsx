import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { TransactionsList } from './components/transactions/TransactionsList';
import { ContractsList } from './components/contracts/ContractsList';
import { LaborPayments } from './components/labor/LaborPayments';
import { DailyPlanner } from './components/planner/DailyPlanner';
import { Reports } from './components/reports/Reports';
import { ProjectsList } from './components/projects/ProjectsList';
import { ConstructionProgress } from './components/progress/ConstructionProgress';
import { VisitsList } from './components/visits/VisitsList';
import { GlobalAiAssistant } from './components/ai/GlobalAiAssistant';
import { Toaster } from 'sonner';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <TransactionsList />;
      case 'contracts':
        return <ContractsList />;
      case 'labor':
        return <LaborPayments />;
      case 'planner':
        return <DailyPlanner />;
      case 'reports':
        return <Reports />;
      case 'projects':
        return <ProjectsList />;
      case 'progress':
        return <ConstructionProgress />;
      case 'visits':
        return <VisitsList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex flex-col md:flex-row">
        <aside className="hidden md:block w-64 min-h-[calc(100vh-3.5rem)] sticky top-14 border-r border-border bg-card/50">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden mb-20 md:mb-0">
          {renderContent()}
        </main>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <GlobalAiAssistant />
      <Toaster />
    </div>
  );
}

const Index = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default Index;