/**
 * MUNDO DELIS · Login Page Logic
 * Archivo: js/login.js
 */

const SUPABASE_URL  = window.SUPABASE_URL;
const SUPABASE_ANON = window.SUPABASE_ANON;

// Código secreto para crear cuentas admin (cámbialo por uno tuyo)
const ADMIN_ACTIVATION_CODE = 'DELIS2026ADMIN';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Si ya hay sesión activa, ir directo al admin ──
(async () => {
  const { data: { user } } = await sb.auth.getUser();
  if (user) {
    const rol = user.app_metadata?.rol || user.user_metadata?.rol;
    if (rol === 'ADMIN') window.location.href = '/admin';
  }
})();

// ── TABS ──
function showTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('form-login').style.display    = isLogin ? 'block' : 'none';
  document.getElementById('form-register').style.display = isLogin ? 'none'  : 'block';
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  hideMsg();
}

// ── LOGIN CON EMAIL ──
async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pwd   = document.getElementById('login-pwd').value;
  if (!email || !pwd) { showMsg('Completa todos los campos', 'error'); return; }

  setLoading('btn-login', true);
  showMsg('Verificando credenciales…', 'loading');

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pwd });

  if (error) {
    showMsg('Correo o contraseña incorrectos', 'error');
    setLoading('btn-login', false);
    return;
  }

  const rol = data.user.app_metadata?.rol || data.user.user_metadata?.rol;
  if (rol !== 'ADMIN') {
    await sb.auth.signOut();
    showMsg('Esta cuenta no tiene acceso al panel de administración', 'error');
    setLoading('btn-login', false);
    return;
  }

  showMsg('¡Bienvenida! Redirigiendo…', 'success');
  setTimeout(() => { window.location.href = '/admin'; }, 800);
}

// ── LOGIN CON GOOGLE ──
async function doGoogle() {
  showMsg('Redirigiendo a Google…', 'loading');
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.SITE_URL + '/admin' }
  });
  if (error) showMsg('Error al conectar con Google: ' + error.message, 'error');
}

// ── REGISTRO (primer admin) ──
async function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pwd   = document.getElementById('reg-pwd').value;
  const code  = document.getElementById('reg-code').value.trim();

  if (!name || !email || !pwd || !code) { showMsg('Completa todos los campos', 'error'); return; }
  if (pwd.length < 8) { showMsg('La contraseña debe tener mínimo 8 caracteres', 'error'); return; }
  if (code !== ADMIN_ACTIVATION_CODE) { showMsg('Código de activación incorrecto', 'error'); return; }

  setLoading('btn-register', true);
  showMsg('Creando cuenta…', 'loading');

  const { data, error } = await sb.auth.signUp({
    email,
    password: pwd,
    options: { data: { nombre: name, rol: 'ADMIN' } }
  });

  if (error) {
    showMsg('Error: ' + error.message, 'error');
    setLoading('btn-register', false);
    return;
  }

  if (data.user && !data.session) {
    showMsg('✅ Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.', 'success');
  } else if (data.session) {
    showMsg('¡Cuenta creada! Redirigiendo…', 'success');
    setTimeout(() => { window.location.href = '/admin'; }, 800);
  }
  setLoading('btn-register', false);
}

// ── HELPERS UI ──
function showMsg(text, type) {
  const el = document.getElementById('msg');
  el.textContent = text;
  el.className = `msg ${type}`;
}
function hideMsg() { document.getElementById('msg').className = 'msg'; }

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
  if (loading) {
    btn.innerHTML = '<div class="spinner"></div>';
  } else {
    const isLogin = btnId === 'btn-login';
    btn.innerHTML = isLogin
      ? '<i class="ti ti-login"></i> Ingresar'
      : '<i class="ti ti-user-plus"></i> Crear cuenta admin';
  }
}

// Enter para login
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const activeForm = document.getElementById('form-login').style.display !== 'none' ? 'login' : 'register';
    if (activeForm === 'login') doLogin();
    else                        doRegister();
  }
});
