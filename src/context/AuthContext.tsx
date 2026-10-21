import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  auth,
  db,
  loginWithGoogle as fbLoginGoogle,
  loginWithEmail as fbLoginEmail,
  registerWithEmail as fbRegisterEmail,
  logoutTherapist,
} from '../services/firebase';
import { PractitionerProfile } from '../types';
import { DEFAULT_REPORT_TEXTS } from '../data/reportTexts';

interface AuthContextType {
  user: User | null;
  profile: PractitionerProfile | null;
  loading: boolean;
  isDemo: boolean;
  loginGoogle: () => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginDemo?: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<PractitionerProfile>) => Promise<void>;
}

export const DEFAULT_PROFILE: Omit<PractitionerProfile, 'id' | 'userId'> = {
  marcaCompleta: 'Lunara Terapias',
  marcaCurta: 'LUNARA',
  brandName: 'Lunara Terapias',
  name: 'Celso Luiz',
  title: 'Psicoterapeuta Holístico',
  tituloProfissional: 'Psicoterapeuta Holístico',
  phone: '+55(16)99793-4558',
  email: 'celbiffe@gmail.com',
  website: 'lunara-terapias-site.netlify.app',
  address: 'Atendimento Presencial e Online',
  logoUrl:
    'https://lh3.googleusercontent.com/aida/AEtjO1WOsx4_sGUcyvNqO56n_4xIwpNKYvFYILJdKzh9S4yO5j-WdtTkDFm0DNMt5fQ7xzTadSn2eXgEoH7SILbNjS4gzKGjBEkeTKwDuNjv0hbF-yN6LLPftNU75xOmqGmjnT-INwlZMIzMcS3mN_fh2dvD04LhH-TH21kcvv58ispOOb4MK7nFF71joNwTdleERuRDAr1NcqfD1j6K_QvvrFEhCe08zhEONkZl7hVCsoJiZAKilT3Ms5qsmtE',
  openingStatement: DEFAULT_REPORT_TEXTS.openingStatement,
  generalGuidance: DEFAULT_REPORT_TEXTS.generalGuidance,
  analiseIntegrada: DEFAULT_REPORT_TEXTS.integratedAnalysis,
  importanciaEquilibrio: DEFAULT_REPORT_TEXTS.importanceOfBalance,
  signatureText: 'Celso Luiz — Psicoterapeuta Holístico',
  rangeSummaries: {
    baixa:
      'Dispersão acentuada de energia vital. Demanda atenção prioritária e reorganização de práticas de descanso e ancoragem.',
    media:
      'Vórtice em oscilação ou desacoplamento moderado. Recomenda-se harmonização pontual para sustentar o fluxo.',
    equilibrio:
      'Homeostase dinâmica e vitalidade plena. O centro opera em fluidez coerente com os demais centros.',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PractitionerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Only allow demo fallback in DEV mode
    if (import.meta.env.DEV) {
      const savedDemo = localStorage.getItem('chakra_flow_demo_session');
      if (savedDemo === 'true') {
        setIsDemo(true);
        const savedProfile = localStorage.getItem('chakra_flow_practitioner_profile');
        if (savedProfile) {
          try {
            setProfile(JSON.parse(savedProfile));
          } catch {
            setProfile({ id: 'demo-therapist', userId: 'demo-therapist', ...DEFAULT_PROFILE });
          }
        } else {
          setProfile({ id: 'demo-therapist', userId: 'demo-therapist', ...DEFAULT_PROFILE });
        }
        setLoading(false);
        return;
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profileRef = doc(db, 'practitioners', firebaseUser.uid);
          const snap = await getDoc(profileRef);
          if (snap.exists()) {
            setProfile(snap.data() as PractitionerProfile);
          } else {
            // First time login - seed initial profile for the authenticated therapist
            const initial: PractitionerProfile = {
              id: firebaseUser.uid,
              userId: firebaseUser.uid,
              ...DEFAULT_PROFILE,
              name: firebaseUser.displayName || DEFAULT_PROFILE.name,
              email: firebaseUser.email || DEFAULT_PROFILE.email,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(profileRef, initial);
            setProfile(initial);
          }
        } catch (err) {
          console.error('Error fetching practitioner profile:', err);
          setProfile({
            id: firebaseUser.uid,
            userId: firebaseUser.uid,
            ...DEFAULT_PROFILE,
            name: firebaseUser.displayName || DEFAULT_PROFILE.name,
            email: firebaseUser.email || DEFAULT_PROFILE.email,
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginGoogle = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('chakra_flow_demo_session');
      setIsDemo(false);
      await fbLoginGoogle();
    } finally {
      setLoading(false);
    }
  };

  const loginEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      localStorage.removeItem('chakra_flow_demo_session');
      setIsDemo(false);
      await fbLoginEmail(email, pass);
    } finally {
      setLoading(false);
    }
  };

  const registerEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      localStorage.removeItem('chakra_flow_demo_session');
      setIsDemo(false);
      const newUser = await fbRegisterEmail(email, pass);
      const newProfile: PractitionerProfile = {
        id: newUser.uid,
        userId: newUser.uid,
        ...DEFAULT_PROFILE,
        name: name || DEFAULT_PROFILE.name,
        email: email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'practitioners', newUser.uid), newProfile);
      setProfile(newProfile);
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = () => {
    if (!import.meta.env.DEV) return;
    setIsDemo(true);
    localStorage.setItem('chakra_flow_demo_session', 'true');
    const demoProf: PractitionerProfile = {
      id: 'demo-therapist',
      userId: 'demo-therapist',
      ...DEFAULT_PROFILE,
    };
    setProfile(demoProf);
    localStorage.setItem('chakra_flow_practitioner_profile', JSON.stringify(demoProf));
  };

  const logout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('chakra_flow_demo_session');
      setIsDemo(false);
      setUser(null);
      setProfile(null);
      await logoutTherapist();
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<PractitionerProfile>) => {
    if (!profile) return;
    const updated: PractitionerProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);

    if (isDemo && import.meta.env.DEV) {
      localStorage.setItem('chakra_flow_practitioner_profile', JSON.stringify(updated));
      return;
    }

    if (user) {
      await setDoc(doc(db, 'practitioners', user.uid), updated, { merge: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemo,
        loginGoogle,
        loginEmail,
        registerEmail,
        loginDemo: import.meta.env.DEV ? loginDemo : undefined,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
