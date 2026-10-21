import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { handleFirestoreError, OperationType } from '../services/firebaseError';
import { useAuth } from './AuthContext';
import { ClientModel, SessionModel } from '../types';
import { calculateOverallScore, countAttentionNeeded } from '../utils/calculations';

interface DataContextType {
  clients: ClientModel[];
  sessions: SessionModel[];
  loading: boolean;
  networkNotice: string | null;
  clearNetworkNotice: () => void;
  selectedClient: ClientModel | null;
  setSelectedClient: (client: ClientModel | null) => void;
  selectedSession: SessionModel | null;
  setSelectedSession: (session: SessionModel | null) => void;
  addClient: (data: Partial<ClientModel> & { name: string }) => Promise<ClientModel>;
  updateClient: (id: string, updates: Partial<ClientModel>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addSession: (data: Omit<SessionModel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<SessionModel>;
  getClientSessions: (clientId: string) => SessionModel[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isDemo } = useAuth();
  const [clients, setClients] = useState<ClientModel[]>([]);
  const [sessions, setSessions] = useState<SessionModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [networkNotice, setNetworkNotice] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientModel | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionModel | null>(null);

  const clearNetworkNotice = () => setNetworkNotice(null);

  // Firestore real-time listeners for clients and sessions
  useEffect(() => {
    if (!user) {
      if (isDemo && import.meta.env.DEV) {
        // Dev fallback in localStorage
        const savedClients = localStorage.getItem('chakra_flow_clients');
        const savedSessions = localStorage.getItem('chakra_flow_sessions');
        if (savedClients) {
          try {
            setClients(JSON.parse(savedClients));
          } catch {
            setClients([]);
          }
        }
        if (savedSessions) {
          try {
            setSessions(JSON.parse(savedSessions));
          } catch {
            setSessions([]);
          }
        }
      } else {
        setClients([]);
        setSessions([]);
      }
      setLoading(false);
      return;
    }

    setLoading(true);

    const clientsRef = collection(db, 'clients');
    const qClients = query(clientsRef, where('userId', '==', user.uid));

    const unsubClients = onSnapshot(
      qClients,
      (snapshot) => {
        const clientList: ClientModel[] = [];
        snapshot.forEach((d) => {
          clientList.push(d.data() as ClientModel);
        });
        // Sort clients alphabetically or by last session
        clientList.sort((a, b) => a.name.localeCompare(b.name));
        setClients(clientList);
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore clients listener note:', error);
        setNetworkNotice(
          'Sem conexão no momento. As informações permanecem salvas neste dispositivo até a sincronização.'
        );
        setLoading(false);
      }
    );

    const sessionsRef = collection(db, 'sessions');
    const qSessions = query(sessionsRef, where('userId', '==', user.uid));

    const unsubSessions = onSnapshot(
      qSessions,
      (snapshot) => {
        const sessionList: SessionModel[] = [];
        snapshot.forEach((d) => {
          sessionList.push(d.data() as SessionModel);
        });
        sessionList.sort(
          (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
        );
        setSessions(sessionList);
      },
      (error) => {
        console.warn('Firestore sessions listener note:', error);
        setNetworkNotice(
          'Sem conexão no momento. As informações permanecem salvas neste dispositivo até a sincronização.'
        );
      }
    );

    return () => {
      unsubClients();
      unsubSessions();
    };
  }, [user, isDemo]);

  // Keep selectedClient in sync with updated list
  useEffect(() => {
    if (selectedClient) {
      const refreshed = clients.find((c) => c.id === selectedClient.id);
      if (refreshed) {
        setSelectedClient(refreshed);
      }
    }
  }, [clients]);

  const addClient = async (data: Partial<ClientModel> & { name: string }): Promise<ClientModel> => {
    const clientId = `client-${Date.now()}`;
    const initials = data.name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newClient: ClientModel = {
      id: clientId,
      userId: user?.uid || 'demo-therapist',
      name: data.name.trim(),
      phone: data.phone?.trim() || '',
      email: data.email?.trim() || '',
      age: data.age?.trim() || '',
      protocol: data.protocol?.trim() || 'Protocolo Bioenergético Personalizado',
      notes: data.notes?.trim() || '',
      status: 'active',
      sessionCount: 0,
      averageScore: 0,
      initials,
      avatarUrl: data.avatarUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!user && isDemo && import.meta.env.DEV) {
      const updated = [newClient, ...clients];
      setClients(updated);
      localStorage.setItem('chakra_flow_clients', JSON.stringify(updated));
      return newClient;
    }

    try {
      await setDoc(doc(db, 'clients', clientId), newClient);
      return newClient;
    } catch (err) {
      setNetworkNotice(
        'Sem conexão no momento. As informações foram retidas no formulário para você reenviar assim que a rede restabelecer.'
      );
      handleFirestoreError(err, OperationType.CREATE, `clients/${clientId}`);
    }
  };

  const updateClient = async (id: string, updates: Partial<ClientModel>): Promise<void> => {
    const updatedData: Partial<ClientModel> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (!user && isDemo && import.meta.env.DEV) {
      const updatedList = clients.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
      setClients(updatedList);
      localStorage.setItem('chakra_flow_clients', JSON.stringify(updatedList));
      return;
    }

    try {
      await setDoc(doc(db, 'clients', id), updatedData, { merge: true });
    } catch (err) {
      setNetworkNotice(
        'Sem conexão no momento. Não foi possível sincronizar as alterações com o servidor.'
      );
      handleFirestoreError(err, OperationType.UPDATE, `clients/${id}`);
    }
  };

  /**
   * Cascading Delete: Deletes the client document AND all associated sessions
   * using a Firestore WriteBatch to guarantee atomic consistency.
   */
  const deleteClient = async (id: string): Promise<void> => {
    if (!user && isDemo && import.meta.env.DEV) {
      const remainingClients = clients.filter((c) => c.id !== id);
      const remainingSessions = sessions.filter((s) => s.clientId !== id);
      setClients(remainingClients);
      setSessions(remainingSessions);
      localStorage.setItem('chakra_flow_clients', JSON.stringify(remainingClients));
      localStorage.setItem('chakra_flow_sessions', JSON.stringify(remainingSessions));
      if (selectedClient?.id === id) setSelectedClient(null);
      if (selectedSession?.clientId === id) setSelectedSession(null);
      return;
    }

    if (!user) return;

    try {
      const batch = writeBatch(db);

      // 1. Find all sessions for this client
      const sessionsRef = collection(db, 'sessions');
      const qSessions = query(
        sessionsRef,
        where('userId', '==', user.uid),
        where('clientId', '==', id)
      );
      const sessionsSnap = await getDocs(qSessions);

      // 2. Add each session delete to batch
      sessionsSnap.forEach((sDoc) => {
        batch.delete(sDoc.ref);
      });

      // 3. Add client doc delete to batch
      const clientRef = doc(db, 'clients', id);
      batch.delete(clientRef);

      // 4. Commit atomic batch
      await batch.commit();

      if (selectedClient?.id === id) setSelectedClient(null);
      if (selectedSession?.clientId === id) setSelectedSession(null);
    } catch (err) {
      setNetworkNotice(
        'Sem conexão no momento. Não foi possível excluir o interagente e suas sessões associadas.'
      );
      handleFirestoreError(err, OperationType.DELETE, `clients/${id}`);
    }
  };

  const addSession = async (
    data: Omit<SessionModel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<SessionModel> => {
    const sessionId = `session-${Date.now()}`;
    const overallScore = calculateOverallScore(data.scores);
    const attentionCount = countAttentionNeeded(data.scores);

    const newSession: SessionModel = {
      ...data,
      id: sessionId,
      userId: user?.uid || 'demo-therapist',
      overallScore,
      attentionCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Find previous session for this client to store comparison if available
    const clientSessions = sessions.filter((s) => s.clientId === data.clientId);
    if (clientSessions.length > 0 && !newSession.previousSessionScores) {
      newSession.previousSessionScores = clientSessions[0].scores;
    }

    if (!user && isDemo && import.meta.env.DEV) {
      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      localStorage.setItem('chakra_flow_sessions', JSON.stringify(updatedSessions));

      const client = clients.find((c) => c.id === data.clientId);
      if (client) {
        const newCount = (client.sessionCount || 0) + 1;
        const newAvg = Math.round(
          ((client.averageScore || 0) * (client.sessionCount || 0) + overallScore) / newCount
        );
        const updatedClients = clients.map((c) =>
          c.id === data.clientId
            ? {
                ...c,
                sessionCount: newCount,
                averageScore: newAvg,
                lastSessionDate: data.sessionDate,
                status: attentionCount > 0 ? ('attention' as const) : ('active' as const),
              }
            : c
        );
        setClients(updatedClients);
        localStorage.setItem('chakra_flow_clients', JSON.stringify(updatedClients));
      }
      return newSession;
    }

    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

    try {
      // Transaction saving session and updating client
      await runTransaction(db, async (transaction) => {
        const sessionRef = doc(db, 'sessions', sessionId);
        const clientRef = doc(db, 'clients', data.clientId);
        const clientDoc = await transaction.get(clientRef);

        transaction.set(sessionRef, newSession);

        if (clientDoc.exists()) {
          const clientData = clientDoc.data() as ClientModel;
          const newCount = (clientData.sessionCount || 0) + 1;
          const currentAvg = clientData.averageScore || overallScore;
          const newAvg = Math.round((currentAvg * (newCount - 1) + overallScore) / newCount);

          transaction.update(clientRef, {
            sessionCount: newCount,
            averageScore: newAvg,
            lastSessionDate: data.sessionDate,
            status: attentionCount > 0 ? 'attention' : 'active',
            updatedAt: new Date().toISOString(),
          });
        }
      });

      return newSession;
    } catch (err) {
      setNetworkNotice(
        'Sem conexão no momento. Os dados do atendimento foram retidos para reenvio assim que a rede restabelecer.'
      );
      handleFirestoreError(err, OperationType.WRITE, `sessions/${sessionId}`);
    }
  };

  const getClientSessions = (clientId: string): SessionModel[] => {
    return sessions
      .filter((s) => s.clientId === clientId)
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        sessions,
        loading,
        networkNotice,
        clearNetworkNotice,
        selectedClient,
        setSelectedClient,
        selectedSession,
        setSelectedSession,
        addClient,
        updateClient,
        deleteClient,
        addSession,
        getClientSessions,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
