import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeView } from './views/HomeView';
import { ClientsView } from './views/ClientsView';
import { ClientDetailView } from './views/ClientDetailView';
import { NewSessionView } from './views/NewSessionView';
import { HistoryView } from './views/HistoryView';
import { ReportView } from './views/ReportView';
import { ProfileView } from './views/ProfileView';
import { AppTab } from './types';

const AppContent: React.FC = () => {
  const { user, profile, isDemo, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<AppTab>('inicio');
  const [hasCheckedBranding, setHasCheckedBranding] = useState(false);

  // Se o Practitioner ainda não tiver marca cadastrada, abrir automaticamente a tela de edição do perfil com os campos em destaque
  React.useEffect(() => {
    if (!loading && (user || isDemo) && profile && !hasCheckedBranding) {
      if (!profile.marcaCompleta || !profile.marcaCurta) {
        setCurrentTab('perfil');
      }
      setHasCheckedBranding(true);
    }
  }, [loading, user, isDemo, profile, hasCheckedBranding]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#15121e] text-[#e7dff1] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full bg-[#211e2a] border border-[#2e2844] flex items-center justify-center shadow-[0_0_24px_rgba(167,139,250,0.3)] mb-4 animate-pulse">
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1WOsx4_sGUcyvNqO56n_4xIwpNKYvFYILJdKzh9S4yO5j-WdtTkDFm0DNMt5fQ7xzTadSn2eXgEoH7SILbNjS4gzKGjBEkeTKwDuNjv0hbF-yN6LLPftNU75xOmqGmjnT-INwlZMIzMcS3mN_fh2dvD04LhH-TH21kcvv58ispOOb4MK7nFF71joNwTdleERuRDAr1NcqfD1j6K_QvvrFEhCe08zhEONkZl7hVCsoJiZAKilT3Ms5qsmtE"
            alt="Chakra Flow"
            className="w-10 h-10 object-contain"
          />
        </div>
        <p className="font-playfair text-lg text-[#cebdff] font-semibold">Chakra Flow</p>
        <p className="text-xs text-[#948e9d] mt-1">Sincronizando ambiente do consultório...</p>
      </div>
    );
  }

  if (!user && !isDemo) {
    return <AuthScreen />;
  }

  const renderActiveView = () => {
    switch (currentTab) {
      case 'inicio':
        return <HomeView onNavigate={setCurrentTab} />;
      case 'clientes':
        return <ClientsView onNavigate={setCurrentTab} />;
      case 'detalhes-cliente':
        return <ClientDetailView onNavigate={setCurrentTab} />;
      case 'nova-sessao':
        return <NewSessionView onNavigate={setCurrentTab} />;
      case 'historico':
        return <HistoryView onNavigate={setCurrentTab} />;
      case 'relatorio-sessao':
        return <ReportView onNavigate={setCurrentTab} />;
      case 'perfil':
        return <ProfileView onNavigate={setCurrentTab} />;
      default:
        return <HomeView onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#15121e] text-[#e7dff1] flex flex-col antialiased selection:bg-[#a78bfa] selection:text-[#3c1989]">
      <Header currentTab={currentTab} onNavigate={setCurrentTab} />

      <main className="flex-1 flex flex-col relative w-full max-w-lg mx-auto px-4 sm:px-5 pt-20 pb-28">
        {renderActiveView()}
      </main>

      <Navigation currentTab={currentTab} onNavigate={setCurrentTab} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
