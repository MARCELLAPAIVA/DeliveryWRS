// =====================================================================
// loja.js — Lógica da loja (cliente)
// =====================================================================

const state = {
  user: null,
  profile: null,
  categories: [],
  products: [],
  zones: [],
  settings: {},
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  filterCategory: null,
  search: '',
  pay: 'pix',
};

// ---------- INIT ----------
window.addEventListener('DOMContentLoaded', async () => {
  bindUI();
  await loadSettings();
  await loadCategories();
  await loadProducts();
  await loadZones();
  await refreshAuth();
  renderAll();
});

sb.auth.onAuthStateChange(async (_e, _session) => {
  await refreshAuth();
  renderHeader();
});

async function refreshAuth() {
  state.user = await getCurrentUser();
  if (state.user) {
    const { data } = await sb.from('profiles').select('*').eq('id', state.user.id).maybeSingle();
    state.profile = data;
  } else { state.profile = null; }
}

// ---------- LOADERS ----------
async function loadSettings() {
  const { data } = await sb.from('settings').select('*');
  (data||[]).forEach(r => state.settings[r.key] = r.value);
}
async function loadCategories() {
  const { data } = await sb.from('categories').select('*').eq('active', true).order('sort_order');
  state.categories = data || [];
}
async function loadProducts() {
  const { data } = await sb.from('products').select('*').eq('active', true).order('name');
  state.products = data || [];
}
async function loadZones() {
  const { data } = await sb.from('delivery_zones').select('*').eq('active', true).order('bairro');
  state.zones = data || [];
}

// ---------- RENDER ----------
function renderAll() { renderHeader(); renderStatusBar(); renderCategories(); renderProducts(); renderCartBadge(); }

