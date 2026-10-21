import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AppTab } from '../types';
import { DEFAULT_REPORT_TEXTS } from '../data/reportTexts';

interface ProfileViewProps {
  onNavigate: (tab: AppTab) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { profile, updateProfile, logout } = useAuth();
  const { sessions } = useData();

  // Branding Obrigatório
  const [marcaCompleta, setMarcaCompleta] = useState(profile?.marcaCompleta || profile?.brandName || 'Lunara Terapias');
  const [marcaCurta, setMarcaCurta] = useState(profile?.marcaCurta || 'LUNARA');
  const [nome, setNome] = useState(profile?.name || 'Celso Luiz');
  const [tituloProfissional, setTituloProfissional] = useState(profile?.tituloProfissional || profile?.title || 'Psicoterapeuta Holístico');
  const [telefone, setTelefone] = useState(profile?.phone || '+55(16)99793-4558');
  const [site, setSite] = useState(profile?.website || 'lunara-terapias-site.netlify.app');
  const [address, setAddress] = useState(profile?.address || 'Atendimento Presencial e Online');
  const [logoUrl, setLogoUrl] = useState(
    profile?.logoUrl ||
      'https://lh3.googleusercontent.com/aida/AEtjO1WOsx4_sGUcyvNqO56n_4xIwpNKYvFYILJdKzh9S4yO5j-WdtTkDFm0DNMt5fQ7xzTadSn2eXgEoH7SILbNjS4gzKGjBEkeTKwDuNjv0hbF-yN6LLPftNU75xOmqGmjnT-INwlZMIzMcS3mN_fh2dvD04LhH-TH21kcvv58ispOOb4MK7nFF71joNwTdleERuRDAr1NcqfD1j6K_QvvrFEhCe08zhEONkZl7hVCsoJiZAKilT3Ms5qsmtE'
  );

  // Textos Editáveis do Relatório
  const [openingStatement, setOpeningStatement] = useState(profile?.openingStatement || DEFAULT_REPORT_TEXTS.openingStatement);
  const [analiseIntegrada, setAnaliseIntegrada] = useState(profile?.analiseIntegrada || DEFAULT_REPORT_TEXTS.integratedAnalysis);
  const [importanciaEquilibrio, setImportanciaEquilibrio] = useState(profile?.importanciaEquilibrio || DEFAULT_REPORT_TEXTS.importanceOfBalance);
  const [generalGuidance, setGeneralGuidance] = useState(profile?.generalGuidance || DEFAULT_REPORT_TEXTS.generalGuidance);
  const [signatureText, setSignatureText] = useState(profile?.signatureText || 'Celso Luiz — Psicoterapeuta Holístico');

