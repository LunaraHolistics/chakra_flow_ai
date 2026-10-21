import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AppTab, SessionModel } from '../types';

interface HistoryViewProps {
  onNavigate: (tab: AppTab) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onNavigate }) => {
  const { sessions, clients, setSelectedSession, setSelectedClient } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attention' | 'balanced'>('all');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      s.clientName.toLowerCase().includes(q) ||
      s.clinicalNotes.toLowerCase().includes(q) ||
      s.sessionDate.includes(q);

    const matchesClient = selectedClientId === 'all' || s.clientId === selectedClientId;

    let matchesStatus = true;
    if (statusFilter === 'attention') {
      matchesStatus = s.overallScore < 65 || s.attentionCount > 0;
    } else if (statusFilter === 'balanced') {
      matchesStatus = s.overallScore >= 65 && s.attentionCount === 0;
    }

    return matchesSearch && matchesClient && matchesStatus;
  });

  const handleOpenReport = (session: SessionModel) => {
    setSelectedSession(session);
    const client = clients.find((c) => c.id === session.clientId);
    if (client) setSelectedClient(client);
    onNavigate('relatorio-sessao');
  };

  const handlePrintPDF = (e: React.MouseEvent, session: SessionModel) => {
    e.stopPropagation();
    setSelectedSession(session);
    const client = clients.find((c) => c.id === session.clientId);
    if (client) setSelectedClient(client);
    onNavigate('relatorio-sessao');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Top Banner */}
      <section className="flex flex-col space-y-1 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cebdff] shadow-[0_0_8px_rgba(206,189,255,0.7)]" />
            <span className="text-[10px] text-[#cebdff] font-bold tracking-widest uppercase">
              Prontuário Biométrico
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#2c2835] text-[#cac4d4] border border-[#494552]">
            Sincronizado
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <h1 className="font-playfair text-2xl font-semibold text-[#e7dff1]">
            Histórico de Atendimentos
          </h1>
          <span className="text-xs text-[#a78bfa] font-medium">
            {sessions.length} registros
          </span>
        </div>
        <p className="text-xs text-[#948e9d]">
          Sessões registradas no prontuário com histórico evolutivo dos centros energéticos.
        </p>
      </section>

      {/* Search Input */}
      <div className="relative w-full">
        <div className="flex items-center w-full bg-[#1d1a26] border border-[#2e2844] rounded-xl px-3.5 py-2.5 focus-within:border-[#a78bfa] transition-all">
          <span className="material-symbols-outlined text-[#948e9d] text-[20px] mr-2.5">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar anotações, protocolos, intercorrências..."
            className="w-full bg-transparent text-[#e7dff1] placeholder:text-[#655f78] text-xs focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#948e9d] hover:text-[#e7dff1] text-[16px] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Box */}
      <section className="flex flex-col space-y-2.5 bg-[#1d1a26] border border-[#2e2844] p-3.5 sm:p-4 rounded-2xl shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {/* Client Selector Dropdown */}
          <div className="relative">
            <label className="block text-[10px] text-[#948e9d] uppercase font-bold mb-1">
              Interagente
            </label>
            <button
              type="button"
              onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
              className="w-full flex items-center justify-between bg-[#2c2835] border border-[#494552] px-3 py-2 rounded-xl text-left text-[#e7dff1] text-xs cursor-pointer"
            >
              <span className="truncate">
                {selectedClientId === 'all'
                  ? 'Todos os Interagentes'
                  : clients.find((c) => c.id === selectedClientId)?.name || 'Selecionar'}
              </span>
              <span className="material-symbols-outlined text-[#948e9d] text-[16px]">
                expand_more
              </span>
            </button>

            {isClientDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#211e2a] border border-[#2e2844] rounded-xl p-1.5 shadow-xl max-h-48 overflow-y-auto space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClientId('all');
                    setIsClientDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#e7dff1] hover:bg-[#363340] cursor-pointer"
                >
                  Todos os Interagentes
                </button>
                {clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedClientId(c.id);
                      setIsClientDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#e7dff1] hover:bg-[#363340] cursor-pointer truncate"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Period Indicator */}
          <div className="relative">
            <label className="block text-[10px] text-[#948e9d] uppercase font-bold mb-1">
              Período Clínico
            </label>
            <div className="flex items-center justify-between bg-[#2c2835] border border-[#494552] px-2.5 py-1.5 rounded-xl text-[#e7dff1]">
              <span className="text-xs text-[#e7dff1] font-medium truncate px-1">
                {new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </span>
              <span className="text-[10px] text-[#a78bfa] font-bold uppercase">Ativo</span>
            </div>
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#a78bfa] text-[#3c1989]'
                : 'bg-[#2c2835] text-[#cac4d4] hover:text-[#e7dff1]'
            }`}
          >
            Todas ({sessions.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('attention')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm cursor-pointer whitespace-nowrap ${
              statusFilter === 'attention'
                ? 'bg-[#a78bfa] text-[#3c1989]'
                : 'bg-[#2c2835] text-[#cac4d4] hover:text-[#e7dff1]'
            }`}
          >
            Atenção Prioritária (&lt;65%)
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('balanced')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm cursor-pointer whitespace-nowrap ${
              statusFilter === 'balanced'
                ? 'bg-[#a78bfa] text-[#3c1989]'
                : 'bg-[#2c2835] text-[#cac4d4] hover:text-[#e7dff1]'
            }`}
          >
            Equilibradas (≥65%)
          </button>
        </div>
      </section>

      {/* Session Cards */}
      <section className="flex flex-col space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-[#1d1a26] border border-[#2e2844] rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-[#2c2835] flex items-center justify-center mb-2 text-[#948e9d]">
              <span className="material-symbols-outlined text-[24px]">search_off</span>
            </div>
            <h3 className="font-playfair text-base text-[#e7dff1]">Nenhum prontuário localizado</h3>
            <p className="text-xs text-[#cac4d4] max-w-xs mt-1">
              Não encontramos sessões correspondentes aos filtros aplicados.
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isBalanced = session.overallScore >= 65;

            return (
              <article
                key={session.id}
                onClick={() => handleOpenReport(session)}
                className="relative bg-[#1d1a26] border border-[#2e2844] rounded-2xl p-4 shadow-md transition-all hover:bg-[#211e2a] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl bg-[#2c2835] border border-[#494552] flex items-center justify-center shrink-0 shadow-inner font-playfair text-sm text-[#cebdff] font-semibold">
                      {session.clientName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#1d1a26] ${
                          isBalanced ? 'bg-[#4edea3]' : 'bg-[#f97316]'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-playfair text-base font-semibold text-[#e7dff1] truncate">
                          {session.clientName}
                        </h2>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#363340] text-[#a78bfa]">
                          Sessão #{session.sessionNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#cac4d4] text-xs mt-0.5">
                        <span className="material-symbols-outlined text-[13px] text-[#948e9d]">schedule</span>
                        <span>{session.sessionDate} • {session.durationMinutes} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`font-playfair text-2xl font-bold leading-none ${
                        isBalanced ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                      }`}
                    >
                      {session.overallScore}%
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                        isBalanced ? 'text-[#4edea3]' : 'text-[#f97316]'
                      }`}
                    >
                      {isBalanced ? 'Geral' : 'Crítico'}
                    </span>
                  </div>
                </div>

                {/* 8 Frequencies Spectral Bar */}
                <div className="bg-[#15121e] border border-[#2e2844] rounded-xl p-2.5 mb-2.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#cac4d4] flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isBalanced ? 'bg-[#4edea3]' : 'bg-[#f97316] animate-pulse'
                        }`}
                      />
                      {session.attentionCount > 0
                        ? `${session.attentionCount} chakras em atenção`
                        : 'Todos os 8 centros alinhados'}
                    </span>
                    <span className="text-[#948e9d] text-[9px] font-bold uppercase">
                      8 Frequências Análise
                    </span>
                  </div>
                  <div className="grid grid-cols-8 gap-1 py-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          session.scores.basico >= 65 ? 'bg-[#4edea3]' : 'bg-[#ef4444]'
                        }`}
                      />
                      <span className="text-[8px] text-[#948e9d] mt-0.5">BAS</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          session.scores.sacral >= 65 ? 'bg-[#4edea3]' : 'bg-[#f97316]'
                        }`}
                      />
                      <span className="text-[8px] text-[#948e9d] mt-0.5">SAC</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          session.scores.plexoSolar >= 65 ? 'bg-[#4edea3]' : 'bg-[#eab308]'
                        }`}
                      />
                      <span className="text-[8px] text-[#948e9d] mt-0.5">PLX</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          session.scores.cardiaco >= 65 ? 'bg-[#4edea3]' : 'bg-[#f97316]'
                        }`}
                      />
                      <span className="text-[8px] text-[#948e9d] mt-0.5">CAR</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          session.scores.laringeo >= 65 ? 'bg-[#4edea3]' : 'bg-[#06b6d4]'
                        }`}
                      />
                      <span className="text-[8px] text-[#948e9d] mt-0.5">LAR</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          session.scores.frontal >= 65 ? 'bg-[#4edea3]' : 'bg-[#6366f1]'
                        }`}
                      />
                      <span className="text-[8px] text-[#948e9d] mt-0.5">FRN</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          session.scores.coronario >= 65 ? 'bg-[#4edea3]' : 'bg-[#a855f7]'
                        }`}
                      />
                      <span className="text-[8px] text-[#948e9d] mt-0.5">COR</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          session.scores.esplenico >= 65 ? 'bg-[#4edea3]' : 'bg-[#f59e0b]'
                        }`}
                      />
                      <span className="text-[8px] text-[#948e9d] mt-0.5">ESP</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenReport(session)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#2c2835] hover:bg-[#363340] text-[#e7dff1] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#494552] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#a78bfa]">
                      visibility
                    </span>
                    <span>Ver Relatório</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Reimprimir PDF"
                    onClick={(e) => handlePrintPDF(e, session)}
                    className="w-10 h-10 rounded-xl bg-[#2c2835] hover:bg-[#363340] text-[#e7dff1] flex items-center justify-center border border-[#494552] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
};
