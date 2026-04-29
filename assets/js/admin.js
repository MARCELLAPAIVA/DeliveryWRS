// =====================================================================
// admin.js — Painel administrativo
// =====================================================================

const A = {
  user: null,
  view: 'dashboard',
  categories: [], products: [], zones: [], orders: [], settings: {},
};

window.addEventListener('DOMContentLoaded', async () => {
  bindUI();
  await guard();
});

// ---------- ACCESS ----------
async function guard() {
  const { data: { session } } = await sb.auth.getSession();

  if (!session) {
    showLogin();
    return;
  }

  const { data: userData, error: userError } = await sb.auth.getUser();

  if (userError || !userData?.user) {
    showLogin('Sessão inválida. Faça login novamente.');
    return;
  }

  A.user = userData.user;

  const ok = await validarAdmin(A.user.id);

  if (!ok) {
    await sb.auth.signOut();
    showLogin('Você não tem permissão de admin. Faça login com uma conta administradora.');
    return;
  }

  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-app').classList.remove('hidden');

  await loadAll();
  goto('dashboard');
}

function showLogin(msg) {
  document.getElementById('admin-app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');

  const a = document.getElementById('login-alert');
  if (a) {
    a.textContent = msg || '';
    if (msg) a.classList.remove('hidden');
    else a.classList.add('hidden');
  }
}

async function adminLogin(e) {
  e.preventDefault();

  const email = document.getElementById('al-email').value.trim();
  const pwd = document.getElementById('al-pwd').value;

  const alertBox = document.getElementById('login-alert');
  if (alertBox) {
    alertBox.textContent = '';
    alertBox.classList.add('hidden');
  }

  const { error } = await sb.auth.signInWithPassword({
    email,
    password: pwd
  });

  if (error) {
    showLogin('Email ou senha inválidos.');
    return;
  }

  await guard();
async function validarAdmin(userId) {
  const { data, error } = await sb.rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  });

  if (error) {
    console.error('Erro RPC has_role:', error);
    showLogin('Não foi possível validar o admin. Erro na função has_role.');
    return false;
  }

  console.log('VALIDAÇÃO ADMIN:', data);

  return data === true;
}

  console.log('ROLES DO USUÁRIO:', roles);

  return roles?.some(r => r.role === 'admin');
}

async function adminLogout(e) {
  if (e) e.preventDefault();
  await sb.auth.signOut();
  location.reload();
}

// ---------- LOADERS ----------
async function loadAll() {
  await Promise.all([loadCats(), loadProds(), loadZones(), loadOrders(), loadSets()]);
}
async function loadCats()  { const { data } = await sb.from('categories').select('*').order('sort_order'); A.categories = data||[]; }
async function loadProds() { const { data } = await sb.from('products').select('*, categories(name)').order('name'); A.products = data||[]; }
async function loadZones() { const { data } = await sb.from('delivery_zones').select('*').order('bairro'); A.zones = data||[]; }
async function loadOrders(){ const { data } = await sb.from('orders').select('*').order('created_at',{ascending:false}).limit(200); A.orders = data||[]; }
async function loadSets()  { const { data } = await sb.from('settings').select('*'); (data||[]).forEach(r=>A.settings[r.key]=r.value); }

// ---------- ROUTING ----------
function goto(view) {
  A.view = view;
  document.querySelectorAll('.admin-nav a').forEach(a => a.classList.toggle('active', a.dataset.view===view));
  const main = document.getElementById('admin-content');
  if (view==='dashboard') renderDashboard(main);
  if (view==='produtos')  renderProducts(main);
  if (view==='categorias') renderCategories(main);
  if (view==='zonas')     renderZones(main);
  if (view==='pedidos')   renderOrders(main);
  if (view==='config')    renderSettings(main);
}