  // Resumos por Faixa
  const [rangeBaixa, setRangeBaixa] = useState(
    profile?.rangeSummaries?.baixa ||
      'Dispersão acentuada de energia vital. Demanda atenção prioritária e reorganização de práticas de descanso e ancoragem.'
  );
  const [rangeMedia, setRangeMedia] = useState(
    profile?.rangeSummaries?.media ||
      'Vórtice em oscilação ou desacoplamento moderado. Recomenda-se harmonização pontual para sustentar o fluxo.'
  );
  const [rangeEquilibrio, setRangeEquilibrio] = useState(
    profile?.rangeSummaries?.equilibrio ||
      'Homeostase dinâmica e vitalidade plena. O centro opera em fluidez coerente com os demais centros.'
  );

  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = async () => {
    if (!marcaCompleta.trim()) {
      setErrorMessage('O campo "Marca Completa" é obrigatório.');
      return;
    }
    if (!marcaCurta.trim()) {
      setErrorMessage('O campo "Marca Curta" é obrigatório.');
      return;
    }
    setErrorMessage(null);

    await updateProfile({
      marcaCompleta: marcaCompleta.trim(),
      marcaCurta: marcaCurta.trim().toUpperCase(),
      brandName: marcaCompleta.trim(),
      name: nome.trim(),
      title: tituloProfissional.trim(),
      tituloProfissional: tituloProfissional.trim(),
      phone: telefone.trim(),
      website: site.trim(),
      address: address.trim(),
      logoUrl: logoUrl.trim(),
      openingStatement: openingStatement.trim(),
      analiseIntegrada: analiseIntegrada.trim(),
      importanciaEquilibrio: importanciaEquilibrio.trim(),
      generalGuidance: generalGuidance.trim(),
      signatureText: signatureText.trim(),
      rangeSummaries: {
        baixa: rangeBaixa.trim(),
        media: rangeMedia.trim(),
        equilibrio: rangeEquilibrio.trim(),
      },
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogout = async () => {
    if (confirm('Deseja realmente encerrar a sessão?')) {
      await logout();
      onNavigate('inicio');
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-6">
      {/* Terapeuta & Marca Banner */}
      <section className="relative w-full rounded-2xl bg-[#1d1a26] border border-[#2e2844] p-5 sm:p-6 overflow-hidden shadow-xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#a78bfa]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-16 w-60 h-60 rounded-full bg-[#4edea3]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo / Avatar Preview */}
          <div className="relative mb-4 group">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-2xl bg-[#2c2835] border-2 border-[#a78bfa]/60 flex items-center justify-center p-2">
              <img
                alt={marcaCompleta}
                className="w-full h-full object-contain"
                src={logoUrl}
              />
            </div>
            <label
              htmlFor="logo-file-input"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#a78bfa] text-[#3c1989] flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
              title="Trocar Logotipo"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <input
                id="logo-file-input"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </div>

          <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-[#e7dff1] tracking-tight">
            {marcaCompleta}
          </h2>
          <p className="text-xs text-[#a78bfa] font-bold tracking-widest uppercase mt-0.5 mb-1">
            {marcaCurta}
          </p>
          <p className="text-xs text-[#cebdff] font-medium">{nome} • {tituloProfissional}</p>
          <p className="text-[11px] text-[#948e9d] mt-0.5">{telefone} | {site}</p>

          {/* Badge do Consultório */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00b37c]/15 text-[#4edea3] border border-[#00b37c]/30 shadow-sm mt-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Consultório Ativo
            </span>
          </div>
        </div>
      </section>

      {/* Alerta de campos obrigatórios se faltar */}
      {(!profile?.marcaCompleta || !profile?.marcaCurta) && (
        <div className="p-4 rounded-xl bg-[#a78bfa]/15 border border-[#a78bfa]/40 text-[#e7dff1] text-xs flex items-start gap-3">
          <span className="material-symbols-outlined text-[#cebdff] text-[20px] shrink-0 mt-0.5">stars</span>
          <div>
            <p className="font-bold text-[#cebdff] uppercase tracking-wide">
              Configure sua Identidade Visual
            </p>
            <p className="text-[#cac4d4] mt-0.5 leading-relaxed">
              Preencha a <strong>Marca Completa</strong> e a <strong>Marca Curta</strong> abaixo para habilitar a geração personalizada dos relatórios oficiais em PDF.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. SEÇÃO DE BRANDING OBRIGATÓRIO */}
      <section className="rounded-2xl bg-[#1d1a26] border border-[#2e2844] p-5 shadow-md space-y-4">
        <div className="flex items-center gap-2.5 pb-1 border-b border-[#2e2844]/60">
          <div className="w-8 h-8 rounded-lg bg-[#2c2835] flex items-center justify-center text-[#a78bfa]">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <div>
            <h3 className="font-playfair text-base font-semibold text-[#e7dff1]">
              Identidade &amp; Branding do Terapeuta
            </h3>
            <p className="text-[11px] text-[#cac4d4]">Espelhado no cabeçalho e rodapé dos relatórios em PDF</p>
          </div>
        </div>

        {/* Marca Completa (OBRIGATÓRIO) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#e7dff1] flex items-center gap-1.5">
            <span>Marca Completa</span>
            <span className="text-[10px] text-[#f97316] font-bold uppercase">(Obrigatório)</span>
          </label>
          <div className="flex items-center bg-[#15121e] border border-[#2e2844] rounded-xl px-3 py-2.5 focus-within:border-[#a78bfa]">
            <input
              type="text"
              required
              placeholder="Ex: Lunara Terapias"
              value={marcaCompleta}
              onChange={(e) => setMarcaCompleta(e.target.value)}
              className="bg-transparent text-xs text-[#e7dff1] font-medium focus:outline-none w-full"
            />
          </div>
          <span className="text-[10px] text-[#948e9d] block">
            Exibida no cabeçalho à direita e na linha 2 do rodapé do relatório.
          </span>
        </div>

        {/* Marca Curta (OBRIGATÓRIO) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#e7dff1] flex items-center gap-1.5">
            <span>Marca Curta</span>
            <span className="text-[10px] text-[#f97316] font-bold uppercase">(Obrigatório)</span>
          </label>
          <div className="flex items-center bg-[#15121e] border border-[#2e2844] rounded-xl px-3 py-2.5 focus-within:border-[#a78bfa]">
            <input
              type="text"
              required
              placeholder="Ex: LUNARA"
              value={marcaCurta}
              onChange={(e) => setMarcaCurta(e.target.value.toUpperCase())}
              className="bg-transparent text-xs text-[#cebdff] font-bold tracking-wider uppercase focus:outline-none w-full"
            />
          </div>
          <span className="text-[10px] text-[#948e9d] block">
            Exibida na linha 1 do rodapé do relatório, alinhada à esquerda em destaque.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Nome */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#e7dff1]">Nome do Terapeuta</label>
            <div className="flex items-center bg-[#15121e] border border-[#2e2844] rounded-xl px-3 py-2 focus-within:border-[#a78bfa]">
              <input
                type="text"
                placeholder="Ex: Celso Luiz"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-transparent text-xs text-[#e7dff1] focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Título Profissional */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#e7dff1]">Título Profissional</label>
            <div className="flex items-center bg-[#15121e] border border-[#2e2844] rounded-xl px-3 py-2 focus-within:border-[#a78bfa]">
              <input
                type="text"
                placeholder="Ex: Psicoterapeuta Holístico"
                value={tituloProfissional}
                onChange={(e) => setTituloProfissional(e.target.value)}
                className="bg-transparent text-xs text-[#e7dff1] focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Telefone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#e7dff1]">Telefone / WhatsApp</label>
            <div className="flex items-center bg-[#15121e] border border-[#2e2844] rounded-xl px-3 py-2 focus-within:border-[#a78bfa]">
              <input
                type="text"
                placeholder="Ex: +55(16)99793-4558"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="bg-transparent text-xs text-[#e7dff1] focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Site */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#e7dff1]">Site / Portal</label>
            <div className="flex items-center bg-[#15121e] border border-[#2e2844] rounded-xl px-3 py-2 focus-within:border-[#a78bfa]">
              <input
                type="text"
                placeholder="Ex: lunara-terapias-site.netlify.app"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="bg-transparent text-xs text-[#e7dff1] focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* URL do Logo */}
        <div className="space-y-1 pt-1">
          <label className="text-xs font-semibold text-[#e7dff1]">URL da Logomarca (ou upload acima)</label>
          <div className="flex items-center bg-[#15121e] border border-[#2e2844] rounded-xl px-3 py-2 focus-within:border-[#a78bfa]">
            <input
              type="text"
              placeholder="https://exemplo.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="bg-transparent text-xs text-[#cac4d4] focus:outline-none w-full font-mono text-[11px]"
            />
          </div>
        </div>
      </section>

      {/* 2. TEXTOS EDITÁVEIS DO RELATÓRIO */}
      <section className="rounded-2xl bg-[#1d1a26] border border-[#2e2844] p-5 shadow-md space-y-4">
        <div className="flex items-center gap-2.5 pb-1 border-b border-[#2e2844]/60">
          <div className="w-8 h-8 rounded-lg bg-[#2c2835] flex items-center justify-center text-[#4edea3]">
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
          </div>
          <div>
            <h3 className="font-playfair text-base font-semibold text-[#e7dff1]">
              Textos Editáveis do Relatório
            </h3>
            <p className="text-[11px] text-[#cac4d4]">Personalize o conteúdo técnico e editorial das seções do laudo</p>
          </div>
        </div>

        {/* Termo de Abertura / Resumo Energético */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#e7dff1]">Termo de Abertura / Resumo Energético</label>
          <textarea
            rows={3}
            value={openingStatement}
            onChange={(e) => setOpeningStatement(e.target.value)}
            className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-3 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa] resize-none leading-relaxed"
          />
        </div>

        {/* Análise Energética Integrada */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#e7dff1]">Análise Energética Integrada</label>
          <textarea
            rows={4}
            value={analiseIntegrada}
            onChange={(e) => setAnaliseIntegrada(e.target.value)}
            className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-3 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa] resize-none leading-relaxed"
          />
        </div>

        {/* Importância do Equilíbrio */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#e7dff1]">Importância do Equilíbrio</label>
          <textarea
            rows={3}
            value={importanciaEquilibrio}
            onChange={(e) => setImportanciaEquilibrio(e.target.value)}
            className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-3 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa] resize-none leading-relaxed"
          />
        </div>

        {/* Orientações Gerais */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#e7dff1]">Orientações Gerais Pós-Atendimento</label>
          <textarea
            rows={3}
            value={generalGuidance}
            onChange={(e) => setGeneralGuidance(e.target.value)}
            className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-3 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa] resize-none leading-relaxed"
          />
        </div>

        {/* Assinatura */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#e7dff1]">Assinatura do Terapeuta (Linha 3 Rodapé)</label>
          <div className="flex items-center bg-[#15121e] border border-[#2e2844] rounded-xl px-3 py-2">
            <input
              type="text"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              className="w-full bg-transparent text-xs text-[#e7dff1] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 3. RESUMOS POR FAIXA EDITÁVEIS */}
      <section className="rounded-2xl bg-[#1d1a26] border border-[#2e2844] p-5 shadow-md space-y-4">
        <div className="flex items-center gap-2.5 pb-1 border-b border-[#2e2844]/60">
          <div className="w-8 h-8 rounded-lg bg-[#2c2835] flex items-center justify-center text-[#f97316]">
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </div>
          <div>
            <h3 className="font-playfair text-base font-semibold text-[#e7dff1]">
              Resumos por Faixa de Equilíbrio
            </h3>
            <p className="text-[11px] text-[#cac4d4]">Descritivos automáticos para cada intervalo de pontuação</p>
          </div>
        </div>

        {/* Faixa Baixa: 0 - 40% */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-[#ffb4ab]">Faixa Baixa (0 a 40%)</label>
            <span className="text-[9px] text-[#ffb4ab] bg-[#93000a]/20 px-2 py-0.5 rounded-full font-bold">
              Desarmonia Severa
            </span>
          </div>
          <textarea
            rows={2}
            value={rangeBaixa}
            onChange={(e) => setRangeBaixa(e.target.value)}
            className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-3 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa] resize-none"
          />
        </div>

        {/* Faixa Média: 41 - 64% */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-[#f97316]">Faixa Média (41 a 64%)</label>
            <span className="text-[9px] text-[#f97316] bg-[#f97316]/20 px-2 py-0.5 rounded-full font-bold">
              Precisa de Atenção
            </span>
          </div>
          <textarea
            rows={2}
            value={rangeMedia}
            onChange={(e) => setRangeMedia(e.target.value)}
            className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-3 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa] resize-none"
          />
        </div>

        {/* Faixa Equilíbrio: 65 - 100% */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-[#4edea3]">Faixa de Equilíbrio (65 a 100%)</label>
            <span className="text-[9px] text-[#4edea3] bg-[#00b37c]/20 px-2 py-0.5 rounded-full font-bold">
              Equilibrado
            </span>
          </div>
          <textarea
            rows={2}
            value={rangeEquilibrio}
            onChange={(e) => setRangeEquilibrio(e.target.value)}
            className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl p-3 text-xs text-[#e7dff1] focus:outline-none focus:border-[#a78bfa] resize-none"
          />
        </div>

        {/* Botão de Salvar Alterações */}
        <button
          type="button"
          onClick={handleSaveBranding}
          className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#cebdff] via-[#a78bfa] to-[#cebdff] text-[#3c1989] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-98 hover:brightness-105 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isSaved ? 'check_circle' : 'save'}
          </span>
          <span>{isSaved ? 'Identidade e Padrões Atualizados!' : 'Salvar Identidade & Padrões'}</span>
        </button>
      </section>

      {/* Logout e Segurança */}
      <section className="rounded-2xl bg-[#1d1a26] border border-[#2e2844] p-4 shadow-md">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3 px-4 rounded-xl bg-[#15121e] hover:bg-[#211e2a] border border-[#2e2844] text-[#e7dff1] text-xs font-medium flex items-center justify-between transition-colors active:scale-99 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-[#ffb4ab]">logout</span>
            <span>Encerrar Sessão (Logout)</span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#948e9d]">chevron_right</span>
        </button>
      </section>
    </div>
  );
};
