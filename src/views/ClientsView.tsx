import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AppTab, ClientModel } from '../types';

interface ClientsViewProps {
  onNavigate: (tab: AppTab) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ onNavigate }) => {
  const { clients, setSelectedClient, addClient, updateClient, deleteClient, networkNotice, clearNetworkNotice } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'warning' | 'recent' | 'discharge'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientModel | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientModel | null>(null);
  const [drawerClient, setDrawerClient] = useState<ClientModel | null>(null);

  // New Client Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [protocol, setProtocol] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Diagnostic counts
  const balancedCount = clients.filter((c) => c.status === 'active' && c.averageScore >= 65).length;
  const attentionCount = clients.filter((c) => c.status === 'attention' || (c.sessionCount > 0 && c.averageScore < 65)).length;
  const finalizedCount = clients.filter((c) => c.status === 'finalized' || (c.status as string) === 'discharged').length;

  const filteredClients = clients.filter((client) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      client.name.toLowerCase().includes(q) ||
      client.protocol.toLowerCase().includes(q) ||
      client.notes.toLowerCase().includes(q) ||
      (client.lastSessionDate && client.lastSessionDate.includes(q));

    let matchesFilter = true;
    if (activeFilter === 'warning') {
      matchesFilter = client.status === 'attention' || (client.sessionCount > 0 && client.averageScore < 65);
    } else if (activeFilter === 'discharge') {
      matchesFilter = client.status === 'finalized' || (client.status as string) === 'discharged';
    } else if (activeFilter === 'recent') {
      matchesFilter = !!client.lastSessionDate;
    }

    return matchesSearch && matchesFilter;
  });

  const handleOpenAddModal = () => {
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Por favor, informe o nome completo do cliente.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const created = await addClient({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        age: age ? `${age.trim()} anos` : '',
        protocol: protocol.trim() || 'Harmonização de Ansiedade & Alinhamento de Chakras Sutis',
        notes: notes.trim(),
      });
      // Reset form on success
      setName('');
      setPhone('');
      setEmail('');
      setAge('');
      setProtocol('');
      setNotes('');
      setIsAddModalOpen(false);
      setSelectedClient(created);
      onNavigate('detalhes-cliente');
    } catch (err) {
      console.error(err);
      setFormError('Sem conexão no momento. Os dados foram preservados no formulário para você tentar novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (e: React.MouseEvent, client: ClientModel) => {
    e.stopPropagation();
    setEditingClient(client);
    setName(client.name);
    setPhone(client.phone);
    setEmail(client.email);
    setAge(client.age.replace(' anos', ''));
    setProtocol(client.protocol);
    setNotes(client.notes);
    setDrawerClient(null);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !name.trim()) return;
    setIsSaving(true);
    try {
      await updateClient(editingClient.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        age: age ? `${age.trim()} anos` : '',
        protocol: protocol.trim(),
        notes: notes.trim(),
      });
      setEditingClient(null);
      setName('');
      setPhone('');
      setEmail('');
      setAge('');
      setProtocol('');
      setNotes('');
    } catch (err) {
      console.error(err);
      setFormError('Sem conexão no momento. Os dados foram mantidos no formulário.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setIsSaving(true);
    try {
      await deleteClient(clientToDelete.id);
      setClientToDelete(null);
      setDrawerClient(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectClient = (client: ClientModel) => {
    setSelectedClient(client);
    setDrawerClient(client);
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-4">
      {/* Network Notice Toast if any */}
      {networkNotice && (
        <div className="w-full p-3 rounded-2xl bg-[#211e2a] border border-[#a78bfa]/40 text-[#cebdff] text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">cloud_off</span>
            <span>{networkNotice}</span>
          </div>
          <button
            type="button"
            onClick={clearNetworkNotice}
            className="text-[#cac4d4] hover:text-[#e7dff1] p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Dynamic Spectral Ambient Backdrop Glow */}
      <div className="relative w-full rounded-2xl bg-[#1d1a26] border border-[#2e2844] p-5 shadow-xl overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-[#a78bfa]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#cebdff] tracking-widest uppercase font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cebdff] animate-pulse" />
              Prontuário Energético
            </span>
            <span className="text-[11px] text-[#cac4d4] bg-[#2c2835] px-2 py-0.5 rounded-full border border-[#494552]">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl text-[#e7dff1] font-normal tracking-tight">
            Gestão de Clientes
          </h1>
          <p className="text-xs text-[#cac4d4]">
            {clients.length} clientes cadastrados com mapeamento espectral ativo
          </p>
        </div>

        {/* Quick Vital Diagnostic Strip */}
        <div className="relative z-10 grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#363340]/60">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#948e9d] uppercase font-bold">EM DIA</span>
            <span className="font-playfair text-xl text-[#4edea3] font-semibold">{balancedCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#948e9d] uppercase font-bold">ATENÇÃO</span>
            <span className="font-playfair text-xl text-[#ffb4ab] font-semibold">{attentionCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#948e9d] uppercase font-bold">FINALIZADOS</span>
            <span className="font-playfair text-xl text-[#cebdff] font-semibold">{finalizedCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-2">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#948e9d] text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, queixa ou data..."
            className="w-full bg-[#0f0c18] border border-[#2e2844] text-[#e7dff1] placeholder:text-[#655f78] text-xs pl-11 pr-10 py-3 rounded-xl focus:outline-none focus:border-[#a78bfa] shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#2c2835] text-[#cac4d4] flex items-center justify-center hover:text-[#e7dff1] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#a78bfa] text-[#3c1989] shadow-sm'
                : 'bg-[#2c2835] text-[#cac4d4] hover:text-[#e7dff1]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">tune</span>
            Todos ({clients.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('warning')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'warning'
                ? 'bg-[#a78bfa] text-[#3c1989] shadow-sm'
                : 'bg-[#2c2835] text-[#cac4d4] hover:text-[#e7dff1]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
            Precisam de Atenção ({attentionCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('recent')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'recent'
                ? 'bg-[#a78bfa] text-[#3c1989] shadow-sm'
                : 'bg-[#2c2835] text-[#cac4d4] hover:text-[#e7dff1]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Recentes
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('discharge')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'discharge'
                ? 'bg-[#a78bfa] text-[#3c1989] shadow-sm'
                : 'bg-[#2c2835] text-[#cac4d4] hover:text-[#e7dff1]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Finalizados ({finalizedCount})
          </button>
        </div>
      </div>

      {/* Primary Action Button: Novo Cliente */}
      <button
        type="button"
        onClick={handleOpenAddModal}
        className="w-full min-h-[50px] rounded-full bg-gradient-to-r from-[#a78bfa] via-[#cebdff] to-[#a78bfa] text-[#3c1989] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(167,139,250,0.28)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px] font-bold">person_add</span>
        Novo Cliente Bioenergético
      </button>

      {/* Editorial Micro-Instruction Bar */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[#948e9d] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-[#a78bfa]">touch_app</span>
          Toque em um cliente para abrir a evolução do alinhamento.
        </p>
        <span className="text-[10px] text-[#cac4d4] uppercase font-bold">
          {filteredClients.length} cadastrados
        </span>
      </div>

      {/* Clients List */}
      <div className="flex flex-col gap-2.5">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-[#1d1a26] border border-[#2e2844] rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-[#2c2835] flex items-center justify-center text-[#948e9d] mb-2">
              <span className="material-symbols-outlined text-[24px]">person_search</span>
            </div>
            <h3 className="font-playfair text-base text-[#e7dff1]">
              {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente localizado'}
            </h3>
            <p className="text-xs text-[#cac4d4] max-w-xs mt-1">
              {clients.length === 0
                ? 'Clique no botão acima para cadastrar seu primeiro cliente no consultório.'
                : 'Tente buscar por outro termo ou limpe os filtros aplicados.'}
            </p>
          </div>
        ) : (
          filteredClients.map((client) => {
            const hasSessions = client.sessionCount > 0;
            const isBalanced = hasSessions ? client.averageScore >= 65 : true;

            return (
              <div
                key={client.id}
                onClick={() => handleSelectClient(client)}
                className="group w-full bg-[#1d1a26] hover:bg-[#211e2a] border border-[#2e2844] p-4 rounded-2xl shadow-md transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Border Indicator Strip on left */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    !hasSessions
                      ? 'bg-[#a78bfa]'
                      : isBalanced
                      ? 'bg-[#4edea3]'
                      : 'bg-[#f97316]'
                  }`}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Initials Avatar */}
                    <div className="relative w-12 h-12 rounded-full bg-[#4a3d7c]/60 text-[#e7deff] border border-[#494552] flex items-center justify-center font-playfair text-base font-semibold shrink-0 shadow-[0_0_12px_rgba(167,139,250,0.2)]">
                      {client.initials || client.name.slice(0, 2).toUpperCase()}
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#1d1a26] ${
                          !hasSessions
                            ? 'bg-[#a78bfa]'
                            : isBalanced
                            ? 'bg-[#4edea3]'
                            : 'bg-[#f97316]'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-playfair text-base text-[#e7dff1] group-hover:text-[#cebdff] transition-colors truncate font-medium">
                          {client.name}
                        </span>
                        {client.status === 'discharged' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#4edea3]/20 text-[#4edea3] font-bold">
                            Alta
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#cac4d4] flex items-center gap-1 mt-0.5 truncate">
                        <span className="material-symbols-outlined text-[13px] text-[#948e9d]">history</span>
                        {client.lastSessionDate
                          ? `Última sessão: ${client.lastSessionDate}`
                          : 'Aguardando primeiro atendimento'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Editar interagente"
                      onClick={(e) => handleOpenEdit(e, client)}
                      className="p-1 text-[#948e9d] hover:text-[#a78bfa] rounded-full transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <span className="material-symbols-outlined text-[#948e9d] group-hover:text-[#a78bfa] group-hover:translate-x-0.5 transition-all shrink-0">
                      chevron_right
                    </span>
                  </div>
                </div>

                {/* Diagnostic Status Badge & Frequency Gauge */}
                <div className="mt-3 pt-2.5 border-t border-[#363340]/40 flex items-center justify-between">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      !hasSessions
                        ? 'bg-[#4a3d7c]/30 text-[#cebdff]'
                        : isBalanced
                        ? 'bg-[#00b37c]/20 text-[#4edea3]'
                        : 'bg-[#f97316]/20 text-[#ffb4ab]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        !hasSessions
                          ? 'bg-[#cebdff]'
                          : isBalanced
                          ? 'bg-[#4edea3] animate-pulse'
                          : 'bg-[#f97316] animate-ping'
                      }`}
                    />
                    {!hasSessions
                      ? 'Novo Cadastro'
                      : isBalanced
                      ? `Equilibrada (${client.averageScore}%)`
                      : `Atenção (${client.averageScore}%)`}
                  </div>
                  <div className="flex items-center gap-1.5 text-[#cac4d4] text-xs">
                    <span className="material-symbols-outlined text-[15px] text-[#a78bfa]">spa</span>
                    {client.sessionCount} {client.sessionCount === 1 ? 'sessão realizada' : 'sessões realizadas'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Drawer / Modal Sheet */}
      {drawerClient && (
        <div
          className="fixed inset-0 z-50 bg-[#0f0c18]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300"
          onClick={() => setDrawerClient(null)}
        >
          <div
            className="w-full max-w-md bg-[#211e2a] border border-[#2e2844] p-6 rounded-t-3xl sm:rounded-3xl shadow-[0_-8px_32px_rgba(15,12,24,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-[#494552] rounded-full mx-auto mb-4" />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#a78bfa] text-[#3c1989] font-playfair text-lg font-bold flex items-center justify-center">
                  {drawerClient.initials || drawerClient.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-playfair text-lg text-[#e7dff1] font-semibold">{drawerClient.name}</h3>
                  <span className="text-[10px] text-[#a78bfa] font-bold uppercase tracking-wider">
                    {drawerClient.age || 'Prontuário Ativo'} • {drawerClient.protocol}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Editar interagente"
                  onClick={(e) => handleOpenEdit(e, drawerClient)}
                  className="text-[#cac4d4] hover:text-[#a78bfa] p-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  type="button"
                  title="Fechar"
                  onClick={() => setDrawerClient(null)}
                  className="text-[#cac4d4] hover:text-[#e7dff1] p-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="my-4 p-3.5 rounded-xl bg-[#1d1a26] border border-[#2e2844] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#cac4d4]">Índice Bioenergético Médio</span>
                <span className="font-playfair text-lg text-[#cebdff] font-bold">
                  {drawerClient.sessionCount > 0 ? `${drawerClient.averageScore}%` : 'Sem sessões'}
                </span>
              </div>
              {drawerClient.sessionCount > 0 && (
                <div className="w-full h-1.5 rounded-full bg-[#363340] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      drawerClient.averageScore >= 65
                        ? 'bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.8)]'
                        : 'bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                    }`}
                    style={{ width: `${drawerClient.averageScore}%` }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedClient(drawerClient);
                  setDrawerClient(null);
                  onNavigate('nova-sessao');
                }}
                className="w-full min-h-[46px] rounded-full bg-[#a78bfa] hover:bg-[#cebdff] text-[#3c1989] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">radiology</span>
                Nova Sessão
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedClient(drawerClient);
                  setDrawerClient(null);
                  onNavigate('detalhes-cliente');
                }}
                className="w-full min-h-[46px] rounded-full bg-[#2c2835] hover:bg-[#363340] text-[#e7dff1] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#494552] active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
                Ver Prontuário
              </button>
            </div>

            {/* Quick delete trigger */}
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setClientToDelete(drawerClient);
                  setDrawerClient(null);
                }}
                className="text-[11px] text-[#ffb4ab] hover:underline cursor-pointer"
              >
                Excluir interagente e seus atendimentos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Cliente Bioenergético */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f0c18]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1a1626] border border-[#2e2844] rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a78bfa]">person_add</span>
                <h3 className="font-playfair text-lg text-[#e7dff1] font-semibold">Novo Interagente</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#cac4d4] hover:text-[#e7dff1] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana Alencar"
                  className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                    Idade
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ex: 34"
                    className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                  Protocolo de Atendimento
                </label>
                <input
                  type="text"
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  placeholder="Ex: Harmonização de Ansiedade & Alinhamento de Chakras Sutis"
                  className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                  Observações Iniciais / Queixa
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Sensações, queixas de estresse, percepções prévias..."
                  className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa] resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-full bg-[#2c2835] text-[#cac4d4] text-xs font-semibold uppercase tracking-wider hover:bg-[#363340] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-full bg-[#a78bfa] text-[#3c1989] text-xs font-bold uppercase tracking-wider hover:bg-[#cebdff] shadow-lg cursor-pointer flex items-center justify-center gap-1"
                >
                  {isSaving ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  ) : (
                    'Cadastrar Interagente'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Cliente */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-[#0f0c18]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1a1626] border border-[#2e2844] rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a78bfa]">edit</span>
                <h3 className="font-playfair text-lg text-[#e7dff1] font-semibold">Editar Interagente</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="text-[#cac4d4] hover:text-[#e7dff1] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateClient} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                    Idade
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                  Protocolo de Atendimento
                </label>
                <input
                  type="text"
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#948e9d] mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa] resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="flex-1 py-3 rounded-full bg-[#2c2835] text-[#cac4d4] text-xs font-semibold uppercase tracking-wider hover:bg-[#363340] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-full bg-[#a78bfa] text-[#3c1989] text-xs font-bold uppercase tracking-wider hover:bg-[#cebdff] shadow-lg cursor-pointer flex items-center justify-center gap-1"
                >
                  {isSaving ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Exclusão com Cascata Real */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 bg-[#0f0c18]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1a1626] border border-[#ffb4ab]/30 rounded-3xl p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-full bg-[#93000a]/30 text-[#ffb4ab] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[26px]">delete_forever</span>
            </div>
            <h3 className="font-playfair text-lg text-[#e7dff1] font-semibold">
              Excluir Interagente?
            </h3>
            <p className="text-xs text-[#cac4d4] mt-2 leading-relaxed">
              Você está prestes a excluir <strong className="text-[#e7dff1]">{clientToDelete.name}</strong>. Esta ação removerá definitivamente o cadastro e todas as sessões e scores associados (exclusão em cascata).
            </p>

            <div className="pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="flex-1 py-2.5 rounded-full bg-[#2c2835] text-[#cac4d4] text-xs font-semibold uppercase tracking-wider hover:bg-[#363340] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmDelete}
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
