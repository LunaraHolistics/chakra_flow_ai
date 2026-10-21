import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { loginGoogle, loginEmail, registerEmail, loginDemo, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      if (isRegistering) {
        if (!name.trim()) {
          setErrorMsg('Por favor, informe seu nome completo de terapeuta.');
          setIsSubmitting(false);
          return;
        }
        await registerEmail(email, password, name);
      } else {
        await loginEmail(email, password);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Falha na autenticação';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setErrorMsg('E-mail ou senha incorretos.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setErrorMsg('Este e-mail já possui cadastro.');
      } else if (msg.includes('auth/weak-password')) {
        setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      } else {
        setErrorMsg('Erro de conexão ao autenticar. Verifique sua rede e tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await loginGoogle();
    } catch (err) {
      console.error('Google sign-in error:', err);
      setErrorMsg('Não foi possível concluir o login com o Google. Verifique se pop-ups estão autorizados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#15121e] text-[#e7dff1] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Spectral Ambient Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#a78bfa]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#4edea3]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1a1626] border border-[#2e2844] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 flex flex-col items-center">
        {/* Emblem & Identity */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-[#211e2a] border border-[#2e2844] flex items-center justify-center shadow-[0_0_24px_rgba(167,139,250,0.3)]">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1WOsx4_sGUcyvNqO56n_4xIwpNKYvFYILJdKzh9S4yO5j-WdtTkDFm0DNMt5fQ7xzTadSn2eXgEoH7SILbNjS4gzKGjBEkeTKwDuNjv0hbF-yN6LLPftNU75xOmqGmjnT-INwlZMIzMcS3mN_fh2dvD04LhH-TH21kcvv58ispOOb4MK7nFF71joNwTdleERuRDAr1NcqfD1j6K_QvvrFEhCe08zhEONkZl7hVCsoJiZAKilT3Ms5qsmtE"
              alt="Chakra Flow"
              className="w-14 h-14 object-contain"
            />
          </div>
        </div>

        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#211e2a] text-[#a78bfa] text-[10px] font-bold uppercase tracking-widest border border-[#2e2844]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
            Consultório Bioenergético • Prontuário Integrativo
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-[#e7dff1] tracking-tight">
            Chakra Flow
          </h1>
          <p className="text-[#cac4d4] text-xs max-w-xs mx-auto leading-relaxed">
            Plataforma para terapeutas registrarem atendimentos de realinhamento energético e gerarem relatórios em PDF A4.
          </p>
        </div>

        {errorMsg && (
          <div className="w-full mb-4 p-3 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Action: Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting || loading}
          className="w-full min-h-[50px] rounded-full bg-gradient-to-r from-[#cebdff] via-[#a78bfa] to-[#cebdff] text-[#3c1989] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(167,139,250,0.35)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer mb-4"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Entrar com Google</span>
        </button>

        {/* Development Only Demo Access */}
        {import.meta.env.DEV && loginDemo && (
          <button
            type="button"
            onClick={loginDemo}
            className="w-full min-h-[44px] rounded-full bg-[#211e2a] hover:bg-[#2c2835] border border-[#a78bfa]/40 text-[#cebdff] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer mb-5 shadow-sm active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">developer_mode</span>
            <span>Acesso Rápido de Teste (Ambiente Dev)</span>
          </button>
        )}

        <div className="w-full flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[#2e2844]" />
          <span className="text-[10px] text-[#948e9d] uppercase tracking-wider">ou e-mail e senha</span>
          <div className="flex-1 h-px bg-[#2e2844]" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="w-full space-y-3 mt-2">
          {isRegistering && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#948e9d] mb-1 font-bold">
                Nome do Terapeuta
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Dra. Helena Rostand"
                className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] placeholder:text-[#655f78] focus:outline-none focus:border-[#a78bfa] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#948e9d] mb-1 font-bold">
              E-mail do Consultório
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="terapeuta@consultorio.com"
              className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] placeholder:text-[#655f78] focus:outline-none focus:border-[#a78bfa] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#948e9d] mb-1 font-bold">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#15121e] border border-[#2e2844] rounded-xl px-3.5 py-2.5 text-xs text-[#e7dff1] placeholder:text-[#655f78] focus:outline-none focus:border-[#a78bfa] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full min-h-[46px] rounded-full bg-[#2c2835] hover:bg-[#363340] text-[#e7dff1] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#494552] transition-all cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : isRegistering ? (
              'Criar Conta'
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg(null);
            }}
            className="text-xs text-[#a78bfa] hover:underline cursor-pointer"
          >
            {isRegistering
              ? 'Já possui cadastro? Fazer login'
              : 'Novo terapeuta? Criar conta'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#2e2844]/60 w-full text-center">
          <p className="text-[10px] text-[#948e9d] flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-[#4edea3]">lock</span>
            Acesso seguro e restrito ao terapeuta
          </p>
        </div>
      </div>
    </div>
  );
};
