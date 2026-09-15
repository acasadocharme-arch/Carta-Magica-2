import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Extração robusta das variáveis públicas configuradas para o Supabase no frontend
const rawSupabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.SUPABASE_URL) ||
  "";

const rawSupabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.SUPABASE_ANON_KEY) ||
  "";

export const isSupabaseConfigured = Boolean(
  rawSupabaseUrl &&
  rawSupabaseAnonKey &&
  !rawSupabaseUrl.includes("placeholder")
);

// Fallback seguro caso as chaves ainda não tenham sido inseridas no ambiente
const fallbackUrl = rawSupabaseUrl || "https://cartamagica.supabase.co";
const fallbackKey = rawSupabaseAnonKey || "sb-anon-key-placeholder";

export const supabase: SupabaseClient = createClient(fallbackUrl, fallbackKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Garante que exista uma sessão de usuário autenticada no Supabase (JWT válido).
 * Se o usuário não estiver logado, cria uma sessão anônima segura para gerar o auth.uid().
 */
export async function getOrEnsureAuthToken(): Promise<{ token: string | null; userId: string | null }> {
  if (!isSupabaseConfigured) {
    return { token: null, userId: null };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.access_token) {
      return {
        token: sessionData.session.access_token,
        userId: sessionData.session.user.id,
      };
    }

    // Tentar login anônimo caso não haja sessão ativa
    const { data: anonData, error: anonErr } = await supabase.auth.signInAnonymously();
    if (!anonErr && anonData?.session?.access_token) {
      return {
        token: anonData.session.access_token,
        userId: anonData.session.user.id,
      };
    }

    // Fallback: tentar obter usuário atual
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id) {
      return { token: sessionData?.session?.access_token || null, userId: userData.user.id };
    }
  } catch (err) {
    console.warn("[supabase] Aviso ao recuperar sessão:", err);
  }

  return { token: null, userId: null };
}
