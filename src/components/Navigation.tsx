import React from 'react';
import { AppTab } from '../types';

interface NavigationProps {
  currentTab: AppTab;
  onNavigate: (tab: AppTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#15121e]/90 backdrop-blur-xl shadow-[0_-8px_32px_rgba(15,12,24,0.6)] border-t border-[#2e2844]/40 no-print">
      <div className="flex justify-around items-center h-20 px-2 max-w-lg mx-auto relative">
        {/* Início */}
        <button
          type="button"
          onClick={() => onNavigate('inicio')}
          className={`flex flex-col items-center justify-center w-14 h-14 transition-all group cursor-pointer ${
            currentTab === 'inicio' ? 'text-[#cebdff]' : 'text-[#cac4d4] hover:text-[#e7dff1]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px] group-hover:scale-105 transition-transform">
            vital_signs
          </span>
          <span className={`text-[11px] mt-1 tracking-normal font-semibold ${currentTab === 'inicio' ? 'text-[#cebdff]' : 'text-[#948e9d]'}`}>
            Início
          </span>
        </button>

        {/* Clientes */}
        <button
          type="button"
          onClick={() => onNavigate('clientes')}
          className={`flex flex-col items-center justify-center w-14 h-14 transition-all group cursor-pointer ${
            currentTab === 'clientes' || currentTab === 'detalhes-cliente' ? 'text-[#cebdff]' : 'text-[#cac4d4] hover:text-[#e7dff1]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px] group-hover:scale-105 transition-transform">
            group
          </span>
          <span className={`text-[11px] mt-1 tracking-normal font-semibold ${currentTab === 'clientes' || currentTab === 'detalhes-cliente' ? 'text-[#cebdff]' : 'text-[#948e9d]'}`}>
            Clientes
          </span>
        </button>

        {/* Center Floating CTA: Nova Sessão */}
        <div className="relative flex items-center justify-center w-16 h-16 -mt-5">
          <button
            type="button"
            aria-label="Iniciar Nova Sessão de Atendimento"
            onClick={() => onNavigate('nova-sessao')}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#a78bfa] to-[#cebdff] text-[#3c1989] flex items-center justify-center shadow-[0_0_24px_rgba(167,139,250,0.45),0_6px_16px_rgba(15,12,24,0.6)] hover:brightness-110 active:scale-95 transition-all group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[28px] font-bold group-hover:rotate-90 transition-transform duration-300">
              add
            </span>
          </button>
        </div>

        {/* Histórico */}
        <button
          type="button"
          onClick={() => onNavigate('historico')}
          className={`flex flex-col items-center justify-center w-14 h-14 transition-all group cursor-pointer ${
            currentTab === 'historico' || currentTab === 'relatorio-sessao' ? 'text-[#cebdff]' : 'text-[#cac4d4] hover:text-[#e7dff1]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px] group-hover:scale-105 transition-transform">
            clinical_notes
          </span>
          <span className={`text-[11px] mt-1 tracking-normal font-semibold ${currentTab === 'historico' || currentTab === 'relatorio-sessao' ? 'text-[#cebdff]' : 'text-[#948e9d]'}`}>
            Histórico
          </span>
        </button>

        {/* Perfil */}
        <button
          type="button"
          onClick={() => onNavigate('perfil')}
          className={`flex flex-col items-center justify-center w-14 h-14 transition-all group cursor-pointer ${
            currentTab === 'perfil' ? 'text-[#cebdff]' : 'text-[#cac4d4] hover:text-[#e7dff1]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px] group-hover:scale-105 transition-transform">
            tune
          </span>
          <span className={`text-[11px] mt-1 tracking-normal font-semibold ${currentTab === 'perfil' ? 'text-[#cebdff]' : 'text-[#948e9d]'}`}>
            Perfil
          </span>
        </button>
      </div>
    </nav>
  );
};