function renderHeader() {
  const nameEl = document.getElementById('store-name');
  const storeName = state.settings.nome_loja || 'Royal Salute';
  if (nameEl) nameEl.textContent = storeName;
  const mark = document.getElementById('logo-mark');
  if (mark) {
    if (state.settings.logo_url) {
      mark.innerHTML = `<img src="${state.settings.logo_url}" alt="logo" style="width:100%;height:100%;object-fit:cover">`;
    } else {
      // Iniciais (até 2 letras) das primeiras palavras
      const parts = storeName.trim().split(/\s+/);
      const initials = (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
      mark.textContent = initials;
    }
  }
}

function renderStatusBar() {
  const isOpen = state.settings.loja_aberta !== false && state.settings.loja_aberta !== 'false';
  const st = document.getElementById('store-status');
  if (st) st.textContent = isOpen ? 'Online' : 'Offline';
  const min = document.getElementById('store-min');
  if (min) {
    const v = parseFloat(state.settings.pedido_minimo || 0);
    min.textContent = v > 0 ? `Pedido mínimo ${fmtBRL(v)}` : 'Sem pedido mínimo';
  }
}

function renderCategories() {
  const tabs = document.getElementById('cat-tabs');
  if (!tabs) return;
  const all = `<button class="cat-tab ${!state.filterCategory ? 'active':''}" onclick="filterByCategory(null)">Todos</button>`;
  const items = state.categories.map(c => `
    <button class="cat-tab ${state.filterCategory===c.id ? 'active':''}" onclick="filterByCategory('${c.id}')">${c.name}</button>
  `).join('');
  tabs.innerHTML = all + items;
}

function renderProducts() {
  const wrap = document.getElementById('prod-wrap');
  if (!wrap) return;
  let list = state.products;
  if (state.filterCategory) list = list.filter(p => p.category_id === state.filterCategory);
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description||'').toLowerCase().includes(q)
    );
  }
  if (!list.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="emoji">🔍</div><p>Nenhum produto encontrado.</p></div>`;
    return;
  }
  // Agrupar por categoria
  const byCat = new Map();
  list.forEach(p => {
    const c = state.categories.find(c => c.id === p.category_id);
    const key = c ? c.name : 'Outros';
    if (!byCat.has(key)) byCat.set(key, []);
    byCat.get(key).push(p);
  });

  // Ordem: respeita ordem das categorias do banco
  const ordered = [];
  state.categories.forEach(c => { if (byCat.has(c.name)) ordered.push(c.name); });
  if (byCat.has('Outros')) ordered.push('Outros');

  wrap.innerHTML = ordered.map(name => `
    <section class="section">
      <h2 class="section-title">${name}</h2>
      <div class="prod-list">
        ${byCat.get(name).map(p => prodCard(p)).join('')}
      </div>
    </section>
  `).join('');
}

function prodCard(p) {
  const desc = p.description ? `<div class="desc">${escapeHtml(p.description)}</div>` : '';
  const img = p.image_url
    ? `<img src="${p.image_url}" alt="${escapeHtml(p.name)}" loading="lazy">`
    : `<span aria-hidden="true">🍾</span>`;
  return `
    <article class="prod-row" onclick="addToCart('${p.id}')">
      <div class="info">
        <div class="name">${escapeHtml(p.name)}</div>
        ${desc}
        <div class="price">${fmtBRL(p.price)}</div>
      </div>
      <div class="thumb">
        ${img}
        <button class="add-btn" onclick="event.stopPropagation();addToCart('${p.id}')" aria-label="Adicionar">+</button>
      </div>
    </article>`;
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function toast(msg){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove('show'), 1800);
}

function renderCartBadge() {
  const qty = state.cart.reduce((s,i) => s + i.qty, 0);
  const b = document.getElementById('cart-badge');
  if (b) { b.textContent = qty; b.style.display = qty ? 'grid' : 'none'; }
}

// ---------- FILTROS ----------
function filterByCategory(id) {
  state.filterCategory = id || null;
  renderCategories();
  renderProducts();
  document.getElementById('produtos')?.scrollIntoView({behavior:'smooth', block:'start'});
}
function clearFilter() { state.filterCategory = null; state.search=''; renderCategories(); renderProducts(); }
function onSearch(v) { state.search = v; renderProducts(); }

// ---------- CARRINHO ----------
function addToCart(productId) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;
  const item = state.cart.find(i => i.id === productId);
  if (item) item.qty++;
  else state.cart.push({ id:p.id, name:p.name, price:Number(p.price), image_url:p.image_url, qty:1 });
  saveCart(); renderCart(); renderCartBadge();
  toast('Adicionado ao carrinho ✓','success');
}
function changeQty(id, delta) {
  const item = state.cart.find(i => i.id === id); if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
  saveCart(); renderCart(); renderCartBadge();
}
function removeItem(id) { state.cart = state.cart.filter(i => i.id !== id); saveCart(); renderCart(); renderCartBadge(); }
function saveCart() { localStorage.setItem('cart', JSON.stringify(state.cart)); }
function cartSubtotal() { return state.cart.reduce((s,i) => s + i.price * i.qty, 0); }
function selectedZoneTaxa() {
  const sel = document.getElementById('co-bairro');
  if (!sel) return 0;
  const z = state.zones.find(z => z.bairro === sel.value);
  return z ? Number(z.taxa) : 0;
}

function renderCart() {
  const body = document.getElementById('drawer-body');
  const foot = document.getElementById('drawer-foot');
  if (!body) return;
  if (!state.cart.length) {
    body.innerHTML = `<div class="empty-state"><div class="emoji">🛒</div><p>Seu carrinho está vazio</p></div>`;
    foot.innerHTML = '';
    return;
  }
  body.innerHTML = state.cart.map(i => `
    <div class="cart-item">
      <div class="cart-thumb">${i.image_url ? `<img src="${i.image_url}">` : '🍾'}</div>
      <div class="cart-info">
        <div class="cart-name">${i.name}</div>
        <div class="cart-price">${fmtBRL(i.price)}</div>
        <div class="qty-ctl">
          <button class="qty-btn" onclick="changeQty('${i.id}',-1)">−</button>
          <span class="qty-num">${i.qty}</span>
          <button class="qty-btn" onclick="changeQty('${i.id}',1)">+</button>
          <button class="qty-btn" onclick="removeItem('${i.id}')" title="Remover" style="color:var(--danger)">×</button>
        </div>
      </div>
      <div style="font-weight:700">${fmtBRL(i.price*i.qty)}</div>
    </div>
  `).join('');
  foot.innerHTML = `
    <div class="cart-summary">
      <div><span>Subtotal</span><span>${fmtBRL(cartSubtotal())}</span></div>
    </div>
    <button class="btn btn-primary btn-block" onclick="openCheckout()">Continuar →</button>`;
}

// ---------- DRAWER ----------
function openCart() { renderCart(); document.getElementById('drawer').classList.add('open'); document.getElementById('drawer-overlay').classList.add('open'); }
function closeDrawer() { document.getElementById('drawer').classList.remove('open'); document.getElementById('drawer-overlay').classList.remove('open'); }

// ---------- CHECKOUT ----------
function openCheckout() {
  if (!state.user) { closeDrawer(); openAuth(); toast('Faça login para continuar','error'); return; }
  if (!state.cart.length) return;
  renderCheckout();
}

function renderCheckout() {
  const body = document.getElementById('drawer-body');
  const foot = document.getElementById('drawer-foot');
  state.pay = 'pix';
  body.innerHTML = `
    <h3 style="margin-bottom:14px">Endereço de entrega</h3>
    <div class="field"><label>Nome</label>
      <input id="co-nome" value="${state.profile?.nome||''}"></div>
    <div class="field"><label>Telefone</label>
      <input id="co-tel" value="${state.profile?.telefone||''}" placeholder="(21) 99999-9999"></div>
    <div class="field"><label>Endereço</label>
      <input id="co-end" value="${state.profile?.endereco||''}" placeholder="Rua, número"></div>
    <div class="field-row">
      <div class="field"><label>Bairro</label>
        <select id="co-bairro" onchange="updateCheckoutTotals()">
          <option value="">Selecione</option>
          ${state.zones.map(z => `<option value="${z.bairro}" ${state.profile?.bairro===z.bairro?'selected':''}>${z.bairro} (${fmtBRL(z.taxa)})</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Complemento</label>
        <input id="co-comp" value="${state.profile?.complemento||''}" placeholder="Apt, bloco..."></div>
    </div>

    <h3 style="margin:20px 0 14px">Forma de pagamento</h3>
    <div class="pay-options">
      <div class="pay-opt active" data-pay="pix" onclick="setPay('pix')">📱 PIX</div>
      <div class="pay-opt" data-pay="dinheiro" onclick="setPay('dinheiro')">💵 Dinheiro</div>
      <div class="pay-opt" data-pay="cartao" onclick="setPay('cartao')">💳 Cartão</div>
    </div>
    <div id="troco-field" class="field hidden" style="margin-top:14px">
      <label>Precisa de troco para quanto?</label>
      <input id="co-troco" type="number" step="0.01" placeholder="Ex: 100.00">
    </div>
    <div class="field" style="margin-top:14px">
      <label>Observações</label>
      <textarea id="co-obs" rows="2" placeholder="Sem cebola, gelo extra..."></textarea>
    </div>
  `;
  updateCheckoutTotals();
  if (state.profile?.bairro) document.getElementById('co-bairro').value = state.profile.bairro;
  updateCheckoutTotals();
}

function setPay(p) {
  state.pay = p;
  document.querySelectorAll('.pay-opt').forEach(el => el.classList.toggle('active', el.dataset.pay === p));
  document.getElementById('troco-field').classList.toggle('hidden', p !== 'dinheiro');
}

function updateCheckoutTotals() {
  const subtotal = cartSubtotal();
  const taxa = selectedZoneTaxa();
  const total = subtotal + taxa;
  const foot = document.getElementById('drawer-foot');
  foot.innerHTML = `
    <div class="cart-summary">
      <div><span>Subtotal</span><span>${fmtBRL(subtotal)}</span></div>
      <div><span>Taxa de entrega</span><span>${fmtBRL(taxa)}</span></div>
      <div class="total"><span>Total</span><span>${fmtBRL(total)}</span></div>
    </div>
    <button class="btn btn-secondary btn-block" style="margin-bottom:8px" onclick="renderCart()">← Voltar</button>
    <button class="btn btn-primary btn-block" onclick="confirmOrder()">Finalizar Pedido</button>
  `;
}

async function confirmOrder() {
  const nome   = document.getElementById('co-nome').value.trim();
  const tel    = document.getElementById('co-tel').value.trim();
  const end    = document.getElementById('co-end').value.trim();
  const bairro = document.getElementById('co-bairro').value;
  const comp   = document.getElementById('co-comp').value.trim();
  const obs    = document.getElementById('co-obs').value.trim();
  const troco  = state.pay==='dinheiro' ? Number(document.getElementById('co-troco').value||0) : null;

  if (!nome || !tel || !end || !bairro) { toast('Preencha todos os campos obrigatórios','error'); return; }

  const subtotal = cartSubtotal();
  const taxa = selectedZoneTaxa();
  const total = subtotal + taxa;

  // Salva profile
  await sb.from('profiles').upsert({ id: state.user.id, nome, telefone: tel, endereco: end, bairro, complemento: comp });

  // Cria order
  const { data: order, error } = await sb.from('orders').insert({
    user_id: state.user.id,
    cliente_nome: nome, telefone: tel, endereco: end, bairro, complemento: comp,
    pagamento: state.pay, troco_para: troco, observacoes: obs,
    subtotal, taxa_entrega: taxa, total, status: 'novo'
  }).select().single();

  if (error) { console.error(error); toast('Erro ao criar pedido: '+error.message,'error'); return; }

  // Itens
  const items = state.cart.map(i => ({
    order_id: order.id, product_id: i.id, product_name: i.name,
    unit_price: i.price, quantity: i.qty, subtotal: i.price * i.qty
  }));
  const { error: itErr } = await sb.from('order_items').insert(items);
  if (itErr) { console.error(itErr); toast('Erro nos itens: '+itErr.message,'error'); return; }

  // Limpa carrinho e mostra sucesso
  const orderForWA = { ...order, items: state.cart };
  state.cart = []; saveCart(); renderCartBadge();
  showSuccess(orderForWA);
}

function showSuccess(order) {
  const wa = state.settings.whatsapp || '5521985529198';
  const lines = [
    `*🛒 NOVO PEDIDO #${order.numero}*`,
    `*Cliente:* ${order.cliente_nome}`,
    `*Telefone:* ${order.telefone}`,
    `*Endereço:* ${order.endereco}, ${order.bairro}${order.complemento?' - '+order.complemento:''}`,
    ``,
    `*Itens:*`,
    ...order.items.map(i => `• ${i.qty}x ${i.name} — ${fmtBRL(i.price*i.qty)}`),
    ``,
    `Subtotal: ${fmtBRL(order.subtotal)}`,
    `Entrega: ${fmtBRL(order.taxa_entrega)}`,
    `*TOTAL: ${fmtBRL(order.total)}*`,
    ``,
    `Pagamento: ${order.pagamento.toUpperCase()}${order.troco_para?` (troco p/ ${fmtBRL(order.troco_para)})`:''}`,
    order.observacoes ? `Obs: ${order.observacoes}` : ''
  ].filter(Boolean).join('\n');
  const url = `https://wa.me/${wa}?text=${encodeURIComponent(lines)}`;

  const body = document.getElementById('drawer-body');
  const foot = document.getElementById('drawer-foot');
  body.innerHTML = `
    <div class="success-screen">
      <div class="check">✓</div>
      <h2>Pedido realizado! ✅</h2>
      <p>Agora envie a confirmação do seu pedido para nosso WhatsApp para agilizar o atendimento.</p>
      <a class="btn btn-whatsapp" href="${url}" target="_blank" rel="noopener">
        📱 Enviar para WhatsApp
      </a>
    </div>`;
  foot.innerHTML = `<button class="btn btn-secondary btn-block" onclick="closeDrawer()">Continuar comprando</button>`;
}

// ---------- AUTH ----------
function openAuth() { document.getElementById('auth-modal').classList.add('open'); switchTab('login'); }
function closeAuth() { document.getElementById('auth-modal').classList.remove('open'); }
function switchTab(t) {
  document.querySelectorAll('.tab-switch button').forEach(b => b.classList.toggle('active', b.dataset.tab===t));
  document.getElementById('tab-login').classList.toggle('hidden', t!=='login');
  document.getElementById('tab-signup').classList.toggle('hidden', t!=='signup');
}

async function doLogin(e) {
  e.preventDefault();
  const email = document.getElementById('li-email').value;
  const pwd   = document.getElementById('li-pwd').value;
  const { error } = await sb.auth.signInWithPassword({ email, password: pwd });
  if (error) { toast(error.message,'error'); return; }
  closeAuth(); await refreshAuth(); renderHeader();
  toast('Bem-vindo!','success');
}
async function doSignup(e) {
  e.preventDefault();
  const nome  = document.getElementById('su-nome').value;
  const email = document.getElementById('su-email').value;
  const tel   = document.getElementById('su-tel').value;
  const end   = document.getElementById('su-end').value;
  const bai   = document.getElementById('su-bai').value;
  const pwd   = document.getElementById('su-pwd').value;
  const { data, error } = await sb.auth.signUp({
    email, password: pwd,
    options: { data: { nome }, emailRedirectTo: window.location.origin }
  });
  if (error) { toast(error.message,'error'); return; }
  // Atualiza profile (trigger já criou registro vazio)
  if (data.user) {
    await sb.from('profiles').upsert({ id: data.user.id, nome, telefone: tel, endereco: end, bairro: bai });
  }
  closeAuth(); await refreshAuth(); renderHeader();
  toast('Conta criada! Verifique seu email se necessário.','success');
}
async function doLogout() {
  await sb.auth.signOut();
  state.user = null; state.profile = null; renderHeader();
  toast('Você saiu','success');
}

// ---------- BIND ----------
function bindUI() {
  document.getElementById('cart-btn')?.addEventListener('click', openCart);
  document.getElementById('user-btn')?.addEventListener('click', () => state.user ? doLogout() : openAuth());
  document.getElementById('drawer-overlay')?.addEventListener('click', closeDrawer);
  document.getElementById('search')?.addEventListener('input', e => onSearch(e.target.value));
  document.getElementById('hero-cta')?.addEventListener('click', () => document.getElementById('produtos')?.scrollIntoView({behavior:'smooth'}));
}
