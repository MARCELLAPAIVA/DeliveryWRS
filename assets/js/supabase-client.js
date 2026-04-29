// =====================================================================
// supabase-client.js — Inicialização compartilhada do Supabase
// =====================================================================
// Suas chaves (lldywimvdfqjqcqqkuvp). Estão expostas no front porque
// é a anon key (pública, segura quando RLS está bem configurado).
// =====================================================================
const SUPABASE_URL = 'https://lldywimvdfqjqcqqkuvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZHl3aW12ZGZxanFjcXFrdXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNTI1MjAsImV4cCI6MjA5MjgyODUyMH0.Ry8nyJdMWH4mU6H5m19ybbOtBtpLPznEjpI_W6MFgVI';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

// ---------- Utilidades ----------
const fmtBRL = v => 'R$ ' + Number(v||0).toFixed(2).replace('.', ',');

function toast(msg, type='') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div'); el.id = 'toast';
    el.className = 'toast'; document.body.appendChild(el);
  }
  el.className = 'toast ' + type;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2800);
}

async function getCurrentUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  const { data } = await sb.from('user_roles').select('role').eq('user_id', user.id).eq('role','admin').maybeSingle();
  return !!data;
}
