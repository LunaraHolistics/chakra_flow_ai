import { ChakraScores } from '../utils/calculations';
export type { ChakraScores };

export interface RangeSummaries {
  baixa: string;      // 0 - 40%
  media: string;      // 41 - 64%
  equilibrio: string; // 65 - 100%
}

export interface PractitionerProfile {
  id: string;
  userId: string;
  marcaCompleta: string;      // Ex: "Lunara Terapias" (Obrigatório)
  marcaCurta: string;         // Ex: "LUNARA" (Obrigatório)
  brandName: string;          // Alias para marcaCompleta
  name: string;               // Nome do terapeuta (ex: "Celso Luiz")
  title: string;              // Título profissional (ex: "Psicoterapeuta Holístico")
  tituloProfissional?: string;// Alias para title
  phone: string;              // Telefone / WhatsApp (ex: "+55(16)99793-4558")
  email: string;
  website: string;            // Site (ex: "lunara-terapias-site.netlify.app")
  address: string;
  logoUrl?: string;           // URL da logomarca
  openingStatement: string;   // Resumo de abertura
  analiseIntegrada?: string;  // Análise Energética Integrada customizável
  importanciaEquilibrio?: string; // Importância do Equilíbrio customizável
  generalGuidance: string;    // Orientações Gerais
  signatureText: string;      // Assinatura
  rangeSummaries?: RangeSummaries; // Resumos por faixa (Baixa, Média, Equilíbrio)
  createdAt: string;
  updatedAt: string;
}

export interface ClientModel {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  age: string;
  protocol: string; // Protocolo / Objetivo terapêutico do cliente (separado de observações)
  notes: string;    // Observações gerais do cliente
  status: 'active' | 'attention' | 'finalized';
  lastSessionDate?: string;
  sessionCount: number;
  averageScore: number;
  initials?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecommendations {
  aromatherapy: string;
  solfeggio: string;
  meditation: string;
  nextReturn: string;
  lifestyle?: string;
}

export interface SessionModel {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  sessionNumber: number;
  sessionDate: string;
  durationMinutes: number;
  sessionType: 'presential' | 'remote';
  overallScore: number;
  attentionCount: number;
  scores: ChakraScores;
  clinicalNotes: string;
  recommendations: SessionRecommendations;
  previousSessionScores?: ChakraScores;
  createdAt: string;
  updatedAt: string;
}

export type AppTab =
  | 'inicio'
  | 'clientes'
  | 'nova-sessao'
  | 'historico'
  | 'perfil'
  | 'detalhes-cliente'
  | 'relatorio-sessao';