// ---------- DASHBOARD ----------
function renderDashboard(el) {
  const today = new Date(); today.setHours(0,0,0,0);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
  const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate()-30);
  const sum = arr => arr.reduce((s,o)=>s+Number(o.total||0),0);
  const todayOrders = A.orders.filter(o => new Date(o.created_at)>=today);
  const weekOrders = A.orders.filter(o => new Date(o.created_at)>=weekAgo);
  const monthOrders = A.orders.filter(o => new Date(o.created_at)>=monthAgo);

  el.innerHTML = `
    <div class="admin-head">
      <h1>📊 Dashboard</h1>
      <button class="btn btn-secondary btn-sm" onclick="loadAll().then(()=>goto('dashboard'))">Atualizar</button>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="label">Pedidos hoje</div><div class="value">${todayOrders.length}</div></div>
      <div class="stat-card"><div class="label">Faturamento hoje</div><div class="value">${fmtBRL(sum(todayOrders))}</div></div>
      <div class="stat-card"><div class="label">Pedidos 7 dias</div><div class="value">${weekOrders.length}</div></div>
      <div class="stat-card"><div class="label">Faturamento 7d</div><div class="value">${fmtBRL(sum(weekOrders))}</div></div>
      <div class="stat-card"><div class="label">Pedidos 30 dias</div><div class="value">${monthOrders.length}</div></div>
      <div class="stat-card"><div class="label">Faturamento 30d</div><div class="value">${fmtBRL(sum(monthOrders))}</div></div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:10px">Status atuais</h3>
      <div style="display:flex; gap:10px; flex-wrap:wrap">
        ${['novo','em_preparo','saiu_entrega','finalizado'].map(s => {
          const n = A.orders.filter(o => o.status===s).length;
          return `<span class="badge badge-${s}">${labelStatus(s)}: ${n}</span>`;
        }).join('')}
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3 style="margin-bottom:10px">Exportar</h3>
      <button class="btn btn-secondary btn-sm" onclick="exportCSV()">📥 Exportar pedidos (CSV)</button>
    </div>
  `;
}

