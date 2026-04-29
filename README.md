# 🥃 Whiskeria Royal Salute — Sistema de Delivery

Sistema completo de delivery em **HTML/CSS/JS puro**, com backend no **Supabase** (auth, banco, storage). Pronto para deploy estático no **Vercel**, **Netlify**, **GitHub Pages** ou qualquer hospedagem.

- **315 produtos** + **29 categorias** já cadastrados (do seu PDF)
- **Loja do cliente** (`index.html`) com auth, carrinho, checkout, integração WhatsApp
- **Painel admin** (`admin.html`) com pedidos em tempo real, gestão de produtos, categorias, bairros/frete e configurações
- **Sem build** — só subir os arquivos

---

## 📁 Estrutura

```
delivery-royal-salute/
├── index.html                  ← Loja (cliente)
├── admin.html                  ← Painel admin
├── vercel.json
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── supabase-client.js  ← Conexão Supabase (suas chaves)
│       ├── loja.js             ← Lógica da loja
│       └── admin.js            ← Lógica do admin
└── supabase/
    ├── 01_schema.sql           ← Tabelas, tipos, triggers
    ├── 02_rls.sql              ← Row Level Security
    ├── 03_seed_categorias_produtos.sql  ← 315 produtos
    └── 04_storage_e_admin.sql  ← Bucket + bairros + instruções admin
```

---

## ⚙️ Passo 1 — Configurar o Supabase

Suas chaves já estão no código (`assets/js/supabase-client.js`):
- **Project ID:** `lldywimvdfqjqcqqkuvp`
- **Anon key:** já incluída

### 1.1 Rodar os SQLs (na ordem!)

Vá em **Supabase → SQL Editor → New query** e cole **um por vez**:

1. `supabase/01_schema.sql` → cria tabelas, tipos, triggers
2. `supabase/02_rls.sql`    → ativa RLS e políticas de segurança
3. `supabase/03_seed_categorias_produtos.sql` → insere 29 categorias e 315 produtos
4. `supabase/04_storage_e_admin.sql` → cria bucket de imagens + bairros de exemplo

### 1.2 Habilitar Email/Senha no Auth

Em **Supabase → Authentication → Providers**, garanta que **Email** está ativado.
Em **Settings → Authentication**, **desative "Confirm email"** se quiser que o cadastro libere acesso imediato (opcional).

### 1.3 Promover seu usuário a admin

1. Acesse `index.html` no navegador
2. Crie sua conta (botão de usuário → Criar conta)
3. No **SQL Editor** do Supabase, execute (substituindo o email):

```sql
SELECT id, email FROM auth.users WHERE email = 'SEU_EMAIL@AQUI.com';
```

4. Copie o `id` retornado e execute:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('COLE_O_UUID_AQUI', 'admin')
ON CONFLICT DO NOTHING;
```

5. Pronto — agora `admin.html` libera acesso para você.

---

## 🚀 Passo 2 — Deploy

### Opção A — Vercel (recomendado)

1. Crie conta em [vercel.com](https://vercel.com)
2. **New Project → Import** (faça upload do ZIP descompactado, ou suba pra um repo no GitHub e conecte)
3. **Framework Preset:** Other / None
4. **Build Command:** *(deixe vazio)*
5. **Output Directory:** `./`
6. Click **Deploy**

URLs ficam tipo:
- Loja: `https://royal-salute.vercel.app/`
- Admin: `https://royal-salute.vercel.app/admin`

### Opção B — Netlify

1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arraste a pasta `delivery-royal-salute/` inteira
3. Pronto — em 30 segundos tem um link público

### Opção C — Hospedagem própria / cPanel

Suba todo o conteúdo da pasta `delivery-royal-salute/` para a raiz pública (`public_html`, `www` etc.) via FTP. Acesse pelo seu domínio normalmente.

---

## ⚠️ IMPORTANTE — Configurar URLs no Supabase

Depois do deploy, vá em **Supabase → Authentication → URL Configuration**:

- **Site URL:** sua URL final (ex: `https://royal-salute.vercel.app`)
- **Redirect URLs:** adicione a mesma URL

Sem isso, o cadastro de novos clientes pode falhar.

---

## 📲 Funcionalidades

### 🛒 Loja (`index.html`)
- ✅ Login/cadastro com email e senha
- ✅ Catálogo organizado por 29 categorias
- ✅ Busca de produtos
- ✅ Carrinho com controle de quantidade
- ✅ Checkout com endereço, bairro (frete automático), forma de pagamento (Pix/Dinheiro/Cartão)
- ✅ Campo "troco para?" quando dinheiro
- ✅ Após finalizar: botão direto para WhatsApp (`5521985529198`) com resumo formatado do pedido
- ✅ Persistência do carrinho no `localStorage`
- ✅ Mobile-first

### 🔐 Admin (`admin.html`)
- ✅ Login protegido (acesso só com `role = admin`)
- ✅ **Dashboard:** pedidos hoje/7d/30d, faturamento, status atual
- ✅ **Pedidos:** lista, detalhes, alterar status (Novo → Em preparo → Saiu p/ entrega → Finalizado)
- ✅ **Produtos:** criar, editar, excluir, **upload de imagem** (Supabase Storage)
- ✅ **Categorias:** criar, editar, excluir, ordenação
- ✅ **Bairros & Frete:** cadastrar bairros e suas taxas
- ✅ **Configurações:** nome da loja, WhatsApp, descrição, logo
- ✅ **Exportação CSV** dos pedidos

---

## 🔒 Segurança

- **RLS (Row Level Security)** ativada em todas as tabelas
- **Roles em tabela separada** (`user_roles`) — evita escalation attacks
- **Função `has_role()`** com `SECURITY DEFINER` — evita recursão de policy
- Cliente só enxerga **os próprios pedidos**
- Admin é **server-side** (validado pelo Postgres, não pelo JS)
- Bucket de Storage com policy: leitura pública, escrita só admin

---

## 🛠 Customização rápida

### Trocar o WhatsApp da loja
- **Pelo admin:** menu Configurações → WhatsApp → Salvar
- **Ou no banco:** `UPDATE settings SET value = '5521999999999' WHERE key = 'whatsapp';`

### Adicionar produto manualmente
Painel admin → Produtos → "+ Novo produto"

### Upload de imagens
Direto pelo painel admin. Vão para o bucket `produtos` no Supabase Storage.

---

## ❓ Troubleshooting

**"Failed to fetch" / produtos não carregam**
- Verifique se rodou os 4 SQLs na ordem
- Confirme as chaves em `assets/js/supabase-client.js`

**Não consigo entrar no admin**
- Confirme que rodou o `INSERT INTO user_roles` com sua conta
- Limpe cache do navegador

**Cadastro não funciona**
- Configure **Site URL** e **Redirect URLs** no Supabase Auth
- Verifique se o provider Email está ativado

**Imagens não fazem upload**
- Confirme que o bucket `produtos` existe (rodou `04_storage_e_admin.sql`)
- Confirme que sua conta tem `role = admin`

---

## 📞 Suporte

Sistema gerado para a Whiskeria Royal Salute. Código aberto e modificável — sinta-se à vontade para customizar.

WhatsApp da loja (configurado): **+55 21 98552-9198**
