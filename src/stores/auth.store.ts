import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// ATENÇÃO: Sistema de autenticação híbrido.
// 1) Primeiro tenta autenticar com usuários fixos salvos em localStorage (modo mock/dev).
// 2) Se não encontrar, tenta autenticação real via Supabase (signInWithPassword).
// Revisar antes de ir para produção: usuários locais não existem na tabela de usuários 
// do Supabase e podem causar erros em queries que dependem de user.id real.

interface LocalUser {
  email: string;
  password: string;
  full_name?: string;
  role?: 'admin' | 'user';
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  const storageKey = 'vaultpos-users';
  const sessionKey = 'vaultpos-session';
  const defaultUsers: LocalUser[] = [
    {
      email: 'admin@vaultpos.com',
      password: 'admin123',
      full_name: 'Administrador',
      role: 'admin',
    },
    {
      email: 'usuario@vaultpos.com',
      password: 'user123',
      full_name: 'Usuário Padrão',
      role: 'user',
    },
  ];

  function ensureDefaultUsers() {
    const existingUsers = getStoredUsers();
    const mergedUsers = [...defaultUsers];

    existingUsers.forEach((user) => {
      if (!mergedUsers.some((item) => item.email === user.email)) {
        mergedUsers.push(user);
      }
    });

    saveUsers(mergedUsers);
  }

  function getStoredUsers(): LocalUser[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  }

  function saveUsers(users: LocalUser[]) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(users));
    }
  }

  function persistSession(nextSession: Session | null, nextUser: User | null) {
    if (typeof window === 'undefined') {
      return;
    }

    session.value = nextSession;
    user.value = nextUser;

    if (nextSession && nextUser) {
      window.localStorage.setItem(sessionKey, JSON.stringify({ user: nextUser, session: nextSession }));
    } else {
      window.localStorage.removeItem(sessionKey);
    }
  }

  // Getters
  const isAuthenticated = computed(() => !!session.value);
  const userId = computed(() => user.value?.id ?? null);
  const userEmail = computed(() => user.value?.email ?? null);
  const userRole = computed(() => {
    const metadataRole = (user.value as any)?.user_metadata?.role;
    return metadataRole || 'user';
  });
  const isAdmin = computed(() => userRole.value === 'admin' || userEmail.value === 'admin@vaultpos.com');

  // Inicializa sessão ao carregar o app
  async function init() {
    if (initialized.value) {
      return;
    }

    ensureDefaultUsers();

    if (typeof window !== 'undefined') {
      const savedSession = window.localStorage.getItem(sessionKey);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        session.value = parsed.session;
        user.value = parsed.user;
      }
    }

    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        persistSession(data.session, data.session.user);
      }
    } catch (error) {
      console.error('Erro ao buscar sessão do Supabase:', error);
    }

    supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        persistSession(newSession, newSession.user);
        return;
      }

      // Nao sobrescreve uma sessao local (mock) com o estado "sem sessao" do Supabase real.
      // Contas mock nunca existem de verdade no Supabase, entao o listener sempre reporta null.
      const isLocalSession = session.value?.access_token === 'local-token';
      if (isLocalSession) {
        return;
      }

      persistSession(null, null);
    });

    initialized.value = true;
  }

  // Login
  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      ensureDefaultUsers();
      const normalizedEmail = email.trim().toLowerCase();
      const localUsers = getStoredUsers();
      const localUser = localUsers.find((item) => item.email === normalizedEmail && item.password === password);

      if (localUser) {
        const localSession = {
          access_token: 'local-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          user: {
            id: `local-${normalizedEmail}`,
            email: normalizedEmail,
            user_metadata: { full_name: localUser.full_name || normalizedEmail, role: localUser.role || 'user' },
          },
        } as unknown as Session;

        persistSession(localSession, localSession.user as User);
        return;
      }

      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) throw err;
      persistSession(data.session, data.user);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(email: string, password: string, metadata?: Record<string, unknown>) {
    loading.value = true;
    error.value = null;
    try {
      ensureDefaultUsers();
      const normalizedEmail = email.trim().toLowerCase();
      const existingUsers = getStoredUsers();
      const alreadyExists = existingUsers.some((item) => item.email === normalizedEmail);

      if (alreadyExists) {
        throw new Error('Este e-mail já está cadastrado.');
      }

      const nextUsers: LocalUser[] = [
        ...existingUsers,
        {
          email: normalizedEmail,
          password,
          full_name: metadata?.full_name as string | undefined,
          role: 'user',
        },
      ];
      saveUsers(nextUsers);

      const localSession = {
        access_token: 'local-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        user: {
          id: `local-${normalizedEmail}`,
          email: normalizedEmail,
          user_metadata: { ...(metadata ?? {}), role: 'user' },
        },
      } as unknown as Session;

      persistSession(localSession, localSession.user as User);

      try {
        const { data, error: err } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { data: metadata },
        });
        if (err) {
          console.warn('Supabase signUp falhou, mas o cadastro local foi salvo:', err.message);
          return { session: null, user: null };
        }
        return data;
      } catch (supabaseError) {
        console.warn('Supabase signUp falhou, mas o cadastro local foi salvo:', supabaseError);
        return { session: null, user: null };
      }
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Logout
  async function logout() {
    loading.value = true;
    error.value = null;
    try {
      try {
        const { error: err } = await supabase.auth.signOut();
        if (err) throw err;
      } catch (supabaseError) {
        console.warn('Erro ao encerrar sessão no Supabase:', supabaseError);
      }

      persistSession(null, null);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Recuperar senha
  async function forgotPassword(email: string) {
    loading.value = true;
    error.value = null;
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email);
      if (err) throw err;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    user,
    session,
    loading,
    error,
    initialized,
    // Getters
    isAuthenticated,
    userId,
    userEmail,
    userRole,
    isAdmin,
    // Actions
    init,
    login,
    register,
    logout,
    forgotPassword,
  };
});
