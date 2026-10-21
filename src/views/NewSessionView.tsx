import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AppTab, ChakraScores, ClientModel } from '../types';
import { CHAKRAS_LIST } from '../data/chakras';
import { calculateOverallScore, countAttentionNeeded, isBalanced } from '../utils/calculations';

interface NewSessionViewProps {
  onNavigate: (tab: AppTab) => void;
}

export const NewSessionView: React.FC<NewSessionViewProps> = ({ onNavigate }) => {
  const { clients, selectedClient, setSelectedClient, addSession, setSelectedSession } = useData();

  // Active client for the session
  const [activeClient, setActiveClient] = useState<ClientModel>(
    selectedClient || clients[0] || {
      id: 'temp-client',
      userId: 'demo-therapist',
      name: 'Mariana Alencar',
      phone: '(11) 98765-4321',
      email: 'mariana.alencar@email.com',
      age: '34 anos',
      protocol: 'Harmonização de Ansiedade & Alinhamento de Chakras Sutis',
      notes: '',
      status: 'active',
      sessionCount: 5,
      averageScore: 74,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [sessionType, setSessionType] = useState<'presential' | 'remote'>('presential');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 8 Scores State
  const [scores, setScores] = useState<ChakraScores>({
    basico: 82,
    sacral: 74,
    plexoSolar: 58,
    cardiaco: 86,
    laringeo: 52,
    frontal: 78,
    coronario: 85,
    esplenico: 80,
  });

  const overallScore = calculateOverallScore(scores);
  const attentionCount = countAttentionNeeded(scores);

  const handleSliderChange = (key: keyof ChakraScores, val: number) => {
    setScores((prev: ChakraScores) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSaveAndGenerateReport = async () => {
    setIsSaving(true);
    try {
      const nextSessionNumber = (activeClient.sessionCount || 0) + 1;
      const createdSession = await addSession({
        clientId: activeClient.id,
        clientName: activeClient.name,
        sessionNumber: nextSessionNumber,
        sessionDate,
        durationMinutes,
        sessionType,
        overallScore,
        attentionCount,
        scores,
        clinicalNotes:
          clinicalNotes ||
          'Harmonização bioenergética realizada com foco na recalibração dos vórtices sutis e estabilização do campo áurico.',
        recommendations: {
          aromatherapy: 'Eucalipto & Bergamota em difusor ultra-sônico, 2x ao dia.',
          solfeggio: 'Frequências 528Hz & 741Hz para desbloqueio dos centros em atenção.',
          meditation: 'Prática diafragmática de ancoragem com respiração suave.',
          nextReturn: 'Reavaliação em 14 dias.',
          lifestyle: 'Hidratação abundante com água solarizada nas próximas 48h.',
        },
      });

      setSelectedSession(createdSession);
      setSelectedClient(activeClient);
      onNavigate('relatorio-sessao');
    } catch (err) {
      console.error('Error saving session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Sub-header context & dismiss */}
      <div className="flex items-center justify-between py-2 mb-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#a78bfa] uppercase tracking-widest font-bold">
            Protocolo de Atendimento
          </span>
          <h2 className="font-playfair text-xl font-semibold text-[#e7dff1]">
            Nova Sessão Energética
          </h2>
        </div>
        <button
          type="button"
          aria-label="Cancelar registro"
          onClick={() => onNavigate('inicio')}
          className="w-9 h-9 rounded-full bg-[#2c2835] border border-[#494552] flex items-center justify-center text-[#cac4d4] hover:text-[#e7dff1] active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Client & Session Meta Bento */}
      <div className="grid grid-cols-1 gap-2.5 mb-4">
        {/* Client Quick-Selector */}
        <div className="bg-[#1a1626] border border-[#2e2844] rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-[#4a3d7c] text-[#e7deff] border border-[#494552] flex items-center justify-center font-playfair text-base font-semibold shadow-inner">
                {activeClient.initials || activeClient.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#4edea3] ring-2 ring-[#1a1626]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-[#948e9d] uppercase tracking-wider font-bold">
                Interagente
              </span>
              <span className="text-sm text-[#e7dff1] font-semibold truncate font-playfair">
                {activeClient.name}
              </span>
              <span className="text-xs text-[#a78bfa] truncate">
                Prontuário #{activeClient.id.slice(-4)} • {activeClient.sessionCount + 1}ª Sessão
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsClientModalOpen(true)}
            className="flex items-center gap-1 bg-[#2c2835] hover:bg-[#363340] text-[#e7dff1] px-3 py-2 rounded-full text-xs font-semibold border border-[#494552] transition-colors shrink-0 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span>Trocar / Novo</span>
          </button>
        </div>

        {/* Date & Duration Selector */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#1a1626] border border-[#2e2844] rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] text-[#948e9d] uppercase font-bold flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[14px] text-[#a78bfa]">calendar_today</span>
              Data da Sessão
            </span>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="bg-transparent text-xs text-[#e7dff1] font-medium focus:outline-none cursor-pointer"
            />
          </div>

          <div className="bg-[#1a1626] border border-[#2e2844] rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] text-[#948e9d] uppercase font-bold flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[14px] text-[#4edea3]">timer</span>
              Duração
            </span>
            <div className="flex items-center justify-between">
              <span className="font-playfair text-xl text-[#e7dff1] font-semibold leading-none">
                {durationMinutes}
              </span>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="bg-[#2c2835] text-xs text-[#cac4d4] rounded-lg px-2 py-1 border border-[#494552] focus:outline-none"
              >
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={50}>50 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Calibration Header */}
      <div className="flex items-end justify-between mt-1 mb-3 px-1">
        <div>
          <span className="text-[10px] text-[#a78bfa] tracking-widest uppercase font-bold">
            Mapeamento Biocêntrico
          </span>
          <h3 className="font-playfair text-lg font-semibold text-[#e7dff1]">
            Alinhamento dos 8 Centros
          </h3>
        </div>
        <div className="flex items-center gap-1.5 bg-[#211e2a] border border-[#2e2844] px-3 py-1 rounded-full shadow-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              overallScore >= 65 ? 'bg-[#4edea3] animate-pulse' : 'bg-[#f97316] animate-pulse'
            }`}
          />
          <span className="text-xs font-bold text-[#e7dff1]">
            Média {overallScore}%
          </span>
        </div>
      </div>

      {/* Sliders Stack for 8 Chakras */}
      <div className="flex flex-col gap-2.5 mb-6">
        {CHAKRAS_LIST.map((chakra) => {
          const score = scores[chakra.key];
          const balanced = isBalanced(score);

          return (
            <div
              key={chakra.key}
              className="bg-[#1a1626] border border-[#2e2844] rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: chakra.color,
                      boxShadow: `0 0 10px ${chakra.color}`,
                    }}
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-[#e7dff1] leading-snug">
                      {chakra.name}
                    </h4>
                    <span className="text-[10px] text-[#948e9d] italic">
                      {chakra.sanskritName !== 'Não possui' ? chakra.sanskritName : 'Elemento Prana'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                      balanced
                        ? 'bg-[#00b37c]/20 text-[#4edea3]'
                        : 'bg-[#f97316]/20 text-[#ffb4ab]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        balanced ? 'bg-[#4edea3]' : 'bg-[#f97316] animate-pulse'
                      }`}
                    />
                    {balanced ? 'Equilibrado' : 'Precisa de atenção'}
                  </span>
                  <span className="font-playfair text-xl text-[#e7dff1] font-semibold leading-none min-w-[32px] text-right">
                    {score}
                  </span>
                </div>
              </div>

              {/* Slider Input with Dynamic Glow */}
              <div className="relative py-2 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => handleSliderChange(chakra.key, Number(e.target.value))}
                  className="w-full h-1.5 bg-[#2c2835] rounded-full appearance-none cursor-pointer"
                  style={{
                    accentColor: chakra.color,
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[#948e9d] text-[9px] opacity-70 px-0.5">
                <span>0 Hipofluxo</span>
                <span>50 Homeostase</span>
                <span>100 Pleno</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical Notes Section */}
      <div className="bg-[#1a1626] border border-[#2e2844] rounded-2xl p-4 shadow-sm mb-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase font-bold text-[#e7dff1] flex items-center gap-2 tracking-wider">
            <span className="material-symbols-outlined text-[16px] text-[#a78bfa]">edit_note</span>
            Observações Clínicas &amp; Intenção
          </label>
          <span className="text-[10px] text-[#948e9d]">Confidencial</span>
        </div>
        <textarea
          rows={4}
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
          placeholder="Descreva sensações na imposição de mãos, percepção com pêndulo/radiestesia, queixas do interagente e óleos essenciais utilizados..."
          className="w-full bg-[#15121e] border border-[#2e2844] text-[#e7dff1] placeholder:text-[#655f78] text-xs rounded-xl p-3 outline-none focus:border-[#a78bfa] transition-all resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setClinicalNotes(
                  (prev) =>
                    prev +
                    ' Percepção de ressonância sutil com calor nas mãos e desacoplamento de tensão torácica.'
                )
              }
              className="px-2.5 py-1 rounded-full bg-[#2c2835] text-[#cac4d4] hover:text-[#e7dff1] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-[#494552] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[12px] text-[#a78bfa]">spa</span>
              + Percepção Bio
            </button>
            <button
              type="button"
              onClick={() =>
                setClinicalNotes(
                  (prev) =>
                    prev +
                    ' Recomendado difusor com Lavanda Francesa e Hortelã Pimenta.'
                )
              }
              className="px-2.5 py-1 rounded-full bg-[#2c2835] text-[#cac4d4] hover:text-[#e7dff1] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-[#494552] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[12px] text-[#4edea3]">local_florist</span>
              + Óleos
            </button>
          </div>
          <span className="text-[#948e9d] text-[10px]">Autosalvo no dispositivo</span>
        </div>
      </div>

      {/* Primary Diagnostic Action CTA */}
      <div className="sticky bottom-4 z-20 pt-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveAndGenerateReport}
          className="w-full min-h-[54px] rounded-full bg-gradient-to-r from-[#a78bfa] via-[#cebdff] to-[#a78bfa] text-[#3c1989] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_12px_28px_-6px_rgba(167,139,250,0.5),0_0_16px_rgba(167,139,250,0.25)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          {isSaving ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">assessment</span>
              <span>Salvar e Gerar Relatório Clínico</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>

      {/* Client Picker Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f0c18]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1a1626] border border-[#2e2844] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair text-lg text-[#e7dff1] font-semibold">
                Selecionar Interagente
              </h3>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="text-[#cac4d4] hover:text-[#e7dff1] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {clients.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveClient(c);
                    setSelectedClient(c);
                    setIsClientModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    activeClient.id === c.id
                      ? 'bg-[#4a3d7c]/40 border-[#a78bfa]'
                      : 'bg-[#15121e] border-[#2e2844] hover:bg-[#211e2a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2c2835] text-[#cebdff] flex items-center justify-center font-playfair text-xs font-semibold">
                      {c.initials || c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#e7dff1]">{c.name}</p>
                      <p className="text-[10px] text-[#948e9d]">{c.protocol}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#a78bfa] font-bold">{c.averageScore}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
