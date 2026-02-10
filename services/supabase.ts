
import { createClient } from '@supabase/supabase-js';

// As variáveis podem vir do ambiente ou das credenciais fornecidas diretamente
const supabaseUrl = process.env.SUPABASE_URL || 'https://rlqvrorlxkjvkekcckuz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_kxgF0Fa_U_FRqQrUuYSnBg_UM_hEvDQ';

// Loga um aviso se as chaves ainda forem as de placeholder (embora agora tenhamos chaves reais)
if (supabaseUrl.includes('placeholder')) {
  console.warn(
    "Configuração do Supabase pendente. Verifique se as chaves foram injetadas corretamente."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
