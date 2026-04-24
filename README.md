# 🛵 Delivery App — Guia Completo de Deploy

## Stack
- **Frontend:** Next.js 14 (App Router) + TailwindCSS
- **Backend/DB:** Supabase (Auth + PostgreSQL + Storage)
- **Deploy:** Vercel
- **Integração:** WhatsApp (wa.me)

---

## 📋 PASSO 1 — Configurar o Supabase

### 1.1 Acessar o SQL Editor
1. Acesse [supabase.com](https://supabase.com) → seu projeto
2. Vá em **SQL Editor** (menu lateral esquerdo)
3. Clique em **New Query**

### 1.2 Executar o Schema
Cole e execute o conteúdo do arquivo `supabase/schema.sql`
> Isso cria todas as tabelas, RLS, triggers e políticas de segurança.

### 1.3 Importar Produtos (137 itens do seu estoque)
Execute o arquivo `supabase/products_seed.sql`
> Isso importa todas as 20 categorias e 137 produtos com preços calculados.

### 1.4 Criar o Storage Bucket
1. Vá em **Storage** no menu lateral
2. Clique em **New bucket**
3. Nome: `images`
4. Marque **Public bucket** ✅
5. Clique em **Create bucket**

---

## 👤 PASSO 2 — Criar o Usuário Admin

### 2.1 Criar conta no sistema
1. Acesse seu site em `/register`
2. Crie uma conta com seu email de admin

### 2.2 Promover a admin
No Supabase SQL Editor, execute:
```sql
UPDATE profiles SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL_ADMIN@gmail.com');
```

---

## 🔑 PASSO 3 — Variáveis de Ambiente

Suas chaves do Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://npsdympqruevmconaglm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_WHATSAPP_NUMBER=5521985529198
```

---

## 🚀 PASSO 4 — Deploy no Vercel

### 4.1 Preparar repositório
```bash
cd delivery-app
git init
git add .
git commit -m "Initial commit"
```

Crie um repo no GitHub e faça push:
```bash
git remote add origin https://github.com/SEU_USUARIO/delivery-app.git
git push -u origin main
```

### 4.2 Importar no Vercel
1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório do GitHub
3. Configure as **Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://npsdympqruevmconaglm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (sua anon key completa) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5521985529198` |

4. Clique em **Deploy** ✅

---

## 🧪 PASSO 5 — Testar Localmente

```bash
cd delivery-app
npm install
npm run dev
```

Acesse:
- **Loja:** http://localhost:3000
- **Admin:** http://localhost:3000/admin

---

## 📱 Rotas do Sistema

### Área do Cliente
| Rota | Descrição |
|------|-----------|
| `/` | Cardápio (home) |
| `/login` | Login do cliente |
| `/register` | Cadastro do cliente |
| `/cart` | Carrinho de compras |
| `/checkout` | Finalizar pedido |
| `/orders` | Meus pedidos |
| `/orders/[id]` | Detalhe do pedido |

### Painel Admin
| Rota | Descrição |
|------|-----------|
| `/admin` | Redireciona para dashboard |
| `/admin/login` | Login admin |
| `/admin/dashboard` | Dashboard com métricas |
| `/admin/orders` | Lista de pedidos (tempo real) |
| `/admin/orders/[id]` | Detalhe + mudar status |
| `/admin/products` | Gestão de produtos |
| `/admin/products/new` | Novo produto |
| `/admin/products/[id]` | Editar produto |
| `/admin/categories` | Gestão de categorias |
| `/admin/delivery-zones` | Taxa de entrega por bairro |
| `/admin/reports` | Relatórios + exportar Excel |
| `/admin/settings` | Logo, banner, WhatsApp |

---

## 🗄️ Estrutura do Banco

```
profiles          → Dados dos usuários
categories        → Categorias dos produtos (20 categorias)
products          → Produtos (137 itens importados do PDF)
delivery_zones    → Bairros + taxa de entrega
orders            → Pedidos
order_items       → Itens de cada pedido
settings          → Configurações da loja
```

---

## 🛡️ Segurança (RLS)

- Clientes só veem **seus próprios pedidos**
- Admin tem acesso **total** a todos os dados
- Usuários comuns **não acessam** `/admin`
- Imagens armazenadas com **acesso público** no Supabase Storage
- Senhas gerenciadas pelo **Supabase Auth** (criptografadas)

---

## 💬 Fluxo do WhatsApp

Após o cliente finalizar o pedido:
1. Sistema salva no banco de dados
2. Exibe tela de sucesso com botão WhatsApp
3. Botão abre `wa.me/5521985529198?text=...` com resumo completo
4. Admin recebe a mensagem formatada com todos os detalhes

---

## 📦 Produtos Importados (do PDF)

**20 categorias — 137 produtos:**
- 🍺 Cervejas (Amstel, Heineken, Corona, Brahma, Stella, Itaipava...)
- 🥃 Whisky (Jack Daniels, Red Label, Black Label, Jameson, Buchanan's...)
- 🍾 Vodka (Smirnoff, GT Long, Skol Beats, Kovak...)
- 🍸 Gin (Tanqueray, Beefeater, Gordons, QN Sabores...)
- 🥂 Tequilas (Cuervo, Tequilero Morango...)
- 🍷 Vinho (Pinkmoon, Vanisul, Galioto, Du Gomes...)
- ⚡ Energéticos (Red Bull, Monster, Baly, ST Pierre, MSX...)
- 🥤 Refrigerantes (Coca-Cola, Guaraná, Fanta, Sprite, Pepsi...)
- 💧 Águas (com/sem gás, tônica...)
- 🧊 Gelo (picole, saco, filtrado...)
- 🎁 Combos (QN+Baly, Smirnoff, Red Label, Black Label...)
- 🥤 Copão / Doses
- 🍬 Balas (Halls, Chiclete, Pirulito...)
- 🍦 Sorvetes (Garoto, Nestlé, Fini...)
- 🧃 Sucos (Del Valle, Gatorade, Suco da Fruta...)
- 🚬 Tabacaria (Narguile, Essências, Seda...)
- 🍪 Biscoito (Fofura, Amendoin...)
- 🥃 Cachaça (51, Caninha da Roça, Mel Zangão...)
- 🔥 Carvão Churrasco
- 🍷 Licor (Campari, Aperol, Bananinha...)
