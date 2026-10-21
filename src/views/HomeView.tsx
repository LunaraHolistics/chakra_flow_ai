import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AppTab, SessionModel } from '../types';

interface HomeViewProps {
  onNavigate: (tab: AppTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { clients, sessions, setSelectedClient, setSelectedSession } = useData();
  const [filter, setFilter] = useState<'all' | 'today' | 'critical'>('all');

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
  const therapistName = profile?.name ? profile.name : 'Dra. Helena';

  // Stats calculations
  const totalClients = clients.length;
  const sessionsThisMonth = sessions.length;
  const criticalCount = clients.filter((c) => c.status === 'attention' || c.averageScore < 65).length;

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'critical') return s.overallScore < 65 || s.attentionCount > 0;
    if (filter === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10);
      return s.sessionDate.includes(todayStr) || s.sessionDate.includes('2024-10-24');
    }
    return true;
  });

  const handleOpenSessionReport = (session: SessionModel) => {
    setSelectedSession(session);
    const client = clients.find((c) => c.id === session.clientId);
    if (client) setSelectedClient(client);
    onNavigate('relatorio-sessao');
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Greeting & Clinical Status Header */}
      <header className="flex flex-col gap-1 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.6)]" />
            <span className="text-[10px] text-[#4edea3] font-bold uppercase tracking-widest">
              Consultório Ativo
            </span>
          </div>
          <span className="text-xs text-[#cac4d4]">Sincronia Estável</span>
        </div>
        <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#e7dff1] tracking-tight">
          {greeting}, {therapistName}
        </h1>
        <p className="text-xs text-[#948e9d]">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} • {totalClients} interagentes ativos
        </p>
      </header>

      {/* Diagnostic Action Banner (Hero Card) */}
      <section
        aria-label="Ação Rápida"
        className="relative overflow-hidden rounded-2xl bg-[#211e2a] border border-[#2e2844] p-5 shadow-xl"
      >
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-[#a78bfa]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-10 w-36 h-36 rounded-full bg-[#4edea3]/15 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4a3d7c] flex items-center justify-center text-[#baabf3] shadow-[0_0_16px_rgba(167,139,250,0.3)]">
                <span className="material-symbols-outlined text-[20px]">magic_button</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#cebdff] uppercase tracking-wider font-bold">
                  Protocolo Bioenergético
                </span>
                <span className="font-playfair text-lg font-medium text-[#e7dff1]">
                  Nova Avaliação Rápida
                </span>
              </div>
            </div>
            <span className="text-[11px] text-[#cac4d4] bg-[#1d1a26] px-2.5 py-0.5 rounded-full border border-[#2e2844]">
              v2.4
            </span>
          </div>
          <p className="text-xs text-[#cac4d4] leading-relaxed">
            Inicie a leitura bio-ressonante para calibrar os 8 centros sutis e emitir a matriz de bioalinhamento do interagente.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('nova-sessao')}
            className="w-full h-12 rounded-full bg-[#a78bfa] hover:bg-[#cebdff] text-[#3c1989] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(167,139,250,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">sensors</span>
            <span>Iniciar Nova Avaliação Energética</span>
          </button>
        </div>
      </section>

      {/* Metric KPI Cards */}
      <section aria-label="Indicadores do Consultório" className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] text-[#948e9d] uppercase tracking-widest font-bold">
            Visão Geral • {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <span className="text-xs text-[#a78bfa] flex items-center gap-1 font-medium">
            Tempo Real
            <span className="material-symbols-outlined text-[14px]">auto_graph</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Total Clientes */}
          <div
            onClick={() => onNavigate('clientes')}
            className="bg-[#1a1626] border border-[#2e2844] p-3.5 rounded-2xl flex flex-col justify-between shadow-md cursor-pointer hover:border-[#a78bfa]/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#cac4d4]">Clientes</span>
              <span className="material-symbols-outlined text-[16px] text-[#4edea3]">trending_up</span>
            </div>
            <div className="my-1">
              <span className="font-playfair text-2xl text-[#e7dff1] font-semibold">{totalClients}</span>
            </div>
            <div className="flex items-center">
              <span className="text-[9px] text-[#4edea3] bg-[#0f0c18] px-1.5 py-0.5 rounded-full font-bold">
                Ativos
              </span>
            </div>
          </div>

          {/* Card 2: Sessões no Mês */}
          <div
            onClick={() => onNavigate('historico')}
            className="bg-[#1a1626] border border-[#2e2844] p-3.5 rounded-2xl flex flex-col justify-between shadow-md cursor-pointer hover:border-[#a78bfa]/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#cac4d4]">Sessões</span>
              <span className="text-[10px] text-[#a78bfa] font-bold">100%</span>
            </div>
            <div className="my-1">
              <span className="font-playfair text-2xl text-[#e7dff1] font-semibold">{sessionsThisMonth}</span>
            </div>
            <div className="w-full bg-[#363340] h-[3px] rounded-full overflow-hidden">
              <div className="bg-[#a78bfa] h-full rounded-full shadow-[0_0_8px_rgba(167,139,250,0.8)]" style={{ width: '85%' }} />
            </div>
          </div>

          {/* Card 3: Atenção Prioritária */}
          <div
            onClick={() => {
              setFilter('critical');
            }}
            className="bg-[#1a1626] border border-[#2e2844] p-3.5 rounded-2xl flex flex-col justify-between shadow-md cursor-pointer hover:border-[#f97316]/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#cac4d4]">Atenção</span>
              <span className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_6px_rgba(249,115,22,0.8)] animate-pulse" />
            </div>
            <div className="my-1">
              <span className="font-playfair text-2xl text-[#ffb4ab] font-semibold">
                {String(criticalCount).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-[9px] text-[#ffb4ab] bg-[#0f0c18] px-1.5 py-0.5 rounded-full font-bold">
                &lt; 65% VIB
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Filter Tabs */}
      <nav aria-label="Filtro de Sessões" className="flex items-center gap-1 p-1 bg-[#0f0c18] rounded-full border border-[#2e2844]/60">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all text-center cursor-pointer ${
            filter === 'all'
              ? 'bg-[#4a3d7c] text-[#e7deff] shadow-sm'
              : 'text-[#cac4d4] hover:text-[#e7dff1]'
          }`}
        >
          Todas ({sessions.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('today')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all text-center cursor-pointer ${
            filter === 'today'
              ? 'bg-[#4a3d7c] text-[#e7deff] shadow-sm'
              : 'text-[#cac4d4] hover:text-[#e7dff1]'
          }`}
        >
          Hoje
        </button>
        <button
          type="button"
          onClick={() => setFilter('critical')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
            filter === 'critical'
              ? 'bg-[#4a3d7c] text-[#e7deff] shadow-sm'
              : 'text-[#cac4d4] hover:text-[#e7dff1]'
          }`}
        >
          Críticas
          <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
        </button>
      </nav>

      {/* Section: Sessões Recentes */}
      <section aria-label="Sessões Recentes" className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <h2 className="font-playfair text-lg font-semibold text-[#e7dff1]">
              Sessões Recentes de Atendimento
            </h2>
            <span className="text-[10px] text-[#948e9d] uppercase tracking-wider font-bold">
              Últimos atendimentos sincronizados
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('historico')}
            className="text-xs text-[#a78bfa] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Ver Todas
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {filteredSessions.map((session) => {
          const isOverallBalanced = session.overallScore >= 65;
          return (
            <article
              key={session.id}
              onClick={() => handleOpenSessionReport(session)}
              className="bg-[#1a1626] border border-[#2e2844] rounded-2xl p-4 flex flex-col gap-3 shadow-md hover:border-[#a78bfa]/50 transition-all cursor-pointer relative overflow-hidden group"
            >
              {/* Warning ambient halo if critical */}
              {!isOverallBalanced && (
                <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-[#f97316]/10 blur-2xl pointer-events-none" />
              )}

              {/* Top row */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#2c2835] text-[#cebdff] flex items-center justify-center font-playfair text-sm font-semibold border border-[#494552]">
                      {session.clientName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#1a1626] ${
                        isOverallBalanced ? 'bg-[#4edea3]' : 'bg-[#f97316]'
                      }`}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-[#e7dff1] group-hover:text-[#cebdff] transition-colors truncate">
                      {session.clientName}
                    </span>
                    <span className="text-xs text-[#948e9d] truncate">
                      {session.sessionDate} • {session.sessionType === 'presential' ? 'Presencial' : 'Telemetria'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={`font-playfair text-2xl font-bold leading-none ${
                      isOverallBalanced ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                    }`}
                  >
                    {session.overallScore}%
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                      isOverallBalanced ? 'text-[#4edea3]' : 'text-[#f97316]'
                    }`}
                  >
                    {isOverallBalanced ? 'Equilibrado' : 'Requer Atenção'}
                  </span>
                </div>
              </div>

              {/* Breathing Gauge */}
              <div className="flex flex-col gap-1 relative z-10">
                <div className="flex items-center justify-between text-xs text-[#cac4d4]">
                  <span>Ressonância Global</span>
                  <span className={isOverallBalanced ? 'text-[#4edea3]' : 'text-[#f97316] font-medium'}>
                    {isOverallBalanced ? 'Bio-campo Estável' : `${session.attentionCount} vórtices em atenção`}
                  </span>
                </div>
                <div className="w-full bg-[#2c2835] h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isOverallBalanced
                        ? 'bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.7)]'
                        : 'bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.7)]'
                    }`}
                    style={{ width: `${session.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Chakra Micro-Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 relative z-10 no-scrollbar">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#15121e] border border-[#2e2844] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                  <span className="text-[9px] text-[#cac4d4]">Básico: {session.scores.basico}%</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#15121e] border border-[#2e2844] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  <span className="text-[9px] text-[#cac4d4]">Cardíaco: {session.scores.cardiaco}%</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#15121e] border border-[#2e2844] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                  <span className="text-[9px] text-[#cac4d4]">Frontal: {session.scores.frontal}%</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#15121e] border border-[#2e2844] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
                  <span className="text-[9px] text-[#cac4d4]">Coronário: {session.scores.coronario}%</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#15121e] border border-[#2e2844] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                  <span className="text-[9px] text-[#cac4d4]">Esplênico: {session.scores.esplenico}%</span>
                </div>
              </div>

              {/* Bottom footer button */}
              <div className="flex items-center justify-between pt-1 border-t border-[#2e2844]/40 relative z-10">
                <span className="text-xs text-[#948e9d] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#a78bfa]">spa</span>
                  Ver Relatório de Atendimento
                </span>
                <span className="w-7 h-7 rounded-full bg-[#2c2835] flex items-center justify-center text-[#e7dff1] group-hover:bg-[#a78bfa] group-hover:text-[#3c1989] transition-colors">
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Zen Status Bar */}
      <footer className="flex items-center justify-center gap-2 py-3 text-center">
        <span className="material-symbols-outlined text-[14px] text-[#a78bfa]/70">grain</span>
        <span className="text-[11px] text-[#948e9d] italic">
          Todos os fluxos em harmonia bioenergética • Frequência Schumann calibrada a 7.83Hz
        </span>
        <span className="material-symbols-outlined text-[14px] text-[#a78bfa]/70">grain</span>
      </footer>
    </div>
  );
};
