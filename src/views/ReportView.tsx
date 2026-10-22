import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AppTab } from '../types';
import { CHAKRAS_LIST, CHAKRAS_MAP } from '../data/chakras';
import { DEFAULT_REPORT_TEXTS } from '../data/reportTexts';
import { calculateScoreDelta, getChakrasNeedingAttention, isBalanced } from '../utils/calculations';

interface ReportViewProps {
  onNavigate: (tab: AppTab) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { selectedSession, selectedClient, sessions } = useData();

  // If no session is selected, use the latest one
  const session = selectedSession || sessions[0];
  const client = selectedClient;

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-sm text-[#cac4d4]">Nenhuma sessão selecionada para emissão de laudo.</p>
        <button
          type="button"
          onClick={() => onNavigate('historico')}
          className="mt-4 px-4 py-2 rounded-full bg-[#a78bfa] text-[#3c1989] text-xs font-bold uppercase tracking-wider"
        >
          Voltar para Histórico
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const needingAttentionKeys = getChakrasNeedingAttention(session.scores);
  const attentionChakras = needingAttentionKeys.map((k) => CHAKRAS_MAP[k]);

  // Previous session scores if available
  const prevScores = session.previousSessionScores;

  const marcaCompleta = profile?.marcaCompleta || profile?.brandName || 'Lunara Terapias';
  const marcaCurta = profile?.marcaCurta || 'LUNARA';
  const therapistName = profile?.name || 'Celso Luiz';
  const therapistTitle = profile?.tituloProfissional || profile?.title || 'Psicoterapeuta Holístico';
  const therapistPhone = profile?.phone || '+55(16)99793-4558';
  const therapistWebsite = profile?.website || 'lunara-terapias-site.netlify.app';
  const therapistLogo =
    profile?.logoUrl ||
    'https://lh3.googleusercontent.com/aida/AEtjO1WOsx4_sGUcyvNqO56n_4xIwpNKYvFYILJdKzh9S4yO5j-WdtTkDFm0DNMt5fQ7xzTadSn2eXgEoH7SILbNjS4gzKGjBEkeTKwDuNjv0hbF-yN6LLPftNU75xOmqGmjnT-INwlZMIzMcS3mN_fh2dvD04LhH-TH21kcvv58ispOOb4MK7nFF71joNwTdleERuRDAr1NcqfD1j6K_QvvrFEhCe08zhEONkZl7hVCsoJiZAKilT3Ms5qsmtE';
  const openingText = profile?.openingStatement || DEFAULT_REPORT_TEXTS.openingStatement;
  const analiseIntegradaText = profile?.analiseIntegrada || DEFAULT_REPORT_TEXTS.integratedAnalysis;
  const importanciaEquilibrioText = profile?.importanciaEquilibrio || DEFAULT_REPORT_TEXTS.importanceOfBalance;
  const generalGuidanceText = profile?.generalGuidance || DEFAULT_REPORT_TEXTS.generalGuidance;
  const signatureText = profile?.signatureText || `${therapistName} — ${therapistTitle}`;

  return (
    <div className="flex flex-col w-full pb-12 space-y-5">
      {/* Top Document Toolbar (Hidden during print) */}
      <div className="flex items-center justify-between px-1 pt-1 no-print">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.6)]" />
          <span className="text-[10px] text-[#cac4d4] uppercase tracking-widest font-bold">
            Relatório de Atendimento Oficial
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            aria-label="Baixar Relatório em PDF"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#a78bfa] text-[#3c1989] font-bold text-xs hover:brightness-105 active:scale-95 transition-all shadow-[0_0_16px_rgba(167,139,250,0.35)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Gerar PDF / Imprimir</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Relatório de Análise Energética - ${session.clientName}`,
                  text: `Relatório de Análise Energética — Diagnóstico dos Chakras para ${session.clientName}`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href);
                alert('Link do laudo copiado para compartilhamento!');
              }
            }}
            aria-label="Compartilhar"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2c2835] border border-[#494552] text-[#e7dff1] hover:bg-[#363340] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
          </button>
        </div>
      </div>

      {/* A4 Clinical Document Container - Dark for screen, White for print */}
      <div
        id="printable-report"
        className="relative w-full rounded-2xl bg-[#0f0c18] print:bg-white border border-[#2e2844] print:border-gray-300 p-5 sm:p-8 print:p-0 shadow-2xl overflow-hidden space-y-6 print:space-y-4"
      >
        {/* Ethereal Watermark Glows - Hidden in print */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#a78bfa]/5 blur-3xl print:hidden" />
        <div className="pointer-events-none absolute bottom-12 -left-20 w-64 h-64 rounded-full bg-[#4edea3]/5 blur-3xl print:hidden" />

        {/* 1. Document Header com Branding (Logo à esquerda + marcaCompleta à direita) */}
        <div className="relative flex flex-col space-y-3 pb-5 border-b border-[#2e2844]/60 print:border-gray-300 print-page-break-avoid">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {therapistLogo && (
                <div className="w-14 h-14 rounded-xl bg-[#211e2a] print:bg-white border border-[#2e2844] print:border-gray-300 flex items-center justify-center p-2 shadow-inner shrink-0">
                  <img
                    alt={marcaCompleta}
                    className="w-full h-full object-contain"
                    src={therapistLogo}
                  />
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="font-playfair text-xl sm:text-2xl font-bold text-[#e7dff1] print:text-gray-900 tracking-tight block">
                {marcaCompleta}
              </span>
              <span className="text-[11px] text-[#cebdff] print:text-gray-600 font-bold uppercase tracking-widest block">
                {marcaCurta}
              </span>
            </div>
          </div>

          {/* Título Oficial Solicitado */}
          <div className="pt-1">
            <h2 className="font-playfair text-lg sm:text-xl font-bold text-[#e7dff1] print:text-gray-900 tracking-tight">
              Relatório de Análise Energética — Diagnóstico dos Chakras
            </h2>
            <p className="text-xs text-[#948e9d] print:text-gray-600 mt-0.5">
              Prontuário #{session.id.slice(-6)} • Mapeamento Vibracional dos 8 Centros
            </p>
          </div>

          {/* 2. Resumo Energético / Termo de Abertura */}
          <div className="bg-[#1a1626] print:bg-gray-50 border border-[#2e2844]/70 print:border-gray-300 rounded-xl p-3.5 mt-2">
            <p className="text-xs text-[#cac4d4] print:text-gray-800 leading-relaxed italic">
              "{openingText}"
            </p>
          </div>
        </div>

        {/* 3. Informações do Cliente e Sessão */}
        <div className="rounded-xl bg-[#1d1a26] print:bg-white border border-[#2e2844] print:border-gray-300 p-4 space-y-3 print-page-break-avoid">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-[#948e9d] print:text-gray-600 uppercase font-bold block">
                CLIENTE
              </span>
              <p className="font-playfair text-base sm:text-lg text-[#e7dff1] print:text-gray-900 font-semibold mt-0.5">
                {session.clientName}
              </p>
              <span className="text-xs text-[#cac4d4] print:text-gray-700">
                {client?.age || 'Adulto'} • {client?.protocol || 'Protocolo Bioenergético'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#948e9d] print:text-gray-600 uppercase font-bold block">
                DATA &amp; PROTOCOLO
              </span>
              <p className="text-xs text-[#e7dff1] print:text-gray-900 font-semibold mt-0.5">
                {session.sessionDate}
              </p>
              <span className="text-xs text-[#a78bfa] print:text-gray-700">
                Sessão Regular nº {String(session.sessionNumber).padStart(2, '0')} • {session.durationMinutes} min
              </span>
            </div>
          </div>

          {/* Overall Score Badge Banner */}
          <div className="rounded-xl bg-[#211e2a] print:bg-gray-50 border border-[#2e2844] print:border-gray-300 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#15121e] print:bg-white border border-[#363340] print:border-gray-300 shrink-0">
                <span className="font-playfair text-xl font-bold text-[#4edea3] print:text-green-700">
                  {session.overallScore}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#948e9d] print:text-gray-600 uppercase font-bold">
                    ÍNDICE GLOBAL DE EQUILÍBRIO
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      session.overallScore >= 65
                        ? 'bg-[#00b37c]/20 print:bg-green-100 text-[#4edea3] print:text-green-800'
                        : 'bg-[#f97316]/20 print:bg-orange-100 text-[#ffb4ab] print:text-orange-800'
                    }`}
                  >
                    {session.overallScore >= 65 ? 'Equilibrado' : 'Requer Atenção'}
                  </span>
                </div>
                <p className="text-xs text-[#e7dff1] print:text-gray-800 font-medium mt-0.5">
                  {session.overallScore >= 65
                    ? 'Homeostase Dinâmica Restaurada no Bio-Campo'
                    : 'Ajuste prioritário recomendado para sustentação vibracional'}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#4edea3] print:text-green-600 text-[22px]">verified</span>
          </div>

          {/* Attention Callout */}
          {attentionChakras.length > 0 && (
            <div className="rounded-xl bg-[#f97316]/10 print:bg-orange-50 border border-[#f97316]/30 print:border-orange-300 p-3 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#f97316] print:text-orange-600 text-[18px] shrink-0 mt-0.5">
                crisis_alert
              </span>
              <div>
                <p className="text-xs font-bold text-[#f97316] print:text-orange-800 tracking-wide uppercase">
                  Análise de Prioridade ({attentionChakras.length} de 8 centros necessitam atenção)
                </p>
                <p className="text-xs text-[#cac4d4] print:text-gray-800 mt-0.5">
                  {attentionChakras.map((c) => c.name).join(', ')} apresentaram índice inferior a 65% e demandam recalibração sutil para sustentar o fluxo ascendente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. Visualização Energética (Barras Coloridas + Linha de Referência 65%) */}
        <div className="space-y-3 print-page-break-avoid">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-playfair text-base font-semibold text-[#e7dff1] print:text-gray-900">
                Curva de Calibração dos 8 Centros
              </h3>
              <p className="text-xs text-[#cac4d4] print:text-gray-600">
                Barras individuais com linha de corte em 65% (Equilíbrio Homeostático)
              </p>
            </div>
            {prevScores && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1.5 rounded-full bg-[#494552] print:bg-gray-400" />
                  <span className="text-[10px] text-[#948e9d] print:text-gray-600">Anterior</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1.5 rounded-full bg-[#a78bfa] print:bg-purple-600" />
                  <span className="text-[10px] text-[#cebdff] print:text-gray-800 font-bold">Atual</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-2xl bg-[#1d1a26] print:bg-white border border-[#2e2844] print:border-gray-300 p-4 sm:p-5 relative">
            {/* 65% Reference Indicator Line */}
            <div
              className="hidden sm:block absolute top-3 bottom-3 border-r border-dashed border-[#a78bfa]/30 print:border-purple-400 z-0 pointer-events-none"
              style={{ left: '65%' }}
            >
              <span className="absolute -top-3.5 -right-3 text-[9px] text-[#a78bfa] print:text-purple-700 font-mono font-bold">
                65%
              </span>
            </div>

            {CHAKRAS_LIST.map((chakra) => {
              const score = session.scores[chakra.key];
              const prev = prevScores ? prevScores[chakra.key] : undefined;
              const deltaInfo = calculateScoreDelta(score, prev);
              const balanced = isBalanced(score);

              return (
                <div key={chakra.key} className="space-y-1 relative z-10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-xs text-[#e7dff1] print:text-gray-900 flex items-center gap-1.5 font-medium">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: chakra.color }}
                      />
                      {chakra.name}{' '}
                      <span className="text-[#948e9d] print:text-gray-600 italic">
                        ({chakra.sanskritName !== 'Não possui' ? chakra.sanskritName : 'Prana'})
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-[#e7dff1] print:text-gray-900">
                      {score}%{' '}
                      {prev !== undefined && (
                        <span
                          className={`text-[10px] font-bold ml-1 ${
                            deltaInfo.delta >= 0 ? 'text-[#4edea3] print:text-green-700' : 'text-[#ffb4ab] print:text-red-700'
                          }`}
                        >
                          ({deltaInfo.formatted})
                        </span>
                      )}
                      {!balanced && (
                        <span className="text-[9px] font-bold text-[#f97316] print:text-orange-700 bg-[#f97316]/15 print:bg-orange-100 px-1.5 py-0.5 rounded ml-1.5">
                          ATENÇÃO
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Previous session gauge track if exists */}
                  {prev !== undefined && (
                    <div className="w-full h-1 bg-[#2c2835] print:bg-gray-200 rounded-full overflow-hidden opacity-50">
                      <div
                        className="h-full bg-[#494552] print:bg-gray-400 rounded-full"
                        style={{ width: `${prev}%` }}
                      />
                    </div>
                  )}

                  {/* Current session gauge track */}
                  <div className="w-full h-2 bg-[#2c2835] print:bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${score}%`,
                        backgroundColor: chakra.color,
                        boxShadow: `0 0 8px ${chakra.color}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Fichas dos Chakras em Desequilíbrio (<65%) - Somente os que necessitam atenção */}
        <div className="space-y-4 print-page-break-avoid">
          <div className="flex items-center justify-between">
            <h3 className="font-playfair text-base font-semibold text-[#e7dff1] print:text-gray-900">
              Intervenções Necessárias (Chakras &lt; 65%)
            </h3>
            <span className="text-[10px] text-[#f97316] print:text-orange-700 font-bold uppercase tracking-wider">
              {attentionChakras.length} Vórtice(s) Crítico(s)
            </span>
          </div>

          {attentionChakras.length === 0 ? (
            <div className="rounded-2xl bg-[#1d1a26] print:bg-white border border-[#2e2844] print:border-gray-300 p-5 text-center">
              <span className="material-symbols-outlined text-[#4edea3] print:text-green-600 text-[28px] mb-1">
                check_circle
              </span>
              <p className="text-xs text-[#e7dff1] print:text-gray-900 font-semibold">
                Harmonia Plena Atingida
              </p>
              <p className="text-xs text-[#cac4d4] print:text-gray-600 mt-0.5">
                Nenhum centro bioenergético apresentou índice inferior a 65% nesta avaliação.
              </p>
            </div>
          ) : (
            attentionChakras.map((chakra) => {
              const score = session.scores[chakra.key];
              // Classe especial para o amarelo (Plexo Solar) com contraste adequado
              const isYellowChakra = chakra.name.toLowerCase().includes('plexo');
              
              return (
                <div
                  key={chakra.key}
                  className={`rounded-2xl border p-5 space-y-4 shadow-md relative overflow-hidden print-page-break-avoid ${
                    isYellowChakra 
                      ? 'bg-[#fef9c3] print:bg-yellow-50 border-[#eab308] print:border-yellow-300' 
                      : 'bg-[#1d1a26] print:bg-white border-[#2e2844] print:border-gray-300'
                  }`}
                >
                  <div className={`flex items-center justify-between border-b pb-3 ${isYellowChakra ? 'border-[#eab308]/60 print:border-yellow-300' : 'border-[#2e2844]/60 print:border-gray-300'}`}>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{
                          backgroundColor: chakra.color,
                          boxShadow: `0 0 10px ${chakra.color}`,
                        }}
                      />
                      <div>
                        <h4 className={`font-playfair text-base font-semibold ${isYellowChakra ? 'text-[#854d0e] print:text-yellow-900' : 'text-[#e7dff1] print:text-gray-900'}`}>
                          {chakra.order}. {chakra.name}{' '}
                          {chakra.sanskritName !== 'Não possui' && `(${chakra.sanskritName})`}
                        </h4>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${isYellowChakra ? 'text-[#a16207] print:text-yellow-800' : 'text-[#948e9d] print:text-gray-600'}`}>
                          Elemento: {chakra.element} • Mantra: {chakra.mantra}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`font-playfair text-2xl font-bold ${isYellowChakra ? 'text-[#854d0e]' : ''}`}
                      style={{ color: isYellowChakra ? undefined : chakra.color }}
                    >
                      {score}%
                    </span>
                  </div>

                  {/* 11 Fields Detailed Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className={`border rounded-xl p-3 space-y-1 ${isYellowChakra ? 'bg-[#fef3c7] print:bg-yellow-100 border-[#eab308] print:border-yellow-300' : 'bg-[#15121e] print:bg-gray-50 border-[#2e2844] print:border-gray-300'}`}>
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${isYellowChakra ? 'text-[#a16207] print:text-yellow-800' : 'text-[#a78bfa] print:text-purple-700'}`}>
                        Significado &amp; Papel Sutil
                      </span>
                      <p className={`${isYellowChakra ? 'text-[#854d0e] print:text-yellow-900' : 'text-[#e7dff1] print:text-gray-900'} font-medium leading-relaxed`}>{chakra.meaning}</p>
                      <p className={`${isYellowChakra ? 'text-[#a16207] print:text-yellow-800' : 'text-[#cac4d4] print:text-gray-700'} leading-relaxed mt-1`}>{chakra.role}</p>
                    </div>

                    <div className={`border rounded-xl p-3 space-y-1 ${isYellowChakra ? 'bg-[#fef3c7] print:bg-yellow-100 border-[#eab308] print:border-yellow-300' : 'bg-[#15121e] print:bg-gray-50 border-[#2e2844] print:border-gray-300'}`}>
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${isYellowChakra ? 'text-[#dc2626] print:text-red-800' : 'text-[#f97316] print:text-orange-700'}`}>
                        Influência Anatômica &amp; Sinais de Alerta
                      </span>
                      <p className={`${isYellowChakra ? 'text-[#854d0e] print:text-yellow-900' : 'text-[#cac4d4] print:text-gray-700'} leading-relaxed`}>{chakra.influence}</p>
                      <p className={`${isYellowChakra ? 'text-[#dc2626] print:text-red-800' : 'text-[#ffb4ab] print:text-red-700'} leading-relaxed mt-1`}>{chakra.signsOfImbalance}</p>
                    </div>

                    <div className={`border rounded-xl p-3 space-y-1 ${isYellowChakra ? 'bg-[#fef3c7] print:bg-yellow-100 border-[#eab308] print:border-yellow-300' : 'bg-[#15121e] print:bg-gray-50 border-[#2e2844] print:border-gray-300'}`}>
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${isYellowChakra ? 'text-[#059669] print:text-green-800' : 'text-[#4edea3] print:text-green-700'}`}>
                        Cristais Ressonantes
                      </span>
                      <p className={`${isYellowChakra ? 'text-[#854d0e] print:text-yellow-900' : 'text-[#e7dff1] print:text-gray-900'} font-medium`}>{chakra.crystals}</p>
                    </div>

                    <div className={`border rounded-xl p-3 space-y-1 ${isYellowChakra ? 'bg-[#fef3c7] print:bg-yellow-100 border-[#eab308] print:border-yellow-300' : 'bg-[#15121e] print:bg-gray-50 border-[#2e2844] print:border-gray-300'}`}>
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${isYellowChakra ? 'text-[#7c3aed] print:text-purple-800' : 'text-[#cebdff] print:text-purple-700'}`}>
                        Afirmação de Harmonização
                      </span>
                      <p className={`${isYellowChakra ? 'text-[#854d0e] print:text-yellow-900' : 'text-[#e7dff1] print:text-gray-900'} italic`}>"{chakra.affirmation}"</p>
                    </div>

                    <div className={`sm:col-span-2 border rounded-xl p-3 space-y-1 ${isYellowChakra ? 'bg-[#fde68a] print:bg-yellow-200 border-[#eab308] print:border-yellow-400' : 'bg-[#211e2a] print:bg-gray-100 border-[#2e2844] print:border-gray-300'}`}>
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${isYellowChakra ? 'text-[#a16207] print:text-yellow-900' : 'text-[#a78bfa] print:text-purple-700'}`}>
                        Práticas Harmonizadoras Recomendadas
                      </span>
                      <p className={`${isYellowChakra ? 'text-[#854d0e] print:text-yellow-900' : 'text-[#e7dff1] print:text-gray-900'} leading-relaxed`}>{chakra.harmonizingPractices}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 7. Recomendações Personalizadas (5 Campos) */}
        <div className="space-y-3 print-page-break-avoid">
          <h3 className="font-playfair text-base font-semibold text-[#e7dff1] print:text-gray-900">
            Plano de Cuidados Integrados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Aromaterapia */}
            <div className="rounded-xl bg-[#1d1a26] print:bg-white border border-[#2e2844] print:border-gray-300 p-3.5 space-y-2 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-[#a78bfa] print:text-purple-700">
                <span className="material-symbols-outlined text-[18px]">local_florist</span>
                <span className="text-[10px] text-[#e7dff1] print:text-gray-900 font-bold uppercase tracking-wider">
                  Aromaterapia
                </span>
              </div>
              <p className="text-xs text-[#cac4d4] print:text-gray-800">
                {session.recommendations.aromatherapy}
              </p>
              <span className="text-[10px] text-[#948e9d] print:text-gray-600">Manhã &amp; Tarde</span>
            </div>

            {/* Solfeggio */}
            <div className="rounded-xl bg-[#1d1a26] print:bg-white border border-[#2e2844] print:border-gray-300 p-3.5 space-y-2 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-[#4edea3] print:text-green-700">
                <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
                <span className="text-[10px] text-[#e7dff1] print:text-gray-900 font-bold uppercase tracking-wider">
                  Solfeggio &amp; Sons
                </span>
              </div>
              <p className="text-xs text-[#cac4d4] print:text-gray-800">
                {session.recommendations.solfeggio}
              </p>
              <span className="text-[10px] text-[#948e9d] print:text-gray-600">20 min antes de dormir</span>
            </div>

            {/* Meditação */}
            <div className="rounded-xl bg-[#1d1a26] print:bg-white border border-[#2e2844] print:border-gray-300 p-3.5 space-y-2 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-[#cebdff] print:text-purple-700">
                <span className="material-symbols-outlined text-[18px]">self_improvement</span>
                <span className="text-[10px] text-[#e7dff1] print:text-gray-900 font-bold uppercase tracking-wider">
                  Meditação &amp; Respiração
                </span>
              </div>
              <p className="text-xs text-[#cac4d4] print:text-gray-800">
                {session.recommendations.meditation}
              </p>
              <span className="text-[10px] text-[#948e9d] print:text-gray-600">Diário • 12 min</span>
            </div>

            {/* Próximo Retorno */}
            <div className="rounded-xl bg-[#1d1a26] print:bg-white border border-[#2e2844] print:border-gray-300 p-3.5 space-y-2 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-[#a78bfa] print:text-purple-700">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                <span className="text-[10px] text-[#e7dff1] print:text-gray-900 font-bold uppercase tracking-wider">
                  Próximo Retorno
                </span>
              </div>
              <p className="text-xs text-[#e7dff1] print:text-gray-900 font-semibold">
                {session.recommendations.nextReturn}
              </p>
              <span className="text-[10px] text-[#a78bfa] print:text-purple-700 font-bold">Ciclo Recomendado</span>
            </div>
          </div>
        </div>

        {/* 8. Análise Energética Integrada */}
        <div className="rounded-2xl bg-[#1d1a26] print:bg-white border border-[#2e2844] print:border-gray-300 p-4 sm:p-5 space-y-2 print-page-break-avoid">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#cebdff] print:text-purple-800">
            Análise Energética Integrada
          </h4>
          <p className="text-xs text-[#cac4d4] print:text-gray-800 leading-relaxed">
            {analiseIntegradaText}
          </p>
        </div>

        {/* 9. Importância do Equilíbrio & 10. Orientações Gerais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print-page-break-avoid">
          <div className="rounded-2xl bg-[#1d1a26] print:bg-white border border-[#2e2844] print:border-gray-300 p-4 space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4edea3] print:text-green-700">
              Importância do Equilíbrio
            </h4>
            <p className="text-xs text-[#cac4d4] print:text-gray-800 leading-relaxed">
              {importanciaEquilibrioText}
            </p>
          </div>
          <div className="rounded-2xl bg-[#1d1a26] print:bg-white border border-[#2e2844] print:border-gray-300 p-4 space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#a78bfa] print:text-purple-700">
              Orientações Gerais Padrão
            </h4>
            <p className="text-xs text-[#cac4d4] print:text-gray-800 leading-relaxed">
              {generalGuidanceText}
            </p>
          </div>
        </div>

        {/* Observações da Sessão */}
        {session.clinicalNotes && (
          <div className="rounded-2xl bg-[#1d1a26] print:bg-white border border-[#2e2844] print:border-gray-300 p-4 space-y-1 print-page-break-avoid">
            <h4 className="text-[10px] uppercase font-bold text-[#948e9d] print:text-gray-600 tracking-wider">
              Anotações do Atendimento
            </h4>
            <p className="text-xs text-[#e7dff1] print:text-gray-900 leading-relaxed">
              {session.clinicalNotes}
            </p>
          </div>
        )}

        {/* 11. Rodapé com Branding (4 linhas na ordem exata solicitada) */}
        <div className="pt-5 border-t border-[#2e2844]/60 print:border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-4 print-page-break-avoid">
          <div className="space-y-1 text-center sm:text-left">
            {/* Linha 1: marcaCurta (alinhada esquerda, em destaque) */}
            <p className="text-sm font-bold tracking-widest text-[#cebdff] print:text-gray-900 uppercase">
              {marcaCurta}
            </p>
            {/* Linha 2: marcaCompleta */}
            <p className="font-playfair text-base text-[#e7dff1] print:text-gray-900 font-semibold">
              {marcaCompleta}
            </p>
            {/* Linha 3: nome + " — " + tituloProfissional */}
            <p className="text-xs text-[#cac4d4] print:text-gray-700">
              {therapistName} — {therapistTitle}
            </p>
            {/* Linha 4: telefone + " | " + site */}
            <p className="text-xs text-[#948e9d] print:text-gray-600">
              {therapistPhone} | {therapistWebsite}
            </p>
          </div>

          {/* Logomarca à direita no rodapé */}
          {therapistLogo && (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-[#211e2a] print:bg-white border border-[#2e2844] print:border-gray-300 flex items-center justify-center p-2 shrink-0">
                <img
                  alt={marcaCompleta}
                  className="w-full h-full object-contain"
                  src={therapistLogo}
                />
              </div>
            </div>
          )}
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-2 text-center print-page-break-avoid">
          <p className="text-[9px] text-[#655f78] print:text-gray-500 italic max-w-lg mx-auto">
            {DEFAULT_REPORT_TEXTS.disclaimer}
          </p>
        </div>
      </div>

      {/* Primary Action Button (Hidden on Print) */}
      <div className="pt-2 no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full min-h-[52px] rounded-full bg-gradient-to-r from-[#a78bfa] via-[#cebdff] to-[#a78bfa] text-[#3c1989] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_24px_rgba(167,139,250,0.35)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">print</span>
          <span>Gerar PDF Oficial (A4 Retrato)</span>
        </button>
      </div>
    </div>
  );
};