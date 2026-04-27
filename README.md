# Delivery Express - Sistema de Delivery Online

Sistema completo de delivery online com loja para clientes e painel administrativo.

## Funcionalidades

### Loja do Cliente
- Login/cadastro com email e senha (Supabase Auth)
- Busca e filtro por categorias
- Carrinho de compras com controle de quantidade
- Checkout com selecao de bairro e taxa de entrega automatica
- Forma de pagamento: PIX, Cartao, Dinheiro (com troco)
- Finalizacao com botao para WhatsApp

### Painel Admin (`/admin`)
- Dashboard com metricas (pedidos, faturamento, produtos)
- Gestao de produtos (CRUD + upload de imagem)
- Gestao de categorias
- Taxas de entrega por bairro
- Pedidos com atualizacao de status em tempo real
- Relatorios (diario, semanal, mensal) com exportacao CSV
- Configuracoes da loja (nome, logo, WhatsApp)

## Tecnologias
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth + Database + Storage)
- **Deploy**: Vercel

---

## Como Configurar

### 1. Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Abra seu projeto
3. Va em **SQL Editor** e execute o conteudo de `supabase/schema.sql`
4. Depois execute `supabase/seed.sql` para importar categorias e produtos
5. Va em **Authentication > Settings** e configure:
   - Ative **Email** como provider
   - Desabilite a confirmacao de email para testes (opcional)
6. Va em **Storage** e verifique se o bucket `products` foi criado (o schema.sql cria automaticamente)
7. Configure as politicas de storage:
   - Clique no bucket `products`
   - Adicione uma policy para permitir upload por usuarios autenticados

### 2. Criar usuario Admin

1. Crie uma conta normalmente pelo site (cadastro)
2. No Supabase Dashboard, va em **Table Editor > profiles**
3. Encontre o usuario e mude `is_admin` para `true`
4. Agora esse usuario pode acessar `/admin`

### 3. Deploy no Vercel

1. Faca push do projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositorio
3. Configure as variaveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://lldywimvdfqjqcqqkuvp.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
   ```
4. Clique em **Deploy**

### 4. Rodar Localmente

```bash
npm install
npm run dev
```

Acesse: `http://localhost:3000`

---

## Estrutura do Projeto

```
src/
  app/
    page.tsx          # Loja principal
    login/            # Login do cliente
    register/         # Cadastro / perfil
    cart/             # Carrinho
    checkout/         # Checkout
    success/          # Sucesso do pedido
    admin/
      page.tsx        # Dashboard admin
      login/          # Login admin
      categories/     # Gestao de categorias
      products/       # Gestao de produtos
      orders/         # Gestao de pedidos
      delivery-zones/ # Taxas de entrega
      reports/        # Relatorios
      settings/       # Configuracoes
  components/
    StoreHeader.tsx   # Header da loja
    ProductCard.tsx   # Card de produto
  contexts/
    AuthContext.tsx    # Contexto de autenticacao
    CartContext.tsx    # Contexto do carrinho
  lib/
    supabase.ts       # Cliente Supabase
    database.types.ts # Tipos TypeScript
    utils.ts          # Funcoes utilitarias
supabase/
  schema.sql          # Schema do banco de dados
  seed.sql            # Dados iniciais (produtos do PDF)
```
