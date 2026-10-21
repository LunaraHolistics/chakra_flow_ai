import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AppTab } from '../types';

interface HeaderProps {
  currentTab: AppTab;
  onNavigate: (tab: AppTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate }) => {
  const { profile } = useAuth();

  const getTabLabel = (tab: AppTab): string => {
    switch (tab) {
      case 'inicio':
        return 'Início';
      case 'clientes':
        return 'Clientes';
      case 'nova-sessao':
        return 'Nova Sessão';
      case 'historico':
        return 'Histórico';
      case 'perfil':
        return 'Perfil';
      case 'detalhes-cliente':
        return 'Detalhes Do Cliente';
      case 'relatorio-sessao':
        return 'Relatório Da Sessão';
      default:
        return 'Chakra Flow';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#15121e]/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,12,24,0.45)] pt-safe border-b border-[#2e2844]/40 no-print">
      <div className="h-16 px-4 sm:px-6 max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {(currentTab === 'detalhes-cliente' || currentTab === 'relatorio-sessao' || currentTab === 'nova-sessao') && (
            <button
              aria-label="Voltar"
              onClick={() => {
                if (currentTab === 'relatorio-sessao') onNavigate('historico');
                else if (currentTab === 'detalhes-cliente') onNavigate('clientes');
                else onNavigate('inicio');
              }}
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#cac4d4] hover:text-[#e7dff1] transition-colors active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
            </button>
          )}

          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => onNavigate('inicio')}
          >
            <img
              alt="Chakra Flow Logo"
              className="h-7 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WOsx4_sGUcyvNqO56n_4xIwpNKYvFYILJdKzh9S4yO5j-WdtTkDFm0DNMt5fQ7xzTadSn2eXgEoH7SILbNjS4gzKGjBEkeTKwDuNjv0hbF-yN6LLPftNU75xOmqGmjnT-INwlZMIzMcS3mN_fh2dvD04LhH-TH21kcvv58ispOOb4MK7nFF71joNwTdleERuRDAr1NcqfD1j6K_QvvrFEhCe08zhEONkZl7hVCsoJiZAKilT3Ms5qsmtE"
            />
            <div className="flex flex-col">
              <span className="font-playfair text-base font-semibold tracking-tight text-[#e7dff1] leading-none">
                Chakra Flow
              </span>
              <span className="text-[10px] text-[#a78bfa] font-bold uppercase tracking-widest mt-0.5">
                {getTabLabel(currentTab)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Notificações do Consultório"
            onClick={() => alert('Atendimentos em Dia: Todas as frequências e registros estão atualizados.')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#cac4d4] hover:text-[#e7dff1] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>

          <button
            aria-label="Perfil do Terapeuta"
            onClick={() => onNavigate('perfil')}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-transform active:scale-95 cursor-pointer"
          >
            <img
              alt={profile?.name || 'Terapeuta'}
              className="w-8 h-8 rounded-full object-cover shadow-[0_0_12px_rgba(167,139,250,0.35)] ring-1 ring-[#a78bfa]/50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBb3FY_DkiPnLcUIbQm01Gb-yr4VJohinuACBgAcGRiXnuSKiBOw0e0haJwety3douZnNR7b2sjz0KJxqX-LDKGeCFNHkES27XR_Cl2s_QA2thXSkDnoJ-24yCvojy1w2uNtfdDigyJpoPfNeVJJ4er1I7-BuTJ9cz9N3gMSxyLXQwOB9_rDZlHCK5enTSXvyaBt59FNMx4ezvyryRbyoWh7Y9beZTTrkDcTQco3bv4xSK8MCV8DUj4"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
