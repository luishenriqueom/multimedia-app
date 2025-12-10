# Multimídia Manager - Frontend

Este projeto é o frontend do **Multimídia Manager**, uma aplicação moderna para gerenciar arquivos multimídia (imagens, vídeos, etc) com experiência intuitiva.

## ✨ Tecnologias Principais

- **Next.js** 16 (App Router)
- **React** 19
- **TypeScript**
- **Tailwind CSS**
- **Radix UI** (componentes acessíveis)
- **Vercel Analytics** (telemetria)
- **Docker** (deploy facilitado)

## 📁 Estrutura Principal

- `app/` — Rotas e páginas principais (Next.js App Router)
  - `/dashboard` — Área logada para gerenciamento das mídias
- `components/` — Componentes reutilizáveis de UI, formulários, galeria, upload, etc
- `contexts/` — Contextos globais de autenticação e mídias
- `lib/` — Funções auxiliares, API helpers
- `hooks/` — Custom hooks
- `styles/` — Estilos globais (Tailwind)

## 🚀 Funcionalidades

- Autenticação de usuários
- Upload de arquivos multimídia
- Galeria de mídias com visualização rápida
- Gerenciamento de perfil
- Interface responsiva e acessível

## 📦 Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/) ou [npm](https://www.npmjs.com/)
- (Opcional) Docker para produção

## ⚙️ Instalação e Uso

1. Instale as dependências:

```bash
yarn install
# ou
npm install
```

2. Rode o ambiente de desenvolvimento:

```bash
yarn dev
# ou
npm run dev
```

3. Acesse em [http://localhost:3000](http://localhost:3000)

### Scripts mais usados

- `dev` — Inicia o ambiente de desenvolvimento
- `build` — Cria a build de produção
- `start` — Roda a aplicação já buildada
- `lint` — Checa problemas de lint

## 🐳 Rodando com Docker

```bash
docker build -t multimedia-app .
docker run -p 3000:3000 multimedia-app
```

## 📝 Observações

- Para autenticação e uso completo, é necessário que o backend (API) esteja rodando.
- Variáveis de ambiente, se houver, devem ser configuradas conforme o backend.
