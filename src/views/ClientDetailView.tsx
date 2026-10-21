import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AppTab, ClientModel } from '../types';
import { CHAKRAS_LIST } from '../data/chakras';

interface ClientDetailViewProps {
  onNavigate: (tab: AppTab) => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({ onNavigate }) => {
  const { selectedClient, getClientSessions, setSelectedSession, updateClient, deleteClient } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState(selectedClient?.name || '');
  const [editPhone, setEditPhone] = useState(selectedClient?.phone || '');
  const [editEmail, setEditEmail] = useState(selectedClient?.email || '');
  const [editAge, setEditAge] = useState(selectedClient?.age || '');
  const [editProtocol, setEditProtocol] = useState(selectedClient?.protocol || '');
  const [editNotes, setEditNotes] = useState(selectedClient?.notes || '');
  const [editStatus, setEditStatus] = useState<ClientModel['status']>(selectedClient?.status || 'active');

  if (!selectedClient) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-sm text-[#cac4d4]">Nenhum interagente selecionado.</p>
        <button
          type="button"
          onClick={() => onNavigate('clientes')}
          className="mt-4 px-4 py-2 rounded-full bg-[#a78bfa] text-[#3c1989] text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Voltar para Clientes
        </button>
      </div>
    );
  }

  const sessions = getClientSessions(selectedClient.id);
  const latestSession = sessions[0];
  const firstSession = sessions[sessions.length - 1];

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await updateClient(selectedClient.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        age: editAge ? `${editAge.trim()} anos` : '',
        protocol: editProtocol.trim(),
        notes: editNotes.trim(),
        status: editStatus,
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClientCascade = async () => {
    setIsSaving(true);
    try {
      await deleteClient(selectedClient.id);
      setShowDeleteConfirm(false);
      onNavigate('clientes');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasSessions = sessions.length > 0;

  return (
    <div className="flex flex-col w-full pb-8 space-y-5">
      {/* Sub-bar & Context Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.6)]" />
          <span className="text-[10px] text-[#948e9d] uppercase tracking-widest font-bold">
            Prontuário Ativo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditName(selectedClient.name);
              setEditPhone(selectedClient.phone);
              setEditEmail(selectedClient.email);
              setEditAge(selectedClient.age.replace(' anos', ''));
              setEditProtocol(selectedClient.protocol);
              setEditNotes(selectedClient.notes);
              setEditStatus(selectedClient.status);
              setIsEditing(!isEditing);
            }}
            className="px-3 py-1.5 rounded-full bg-[#2c2835] text-[#e7dff1] text-xs hover:bg-[#363340] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border border-[#494552]"
          >
            <span className="material-symbols-outlined text-[15px] text-[#a78bfa]">
              {isEditing ? 'close' : 'edit'}
            </span>
            <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('nova-sessao')}
            className="px-3.5 py-1.5 rounded-full bg-[#a78bfa] text-[#3c1989] font-bold text-xs shadow-[0_0_12px_rgba(167,139,250,0.35)] hover:opacity-95 transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Nova Sessão</span>
          </button>
        </div>
      </div>

      {/* In-Place Edit Panel */}
      {isEditing && (
        <div className="bg-[#211e2a] border border-[#a78bfa]/40 p-5 rounded-2xl space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#cebdff]">
              Editar Informações do Interagente
            </h4>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[11px] text-[#ffb4ab] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
              Excluir interagente
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-[#948e9d] uppercase font-bold block mb-1">
                Nome
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#948e9d] uppercase font-bold block mb-1">
                Idade
              </label>
              <input
                type="text"
                value={editAge}
                onChange={(e) => setEditAge(e.target.value)}
                placeholder="Ex: 34"
                className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#948e9d] uppercase font-bold block mb-1">
                WhatsApp / Telefone
              </label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#948e9d] uppercase font-bold block mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#948e9d] uppercase font-bold block mb-1">
              Protocolo de Atendimento
            </label>
            <input
              type="text"
              value={editProtocol}
              onChange={(e) => setEditProtocol(e.target.value)}
              className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-[#948e9d] uppercase font-bold block mb-1">
                Status Terapêutico
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ClientModel['status'])}
                className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
              >
                <option value="active">Em Acompanhamento Ativo</option>
                <option value="attention">Demanda Atenção Prioritária</option>
                <option value="discharged">Alta Terapêutica Concluída</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#948e9d] uppercase font-bold block mb-1">
                Observações
              </label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Observações do terapeuta..."
                className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveEdit}
            className="w-full py-2.5 rounded-full bg-[#a78bfa] hover:bg-[#cebdff] text-[#3c1989] font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      )}

      {/* Client Header Card (Quiet Luxury Aesthetic) */}
      <section className="relative overflow-hidden rounded-2xl bg-[#1d1a26] border border-[#2e2844] p-5 sm:p-6 shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#a78bfa]/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col space-y-4 relative z-10">
          <div className="flex items-start gap-4">
            {/* Monogram Luxury Avatar */}
            <div className="relative shrink-0 w-16 h-16 rounded-full bg-[#363340] border border-[#494552] flex items-center justify-center shadow-inner">
              <span className="font-playfair text-xl text-[#cebdff] tracking-wide font-semibold">
                {selectedClient.initials || selectedClient.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#1d1a26] flex items-center justify-center">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    selectedClient.status === 'discharged'
                      ? 'bg-[#4edea3]'
                      : selectedClient.averageScore >= 65 || !hasSessions
                      ? 'bg-[#4edea3]'
                      : 'bg-[#f97316]'
                  }`}
                />
              </span>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-playfair text-xl font-semibold text-[#e7dff1] truncate">
                  {selectedClient.name}
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#4a3d7c]/60 text-[#e7deff] border border-[#2e2844]">
                  {selectedClient.age || 'Interagente'}
                </span>
              </div>
              <p className="text-xs text-[#cac4d4] flex items-center gap-1.5 mt-0.5 truncate">
                <span className="material-symbols-outlined text-[14px] text-[#a78bfa]">call</span>
                {selectedClient.phone || 'Sem telefone'}
                <span className="opacity-40">•</span>
                <span className="truncate">{selectedClient.email || 'Sem e-mail'}</span>
              </p>
            </div>
          </div>

          {/* Protocol Banner */}
          <div className="rounded-xl bg-[#211e2a] border border-[#2e2844] p-3.5 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#a78bfa] text-[20px] mt-0.5 shrink-0">
              vital_signs
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#948e9d] uppercase font-bold tracking-wider">
                Protocolo de Harmonização
              </span>
              <p className="text-xs text-[#e7dff1] font-medium leading-snug">
                {selectedClient.protocol}
              </p>
              {selectedClient.notes && (
                <p className="text-[11px] text-[#cac4d4] mt-1 italic">
                  "{selectedClient.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-[#2c2835]/60 border border-[#2e2844] rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="font-playfair text-2xl text-[#cebdff] font-semibold">
                {selectedClient.sessionCount}
              </span>
              <span className="text-[9px] text-[#948e9d] uppercase tracking-wider font-bold mt-0.5">
                Atendimentos
              </span>
            </div>
            <div className="bg-[#2c2835]/60 border border-[#2e2844] rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="font-playfair text-base text-[#e7dff1] font-semibold truncate max-w-full">
                {firstSession ? firstSession.sessionDate : 'A iniciar'}
              </span>
              <span className="text-[9px] text-[#948e9d] uppercase tracking-wider font-bold mt-0.5">
                1º Atendimento
              </span>
            </div>
            <div className="bg-[#2c2835]/60 border border-[#2e2844] rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="font-playfair text-2xl text-[#4edea3] font-semibold">
                {hasSessions ? `${selectedClient.averageScore}%` : '—'}
              </span>
              <span className="text-[9px] text-[#948e9d] uppercase tracking-wider font-bold mt-0.5">
                Índice Médio
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Insight Bar */}
      <div className="rounded-2xl bg-[#211e2a] border border-[#2e2844] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#4a3d7c] flex items-center justify-center text-[#cebdff]">
            <span className="material-symbols-outlined text-[20px]">trending_up</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#e7dff1]">Evolução do Equilíbrio Energético</p>
            <p className="text-[11px] text-[#cac4d4]">
              {selectedClient.status === 'discharged'
                ? 'Ciclo de harmonização concluído com alta terapêutica.'
                : hasSessions && selectedClient.averageScore >= 65
                ? 'Coerência vibracional ativa e sustentada.'
                : hasSessions
                ? 'Demanda alinhamento direcionado nos centros prioritários.'
                : 'Aguardando registro da primeira leitura energética.'}
            </p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            selectedClient.status === 'discharged'
              ? 'bg-[#00b37c]/20 text-[#4edea3]'
              : hasSessions && selectedClient.averageScore >= 65
              ? 'bg-[#00b37c]/20 text-[#4edea3]'
              : hasSessions
              ? 'bg-[#f97316]/20 text-[#ffb4ab]'
              : 'bg-[#4a3d7c]/20 text-[#cebdff]'
          }`}
        >
          {selectedClient.status === 'discharged'
            ? 'ALTA'
            : hasSessions && selectedClient.averageScore >= 65
            ? 'ÓTIMO'
            : hasSessions
            ? 'ATENÇÃO'
            : 'NOVO'}
        </span>
      </div>

      {/* Visual Chakra Evolution Comparative */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-playfair text-base font-semibold text-[#e7dff1]">
              Evolução por Centro Energético
            </h3>
            <p className="text-xs text-[#cac4d4]">
              {firstSession && latestSession && firstSession.id !== latestSession.id
                ? `Sessão #${firstSession.sessionNumber} vs Sessão #${latestSession.sessionNumber} (Atual)`
                : hasSessions
                ? `Sessão #${latestSession.sessionNumber} (Mais recente)`
                : 'Mapeamento padrão dos 8 centros'}
            </p>
          </div>
          {hasSessions && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#494552]" />
                <span className="text-[10px] text-[#948e9d] uppercase font-bold">1ª</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a78bfa] shadow-[0_0_6px_rgba(167,139,250,0.7)]" />
                <span className="text-[10px] text-[#e7dff1] uppercase font-bold">Atual</span>
              </div>
            </div>
          )}
        </div>

        {/* Comparative Chakra List with Dual-Bar Gauges */}
        <div className="rounded-2xl bg-[#1d1a26] border border-[#2e2844] p-4 sm:p-5 space-y-3.5 shadow-lg">
          {CHAKRAS_LIST.map((chakra) => {
            const currentVal = latestSession ? latestSession.scores[chakra.key] : 70;
            const prevVal = firstSession ? firstSession.scores[chakra.key] : currentVal;
            const diff = currentVal - prevVal;
            const isDiffPositive = diff >= 0;

            return (
              <div key={chakra.key} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: chakra.color,
                        boxShadow: `0 0 8px ${chakra.color}66`,
                      }}
                    />
                    <span className="text-xs font-medium text-[#e7dff1]">
                      {chakra.order}. {chakra.sanskritName !== 'Não possui' ? `${chakra.sanskritName} (${chakra.name})` : chakra.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasSessions ? (
                      <>
                        <span className="text-xs text-[#cac4d4]">
                          {prevVal}% → <strong className="text-[#e7dff1] font-semibold">{currentVal}%</strong>
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isDiffPositive
                              ? 'bg-[#00b37c]/20 text-[#4edea3]'
                              : 'bg-[#f97316]/20 text-[#ffb4ab]'
                          }`}
                        >
                          {isDiffPositive ? `+${diff}%` : `${diff}%`}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-[#948e9d]">A calibrar</span>
                    )}
                  </div>
                </div>

                {/* Dual-bar Track */}
                <div className="relative w-full h-2 rounded-full bg-[#2c2835] overflow-hidden">
                  {hasSessions && firstSession?.id !== latestSession?.id && (
                    <div
                      className="absolute inset-y-0 left-0 bg-[#494552] rounded-full opacity-60"
                      style={{ width: `${prevVal}%` }}
                    />
                  )}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full opacity-90"
                    style={{
                      width: `${currentVal}%`,
                      backgroundColor: chakra.color,
                      boxShadow: `0 0 6px ${chakra.color}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vertical Session Timeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-playfair text-base font-semibold text-[#e7dff1]">
            Histórico de Atendimentos
          </h3>
          <span className="text-[10px] text-[#948e9d] uppercase font-bold tracking-wider">
            CRONOLOGIA
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#1d1a26] border border-[#2e2844] text-center">
            <p className="text-xs text-[#cac4d4]">
              Nenhum atendimento registrado ainda para este interagente.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-3">
            <div className="absolute top-3 bottom-3 left-2 w-0.5 bg-[#363340]" />

            {sessions.map((sess, idx) => (
              <div
                key={sess.id}
                onClick={() => {
                  setSelectedSession(sess);
                  onNavigate('relatorio-sessao');
                }}
                className="relative flex flex-col rounded-xl bg-[#1d1a26] border border-[#2e2844] p-4 shadow-md transition-all hover:bg-[#211e2a] cursor-pointer"
              >
                <span
                  className={`absolute -left-[22px] top-4 w-3.5 h-3.5 rounded-full ring-4 ring-[#15121e] ${
                    idx === 0
                      ? 'bg-[#a78bfa] shadow-[0_0_8px_rgba(167,139,250,0.8)]'
                      : 'bg-[#494552]'
                  }`}
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#a78bfa] font-bold uppercase tracking-wider">
                    {sess.sessionDate}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      sess.overallScore >= 65
                        ? 'bg-[#00b37c]/20 text-[#4edea3]'
                        : 'bg-[#f97316]/20 text-[#ffb4ab]'
                    }`}
                  >
                    {sess.overallScore}% GLOBAL
                  </span>
                </div>
                <p className="font-playfair text-sm text-[#e7dff1] font-medium">
                  Atendimento #{sess.sessionNumber} — Harmonização dos 8 Centros
                </p>
                <p className="text-xs text-[#cac4d4] mt-1 line-clamp-2">
                  {sess.clinicalNotes}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Primary Bottom Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onNavigate('nova-sessao')}
          className="w-full min-h-[52px] rounded-full bg-gradient-to-r from-[#a78bfa] via-[#cebdff] to-[#a78bfa] text-[#3c1989] font-bold text-xs uppercase tracking-wider shadow-[0_8px_24px_rgba(167,139,250,0.35)] hover:shadow-[0_0_28px_rgba(167,139,250,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">spa</span>
          <span>Iniciar Novo Atendimento para {selectedClient.name}</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-[#0f0c18]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1a1626] border border-[#ffb4ab]/30 rounded-3xl p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-full bg-[#93000a]/30 text-[#ffb4ab] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[26px]">delete_forever</span>
            </div>
            <h3 className="font-playfair text-lg text-[#e7dff1] font-semibold">
              Excluir Interagente?
            </h3>
            <p className="text-xs text-[#cac4d4] mt-2 leading-relaxed">
              Você está prestes a excluir <strong className="text-[#e7dff1]">{selectedClient.name}</strong>. Esta ação removerá definitivamente o cadastro e todas as suas sessões registradas em cascata.
            </p>

            <div className="pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-full bg-[#2c2835] text-[#cac4d4] text-xs font-semibold uppercase tracking-wider hover:bg-[#363340] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleDeleteClientCascade}
                className="flex-1 py-2.5 rounded-full bg-[#93000a] text-[#ffdad6] text-xs font-bold uppercase tracking-wider hover:bg-[#93000a]/80 shadow-lg cursor-pointer flex items-center justify-center gap-1"
              >
                {isSaving ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                ) : (
                  'Excluir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
