# 🍕 La Brasa Pizzaria — Cardápio Online

Sistema completo de cardápio online e gerenciamento para a **La Brasa Pizzaria**, desenvolvido em React + Vite. Permite que clientes naveguem pelo menu, montem pizzas personalizadas e façam pedidos, enquanto o administrador gerencia tudo em tempo real pelo painel.

---

## ✨ Funcionalidades

### 👤 Área do Cliente
- 🗂️ Navegação por categorias de produtos
- 🍕 Montagem de pizza personalizada (tamanho + sabores)
- 🛒 Carrinho de compras com sidebar interativa
- 📦 Checkout com seleção de mesa ou entrega
- 📍 Acompanhamento de status do pedido
- 💬 Botão de contato via WhatsApp
- 🔴 Banner de status da loja (aberta/fechada)

### 🔐 Painel Administrativo (`/adm`)
- 📋 Gestão de itens do cardápio (CRUD completo)
- 🏷️ Gestão de categorias
- 🪑 Gestão de mesas para atendimento presencial
- 🧾 Gestão e histórico de pedidos
- 🚚 Configuração de taxa de entrega (frete)
- 🕐 Configuração de horários de funcionamento
- 🔒 Autenticação de administrador

---

## 🛠️ Tech Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| ⚛️ React | 19.1 | Framework principal |
| 🔀 React Router DOM | 7.7 | Roteamento client-side |
| ⚡ Vite | 7.0 | Build tool e dev server |
| 🎨 CSS-in-JS + CSS puro | — | Estilização |
| 🔍 ESLint | 9.29 | Qualidade de código |

---

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.jsx       # Cabeçalho com navegação e carrinho
│   ├── Menu.jsx         # Grid do cardápio com filtro por categoria
│   ├── CartSidebar.jsx  # Sidebar do carrinho de compras
│   ├── AdminLogin.jsx   # Tela de login do admin
│   ├── AdminDashboard.jsx
│   ├── ItemManager.jsx  # CRUD de itens
│   ├── CategoryManager.jsx
│   ├── MesaManager.jsx  # Gestão de mesas
│   ├── pedidoManager.jsx
│   ├── PedidoCard.jsx
│   ├── PedidoHistorico.jsx
│   ├── ScheduleManager.jsx
│   ├── freteManager.jsx
│   └── StoreStatusBanner.jsx
├── pages/               # Páginas completas
│   ├── AdmPage.jsx
│   ├── Checkout.jsx
│   ├── PizzaCustomization.jsx
│   ├── ItemForm.jsx
│   └── pedidoStatus.jsx
├── contexts/            # Estado global com Context API
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── ScheduleContext.jsx
├── config.js            # URL da API
├── styles.js            # Sistema de estilos centralizado
└── index.css            # Estilos globais e media queries
```

---

## 🗺️ Rotas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `App` | Cardápio principal |
| `/customize-pizza` | `PizzaCustomization` | Montagem de pizza |
| `/checkout` | `Checkout` | Finalização do pedido |
| `/adm` | `AdmPage` | Painel administrativo |
| `/admin/item-form` | `ItemForm` | Formulário de item |
| `/pedidos` | `PedidosStatus` | Acompanhamento de pedidos |

---

## 🚀 Como Rodar

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18+
- npm

### Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse em **http://localhost:5173**

### Outros comandos

```bash
# Build de produção
npm run build

# Preview do build de produção
npm run preview

# Verificação de código
npm run lint
```

---

## 🔌 Configuração da API

A URL do backend está em `src/config.js`:

```js
// Produção (padrão)
export const API_BASE_URL = 'https://la-brasa-pizzaria-backend.onrender.com';

// Desenvolvimento local (descomente para usar)
// export const API_BASE_URL = 'http://localhost:3000';
```

> O backend é uma API REST em Node.js/Express hospedada no [Render](https://render.com).

---

## 📱 Responsividade

O layout foi desenvolvido com foco em **mobile-first** e se adapta a todos os tamanhos de tela:

- 📱 **Mobile (≤ 480px)** — grid de 2 colunas, navegação compacta
- 📱 **Mobile pequeno (≤ 360px)** — grid de 2 colunas com espaçamento reduzido
- 💻 **Desktop** — grid com `auto-fill` (mínimo 240px por card)

---

## ☁️ Deploy

O projeto está configurado para deploy em **Vercel** e **Netlify**, com redirecionamento de todas as rotas para `index.html` (necessário para SPAs).

- `vercel.json` — configuração para Vercel
- `public/_redirects` — configuração para Netlify

---

## 🎨 Design

- **Paleta de cores:** Vermelho (`#DC2626`) e Branco
- **Tipografia:** [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)
- **Estilo:** Cards com bordas suaves, sombras avermelhadas e animações de hover