function exportCSV() {
  const rows = [['numero','data','cliente','telefone','bairro','pagamento','subtotal','taxa','total','status']];
  A.orders.forEach(o => rows.push([
    o.numero, new Date(o.created_at).toLocaleString('pt-BR'),
    o.cliente_nome, o.telefone, o.bairro, o.pagamento,
    o.subtotal, o.taxa_entrega, o.total, o.status
  ]));
  const csv = rows.map(r => r.map(v => `"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `pedidos_${Date.now()}.csv`; a.click();
}

// ---------- PRODUTOS ----------
function renderProducts(el) {
  el.innerHTML = `
    <div class="admin-head">
      <h1>📦 Produtos (${A.products.length})</h1>
      <button class="btn btn-primary btn-sm" onclick="editProduct()">+ Novo produto</button>
    </div>
    <div class="toolbar">
      <input class="search-box" placeholder="Buscar por nome..." oninput="filterProducts(this.value)">
    </div>
    <div class="table-wrap">
      <table id="prod-table">
        <thead><tr><th>Imagem</th><th>Código</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Ativo</th><th></th></tr></thead>
        <tbody>${prodRows(A.products)}</tbody>
      </table>
    </div>
  `;
}
function prodRows(list) {
  return list.map(p => `
    <tr>
      <td>${p.image_url ? `<img src="${p.image_url}" style="width:42px;height:42px;border-radius:6px;object-fit:cover">` : '🍾'}</td>
      <td>${p.code||''}</td>
      <td>${p.name}</td>
      <td>${p.categories?.name || '—'}</td>
      <td>${fmtBRL(p.price)}</td>
      <td>${p.active?'✅':'❌'}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editProduct('${p.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">🗑</button>
      </td>
    </tr>`).join('');
}
function filterProducts(q) {
  q = q.toLowerCase();
  const list = A.products.filter(p => p.name.toLowerCase().includes(q) || (p.code||'').includes(q));
  document.querySelector('#prod-table tbody').innerHTML = prodRows(list);
}

function editProduct(id) {
  const p = id ? A.products.find(x=>x.id===id) : { name:'', description:'', price:0, category_id:'', active:true, image_url:'' };
  openModal(`
    <h2>${id?'Editar':'Novo'} produto</h2>
    <div class="field"><label>Nome</label><input id="pf-name" value="${p.name||''}"></div>
    <div class="field"><label>Descrição</label><textarea id="pf-desc" rows="2">${p.description||''}</textarea></div>
    <div class="field-row">
      <div class="field"><label>Preço (R$)</label><input id="pf-price" type="number" step="0.01" value="${p.price||0}"></div>
      <div class="field"><label>Categoria</label>
        <select id="pf-cat">
          <option value="">—</option>
          ${A.categories.map(c=>`<option value="${c.id}" ${c.id===p.category_id?'selected':''}>${c.name}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="field"><label>Imagem</label>
      ${p.image_url?`<img src="${p.image_url}" style="width:80px;height:80px;border-radius:8px;object-fit:cover;margin-bottom:8px">`:''}
      <input id="pf-img" type="file" accept="image/*">
    </div>
    <div class="field"><label><input id="pf-active" type="checkbox" ${p.active?'checked':''} style="width:auto;margin-right:6px">Ativo (visível na loja)</label></div>
    <div style="display:flex;gap:8px;margin-top:18px">
      <button class="btn btn-secondary btn-block" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-block" onclick="saveProduct('${id||''}')">Salvar</button>
    </div>
  `);
}

async function saveProduct(id) {
  const payload = {
    name: document.getElementById('pf-name').value.trim(),
    description: document.getElementById('pf-desc').value.trim(),
    price: Number(document.getElementById('pf-price').value || 0),
    category_id: document.getElementById('pf-cat').value || null,
    active: document.getElementById('pf-active').checked,
  };
  if (!payload.name) { toast('Nome obrigatório','error'); return; }

  const file = document.getElementById('pf-img').files[0];
  if (file) {
    const path = `produtos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
    const { error: upErr } = await sb.storage.from('produtos').upload(path, file, { upsert:true });
    if (upErr) { toast('Erro upload: '+upErr.message,'error'); return; }
    payload.image_url = sb.storage.from('produtos').getPublicUrl(path).data.publicUrl;
  }

  let res;
  if (id) res = await sb.from('products').update(payload).eq('id', id);
  else    res = await sb.from('products').insert(payload);
  if (res.error) { toast(res.error.message,'error'); return; }
  toast('Salvo!','success'); closeModal(); await loadProds(); goto('produtos');
}

async function deleteProduct(id) {
  if (!confirm('Excluir este produto?')) return;
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) { toast(error.message,'error'); return; }
  toast('Excluído','success'); await loadProds(); goto('produtos');
}

// ---------- CATEGORIAS ----------
function renderCategories(el) {
  el.innerHTML = `
    <div class="admin-head">
      <h1>📁 Categorias</h1>
      <button class="btn btn-primary btn-sm" onclick="editCategory()">+ Nova categoria</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Ícone</th><th>Nome</th><th>Slug</th><th>Ordem</th><th>Ativa</th><th></th></tr></thead>
        <tbody>${A.categories.map(c=>`
          <tr>
            <td style="font-size:24px">${c.icon||'🛒'}</td>
            <td>${c.name}</td><td>${c.slug}</td><td>${c.sort_order||0}</td>
            <td>${c.active?'✅':'❌'}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="editCategory('${c.id}')">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="deleteCategory('${c.id}')">🗑</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}
function editCategory(id) {
  const c = id ? A.categories.find(x=>x.id===id) : { name:'', slug:'', icon:'🛒', sort_order:0, active:true };
  openModal(`
    <h2>${id?'Editar':'Nova'} categoria</h2>
    <div class="field"><label>Nome</label><input id="cf-name" value="${c.name||''}"></div>
    <div class="field"><label>Slug (url)</label><input id="cf-slug" value="${c.slug||''}" placeholder="ex: cervejas"></div>
    <div class="field-row">
      <div class="field"><label>Ícone (emoji)</label><input id="cf-icon" value="${c.icon||''}"></div>
      <div class="field"><label>Ordem</label><input id="cf-sort" type="number" value="${c.sort_order||0}"></div>
    </div>
    <div class="field"><label><input id="cf-active" type="checkbox" ${c.active?'checked':''} style="width:auto;margin-right:6px">Ativa</label></div>
    <div style="display:flex;gap:8px;margin-top:18px">
      <button class="btn btn-secondary btn-block" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-block" onclick="saveCategory('${id||''}')">Salvar</button>
    </div>`);
}
async function saveCategory(id) {
  const slugify = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const name = document.getElementById('cf-name').value.trim();
  const payload = {
    name,
    slug: document.getElementById('cf-slug').value.trim() || slugify(name),
    icon: document.getElementById('cf-icon').value,
    sort_order: Number(document.getElementById('cf-sort').value||0),
    active: document.getElementById('cf-active').checked,
  };
  if (!payload.name) { toast('Nome obrigatório','error'); return; }
  const res = id
    ? await sb.from('categories').update(payload).eq('id',id)
    : await sb.from('categories').insert(payload);
  if (res.error) { toast(res.error.message,'error'); return; }
  toast('Salvo','success'); closeModal(); await loadCats(); goto('categorias');
}
async function deleteCategory(id) {
  if (!confirm('Excluir categoria?')) return;
  const { error } = await sb.from('categories').delete().eq('id', id);
  if (error) { toast(error.message,'error'); return; }
  await loadCats(); goto('categorias');
}

// ---------- ZONAS / FRETE ----------
function renderZones(el) {
  el.innerHTML = `
    <div class="admin-head">
      <h1>🚚 Bairros & Taxa de entrega</h1>
      <button class="btn btn-primary btn-sm" onclick="editZone()">+ Novo bairro</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Bairro</th><th>Taxa</th><th>Ativo</th><th></th></tr></thead>
        <tbody>${A.zones.map(z=>`
          <tr>
            <td>${z.bairro}</td>
            <td>${fmtBRL(z.taxa)}</td>
            <td>${z.active?'✅':'❌'}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="editZone('${z.id}')">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="deleteZone('${z.id}')">🗑</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}
function editZone(id) {
  const z = id ? A.zones.find(x=>x.id===id) : { bairro:'', taxa:0, active:true };
  openModal(`
    <h2>${id?'Editar':'Novo'} bairro</h2>
    <div class="field"><label>Bairro</label><input id="zf-name" value="${z.bairro||''}"></div>
    <div class="field"><label>Taxa de entrega (R$)</label><input id="zf-tax" type="number" step="0.01" value="${z.taxa||0}"></div>
    <div class="field"><label><input id="zf-active" type="checkbox" ${z.active?'checked':''} style="width:auto;margin-right:6px">Ativo</label></div>
    <div style="display:flex;gap:8px;margin-top:18px">
      <button class="btn btn-secondary btn-block" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-block" onclick="saveZone('${id||''}')">Salvar</button>
    </div>`);
}
async function saveZone(id) {
  const payload = {
    bairro: document.getElementById('zf-name').value.trim(),
    taxa: Number(document.getElementById('zf-tax').value||0),
    active: document.getElementById('zf-active').checked,
  };
  if (!payload.bairro) { toast('Bairro obrigatório','error'); return; }
  const res = id
    ? await sb.from('delivery_zones').update(payload).eq('id',id)
    : await sb.from('delivery_zones').insert(payload);
  if (res.error) { toast(res.error.message,'error'); return; }
  toast('Salvo','success'); closeModal(); await loadZones(); goto('zonas');
}
async function deleteZone(id) {
  if (!confirm('Excluir bairro?')) return;
  await sb.from('delivery_zones').delete().eq('id', id);
  await loadZones(); goto('zonas');
}

// ---------- PEDIDOS ----------
const STATUS = ['novo','em_preparo','saiu_entrega','finalizado','cancelado'];
function labelStatus(s) {
  return ({novo:'Novo',em_preparo:'Em preparo',saiu_entrega:'Saiu p/ entrega',finalizado:'Finalizado',cancelado:'Cancelado'})[s]||s;
}
function renderOrders(el) {
  el.innerHTML = `
    <div class="admin-head">
      <h1>📋 Pedidos (${A.orders.length})</h1>
      <button class="btn btn-secondary btn-sm" onclick="loadOrders().then(()=>goto('pedidos'))">Atualizar</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>Data</th><th>Cliente</th><th>Bairro</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>${A.orders.map(o=>`
          <tr>
            <td>#${o.numero}</td>
            <td>${new Date(o.created_at).toLocaleString('pt-BR')}</td>
            <td>${o.cliente_nome}<br><small style="color:var(--muted)">${o.telefone||''}</small></td>
            <td>${o.bairro||'—'}</td>
            <td>${fmtBRL(o.total)}</td>
            <td><span class="badge badge-${o.status}">${labelStatus(o.status)}</span></td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="viewOrder('${o.id}')">Ver</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}
async function viewOrder(id) {
  const o = A.orders.find(x=>x.id===id);
  const { data: items } = await sb.from('order_items').select('*').eq('order_id', id);
  openModal(`
    <h2>Pedido #${o.numero}</h2>
    <p style="color:var(--muted);margin-bottom:14px">${new Date(o.created_at).toLocaleString('pt-BR')}</p>
    <div class="card" style="background:var(--bg-soft);box-shadow:none">
      <strong>${o.cliente_nome}</strong><br>
      📞 ${o.telefone||'—'}<br>
      📍 ${o.endereco||'—'}, ${o.bairro||''} ${o.complemento?' - '+o.complemento:''}
    </div>
    <h3 style="margin:14px 0 8px">Itens</h3>
    ${(items||[]).map(i=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
      <span>${i.quantity}x ${i.product_name}</span><span>${fmtBRL(i.subtotal)}</span></div>`).join('')}
    <div style="margin-top:12px;display:flex;flex-direction:column;gap:4px">
      <div style="display:flex;justify-content:space-between"><span>Subtotal</span><span>${fmtBRL(o.subtotal)}</span></div>
      <div style="display:flex;justify-content:space-between"><span>Taxa</span><span>${fmtBRL(o.taxa_entrega)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:700;font-size:18px"><span>Total</span><span>${fmtBRL(o.total)}</span></div>
    </div>
    <p style="margin-top:10px"><strong>Pagamento:</strong> ${o.pagamento.toUpperCase()}${o.troco_para?` (troco para ${fmtBRL(o.troco_para)})`:''}</p>
    ${o.observacoes?`<p><strong>Obs:</strong> ${o.observacoes}</p>`:''}
    <div class="field" style="margin-top:14px">
      <label>Alterar status</label>
      <select id="os-sel">${STATUS.map(s=>`<option value="${s}" ${s===o.status?'selected':''}>${labelStatus(s)}</option>`).join('')}</select>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-secondary btn-block" onclick="closeModal()">Fechar</button>
      <button class="btn btn-primary btn-block" onclick="updateOrderStatus('${o.id}')">Salvar status</button>
    </div>`);
}
async function updateOrderStatus(id) {
  const status = document.getElementById('os-sel').value;
  const { error } = await sb.from('orders').update({ status }).eq('id', id);
  if (error) { toast(error.message,'error'); return; }
  toast('Status atualizado','success'); closeModal(); await loadOrders(); goto('pedidos');
}

// ---------- CONFIG ----------
function renderSettings(el) {
  el.innerHTML = `
    <div class="admin-head"><h1>⚙️ Configurações</h1></div>
    <div class="card">
      <div class="field"><label>Nome da loja</label><input id="cf-store" value="${A.settings.nome_loja||''}"></div>
      <div class="field"><label>WhatsApp (com DDI, ex: 5521985529198)</label><input id="cf-wa" value="${A.settings.whatsapp||''}"></div>
      <div class="field"><label>Descrição</label><textarea id="cf-desc" rows="3">${A.settings.descricao||''}</textarea></div>
      <div class="field"><label>Logo (upload)</label>
        ${A.settings.logo_url?`<img src="${A.settings.logo_url}" style="width:80px;height:80px;border-radius:8px;margin-bottom:8px">`:''}
        <input id="cf-logo" type="file" accept="image/*">
      </div>
      <button class="btn btn-primary" onclick="saveSettings()">Salvar configurações</button>
    </div>`;
}
async function saveSettings() {
  const updates = [
    { key:'nome_loja', value: document.getElementById('cf-store').value },
    { key:'whatsapp',  value: document.getElementById('cf-wa').value },
    { key:'descricao', value: document.getElementById('cf-desc').value },
  ];
  const file = document.getElementById('cf-logo').files[0];
  if (file) {
    const path = `loja/logo-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: upErr } = await sb.storage.from('produtos').upload(path, file, { upsert:true });
    if (!upErr) updates.push({ key:'logo_url', value: sb.storage.from('produtos').getPublicUrl(path).data.publicUrl });
  }
  for (const u of updates) await sb.from('settings').upsert(u);
  toast('Configurações salvas','success'); await loadSets(); goto('config');
}

// ---------- MODAL ----------
function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('admin-modal').classList.add('open');
}
function closeModal() { document.getElementById('admin-modal').classList.remove('open'); }

function bindUI() {
  document.querySelectorAll('.admin-nav a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); goto(a.dataset.view); }));
  document.getElementById('logout-btn')?.addEventListener('click', adminLogout);
  document.getElementById('menu-toggle')?.addEventListener('click', () => document.querySelector('.admin-sidebar').classList.toggle('open'));
}
