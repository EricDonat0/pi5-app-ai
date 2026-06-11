# Relatório de Arquitetura e Implementação — PI5 App AI

Este documento descreve as decisões arquiteturais e de implementação adotadas durante o desenvolvimento do front-end **PI5 App AI**: uma interface web para cadastro, criação, acompanhamento e análise de partidas entre inteligências artificiais no contexto da disciplina PI5 — Aplicações de IA.

O relatório explica **o que foi construído**, **como os componentes se organizam** e **por que** cada escolha foi feita, com base no código atual do repositório.

---

## 1. Contexto e objetivos do sistema

### 1.1 Papel do front-end no ecossistema

O aplicativo **não executa a inteligência artificial**. Ele atua exclusivamente como **cliente visual e operacional** de uma API de competição que gerencia jogadores, partidas e o estado do tabuleiro (inspirado em Santorini, adaptado ao tema acadêmico da faculdade).

As responsabilidades do front-end são:

- apresentar uma interface clara para experimentação acadêmica;
- permitir cadastro de novos bots de IA;
- criar partidas (contra Random Bot ou entre dois jogadores);
- acompanhar partidas em andamento;
- exibir o tabuleiro 5×5, turnos, fases e vencedor;
- facilitar depuração de resultados (IDs, slots, payloads).

### 1.2 Restrições que orientaram as decisões


| Restrição                           | Impacto nas decisões                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| Contexto acadêmico                  | Priorizar simplicidade e legibilidade em vez de infraestrutura de produção      |
| API externa com contrato instável   | Camada defensiva de parsing, fallbacks de payload e comparação tolerante de IDs |
| Múltiplos bots do mesmo grupo       | Lista fixa de jogadores com tokens por variável de ambiente                     |
| Prazo e equipe reduzida             | Componentização pragmática, sem over-engineering                                |
| Demonstração visual em sala de aula | Tema claro/escuro, tabuleiro legível e painéis de debug                         |


---

## 2. Stack tecnológica

### 2.1 Escolhas principais


| Tecnologia                | Versão (aprox.) | Motivação                                                             |
| ------------------------- | --------------- | --------------------------------------------------------------------- |
| **React**                 | 19.x            | Ecossistema maduro, componentização natural, adotado no curso         |
| **Vite**                  | 8.x             | Build rápido, HMR eficiente, configuração mínima                      |
| **React Router**          | 7.x             | Roteamento declarativo por páginas de fluxo                           |
| **react-hook-form**       | 7.x             | Formulários de cadastro com validação sem re-render excessivo         |
| **clsx + tailwind-merge** | —               | Utilitário `cn()` para composição de classes (formulários da feature) |


### 2.2 O que deliberadamente não foi adotado

- **TypeScript**: o projeto permanece em JavaScript para reduzir atrito em um trabalho acadêmico com prazo curto.
- **Biblioteca de UI completa** (MUI, Chakra, etc.): o visual foi construído com CSS próprio para manter identidade do projeto e controle fino do tabuleiro.
- **Gerenciador de estado global** (Redux, Zustand): apenas React Context para o jogador registrado; o restante é estado local por página.
- **WebSockets**: o acompanhamento usa polling de 1 segundo — suficiente para demonstração e mais simples de implementar.

---

## 3. Arquitetura geral

### 3.1 Visão em camadas

```text
┌─────────────────────────────────────────────────────────────┐
│  main.jsx                                                    │
│  └── GameContextProvider (estado global do jogador)         │
│       └── App (BrowserRouter + rotas)                       │
│            └── AppLayout (Navbar, Footer, tema claro/escuro)│
│                 └── Routes (páginas de fluxo)               │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────────────────┐
│  components/     │          │  feature/game/               │
│  (UI reutilizável)│          │  (domínio de cadastro)       │
└──────────────────┘          └──────────────────────────────┘
         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────────────────┐
│  services/api.js │          │  core/helpers/fetch.js       │
│  (fluxos Watch/  │          │  + feature/game/api/         │
│   Battle)        │          │  (fluxo de registro)         │
└──────────────────┘          └──────────────────────────────┘
         │                              │
         └──────────────┬───────────────┘
                        ▼
                 API REST (backend PI5)
```

### 3.2 Estrutura de pastas e responsabilidades

```text
src/
├── main.jsx                 # Bootstrap: StrictMode + GameContextProvider + App
├── app.jsx                  # Definição de rotas
├── app-layout.jsx           # Shell: Navbar, Footer, alternância de tema
│
├── routes/                  # Páginas — orquestram fluxo e chamadas à API
│   ├── HomePage.jsx
│   ├── WatchListPage.jsx
│   ├── WatchGamePage.jsx
│   ├── BattlePage.jsx
│   └── RegisterPage.jsx
│
├── components/              # Componentes visuais compartilhados
│   ├── BoardCell.jsx
│   ├── GameCard.jsx
│   ├── PlayerSelect.jsx
│   ├── WinnerBanner.jsx
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── FeatureCard.jsx
│   └── TeamMember.jsx
│
├── services/
│   └── api.js               # Cliente HTTP legado (Watch / Battle)
│
├── feature/game/            # Módulo de domínio para cadastro de jogadores
│   ├── api/index.js         # Endpoints tipados por função
│   ├── context/game-context.jsx
│   └── components/
│       ├── player-register-form.jsx
│       ├── player-update-form.jsx
│       └── spectator-register-form.jsx
│
├── core/
│   ├── constants/index.js   # API_BASE_URL
│   └── helpers/
│       ├── fetch.js         # apiClient com prefixo api/v1
│       └── index.js         # cn(), resolveWebSocketURL()
│
└── styles/                  # CSS global por área
    ├── global.css
    ├── header-footer.css
    ├── board.css
    ├── pages.css
    └── WatchListPage.css
```

### 3.3 Princípio organizacional: rotas orquestram, componentes apresentam

As **rotas** concentram a lógica de negócio de cada fluxo (criar partida, fazer join, polling, validação de slots). Os **componentes** em `components/` são, em geral, apresentacionais ou encapsulam um pedaço de UI reutilizável (célula do tabuleiro, card de partida, seletor de jogador).

Essa separação evita que `BoardCell` ou `GameCard` precisem conhecer a API — eles recebem apenas props derivadas do estado da partida.

---

## 4. Decisão central: duas camadas de integração HTTP

Durante a evolução do projeto, surgiram **dois clientes HTTP** com propósitos distintos. Isso não é um ideal de longo prazo, mas reflete uma migração incremental consciente.

### 4.1 `services/api.js` — fluxos de partida (Watch e Battle)

**Usado por:** `WatchListPage`, `WatchGamePage`, `BattlePage`, `PlayerSelect`.

**Características:**

- URL base direta via `VITE_API_BASE_URL` (sem prefixo `api/v1`);
- token mutável em memória com `api.setToken()`;
- suporte a token padrão via `VITE_API_TOKEN` ou `VITE_API_TOKEN_PALERMABOT`;
- tratamento de erro com `status`, `data` e `detail` preservados no objeto de erro;
- parsing seguro do corpo (JSON ou texto).

**Motivação:** os fluxos de listagem, criação e acompanhamento de partidas foram implementados primeiro, com uma API enxuta e acoplada ao uso imediato das telas Watch/Battle. A troca de token por jogador (`PlayerSelect` chama `api.setToken` ao selecionar) resolve autenticação multi-bot sem persistência complexa nesses fluxos.

### 4.2 `core/helpers/fetch.js` + `feature/game/api/` — fluxo de cadastro

**Usado por:** formulários em `feature/game/components/`.

**Características:**

- monta URL com `resolve('api/v1', path)` via biblioteca `pathe`;
- token lido de `localStorage` (`accessToken`), sincronizado pelo `GameContextProvider`;
- funções nomeadas por endpoint (`registerPlayer`, `joinGame`, `listGames`, etc.).

**Motivação:** o cadastro de jogadores exige **persistência de sessão** (token retornado no registro). O Context + `localStorage` + `setAccessToken` centralizam essa preocupação. A pasta `feature/game/` agrupa API, contexto e formulários do mesmo domínio — padrão de *feature folder* que facilita evolução futura (ex.: unificar todos os fluxos neste módulo).

### 4.3 Por que não unificar imediatamente?

Unificar exigiria refatorar Watch/Battle para o novo `apiClient`, alinhar prefixos de URL e estratégia de token. Para o escopo acadêmico, mantivemos os fluxos estáveis funcionando enquanto o módulo de registro foi estruturado de forma mais limpa. A unificação é listada como melhoria futura natural.

---

## 5. Estado global: `GameContextProvider`

Arquivo: `src/feature/game/context/game-context.jsx`

### 5.1 O que é armazenado


| Estado      | Persistência                 | Uso                                             |
| ----------- | ---------------------------- | ----------------------------------------------- |
| `player`    | `localStorage` (`player`)    | Dados do bot registrado + `player_access_token` |
| `spectator` | `localStorage` (`spectator`) | Mapa de espectadores por `game_id`              |


### 5.2 Comportamento e motivações

1. **Hidratação no mount:** `useState(() => readStoredValue(...))` restaura sessão após refresh — essencial para não perder o token após recarregar a página de registro.
2. **Sincronização de token:** `useEffect` em `player` chama `setAccessToken(player?.player_access_token)`, ligando Context ao `apiClient` da feature.
3. `**logout`:** limpa jogador e espectador — ponto de extensão para futura área de perfil.
4. **Escopo limitado:** apenas cadastro e formulários relacionados usam o Context; Watch/Battle não dependem dele, evitando acoplamento desnecessário.

### 5.3 Montagem na árvore React

Em `main.jsx`, o provider envolve `<App />` **fora** do router. Assim, qualquer rota (presente ou futura) pode consumir `useGameContext()` sem reconfigurar o router.

---

## 6. Roteamento e layout

### 6.1 Rotas definidas


| Rota         | Componente      | Responsabilidade                     |
| ------------ | --------------- | ------------------------------------ |
| `/`          | `HomePage`      | Landing, equipe, CTAs                |
| `/watch`     | `WatchListPage` | Listar partidas, criar vs Random Bot |
| `/watch/:id` | `WatchGamePage` | Acompanhar partida com polling       |
| `/registro`  | `RegisterPage`  | Cadastro de novo bot                 |
| `/battle`    | `BattlePage`    | Criar batalha entre dois jogadores   |


### 6.2 `AppLayout` como shell fixo

`AppLayout` concentra três preocupações transversais:

1. **Navbar** com links de navegação;
2. **Footer** institucional;
3. **Tema claro/escuro** via classe `dark-mode` no container raiz.

O estado `isDark` é inicializado a partir de `localStorage.getItem("theme")` e persistido em `useEffect`. A alternância por **classe CSS** (e não por Context de tema) foi escolhida por simplicidade: qualquer folha de estilo pode reagir a `.dark-mode` sem importar hooks.

### 6.3 Alias de importação `@/`

Configurado em `vite.config.js` e `jsconfig.json`:

```javascript
"@": path.resolve(workingDirectory, "src")
```

**Motivação:** imports estáveis (`@/routes/HomePage`) em vez de caminhos relativos frágeis (`../../../routes/HomePage`), especialmente dentro de `feature/game/`.

---

## 7. Componentes: como foram criados e montados

### 7.1 Componentes de layout e marketing

#### `Navbar` e `Footer`

- **Papel:** navegação persistente e rodapé com créditos da equipe.
- **Decisão:** componentes simples, sem estado próprio; recebem apenas `isDark`/`setIsDark` na Navbar.
- **Motivação:** manter o header/footer desacoplados das regras de jogo.

#### `FeatureCard` e `TeamMember`

- **Papel:** seções da home (pilares do projeto e equipe).
- **Decisão:** props mínimas (`title`, `description`, `icon`, `typeClass` / `name`, `linkedinUrl`).
- **Motivação:** composição declarativa na `HomePage` sem lógica interna.

### 7.2 Componentes do domínio do jogo

#### `BoardCell`

- **Entrada:** `level` (número) e `professor` (string ou null).
- **Saída visual:** célula com classe `level-{n}`, texto de “ano acadêmico” e badge do professor.
- **Decisão de domínio:** níveis 0–3 viram “1º Ano” … “4º Ano”; nível ≥ 4 vira **“GRADUADO”** em dourado.
- **Decisão de times:** professores `CLARO` e `REY` → `team-1`; demais → `team-2`.
- **Motivação:** traduzir abstração do motor de jogo (níveis Santorini) para metáfora visual da faculdade, facilitando entendimento em apresentações.

**Montagem:** `WatchGamePage` faz duplo `map` na matriz `data.board` e instancia uma `BoardCell` por coordenada, com `key` estável `${rowIndex}-${colIndex}`.

#### `GameCard`

- **Papel:** representar uma partida na listagem (`WatchListPage`).
- **Subcomponentes internos:** `Avatar`, `PlayerBlock` — não exportados, pois só fazem sentido aqui.
- **Lógica defensiva embutida:** funções `getWinnerId`, `getTuringId`, `getLovelaceId`, `sameId`, `getWinnerName` duplicam padrão usado em `WatchGamePage`.
- **Estilo:** bloco `<style>` scoped com variáveis CSS (`--gc-card-bg`, etc.) e media queries para mobile.
- **Motivação do estilo inline no componente:** o card precisava de tema claro/escuro refinado sem poluir o CSS global; variáveis locais permitem override via `.dark-mode .gc-card`.

#### `PlayerSelect`

- **Papel:** lista fixa `PLAYERS` com `id`, `name` e `token` (de variáveis `VITE_API_TOKEN_`*).
- **Comportamento:** ao mudar seleção, chama `api.setToken(playerEncontrado.token)` antes de propagar `onChange`.
- **Variantes:** `variant="watchlist"` vs padrão `"arena"` — layouts diferentes para a mesma lógica.
- **Motivação da lista hardcoded:** no contexto do projeto, os bots do grupo (PalermaBot V1/V2/V3) são conhecidos e estáveis; evita chamada extra à API e garante tokens corretos por bot no `.env`.

#### `WinnerBanner`

- Componente criado para exibir vitória de forma destacada.
- **Estado atual:** não é utilizado em `WatchGamePage`, que implementou banner compacto inline (`winnerCompact` + variáveis `--wg-winner-`*).
- **Motivação da divergência:** a tela de acompanhamento evoluiu para um painel unificado (turno, status, fase, jogadores, vencedor, debug); o banner separado ficou redundante, mas o componente permanece disponível para reutilização.

### 7.3 Formulários da feature `game`

#### `PlayerRegisterForm`

- **Biblioteca:** `react-hook-form` com `Controller` por campo.
- **Validação:** campos obrigatórios com mensagens em português.
- **Fluxo:** `registerPlayer(dto)` → valida `player_access_token` → `setPlayer(response)` → `alert` com ID e token.
- **Estilo visual:** reutiliza classes existentes (`player-select-dropdown`, `cta-button`) para **consistência** com `BattlePage`, em vez do estilo Tailwind-like dos outros formulários da feature.
- **Motivação:** o cadastro é rota voltada ao usuário final do torneio; deve parecer parte do mesmo produto que Battle/Watch.

#### `PlayerUpdateForm` e `SpectatorRegisterForm`

- Estrutura similar com `react-hook-form` e `cn()`.
- **Estado:** preparados para evolução (atualizar endpoint, registrar espectador), mas ainda não integrados a rotas principais.
- **Motivação:** antecipar endpoints da API sem bloquear entrega das telas core.

---

## 8. Páginas (rotas): fluxos e decisões de implementação

### 8.1 `HomePage`

- Página estática de apresentação.
- CTAs para `/watch` e `/battle`.
- **Decisão:** zero chamadas à API — carregamento instantâneo e independência de backend para primeira impressão.

### 8.2 `WatchListPage`

**Fluxos:**

1. `fetchGamesList()` → `GET /games?page=1&page_size=20`
2. `createNewGame()` → valida jogador e slot → `POST /games` com `vs_random_bot: true`

**Decisões:**

- Formulário de criação **na própria listagem** (não em modal separado) — menos cliques para testes repetidos em laboratório.
- Seleção de **slot 1 ou 2** explícita — o backend associa jogador a Turing/Lovelace por slot; expor isso evita confusão em depuração.
- `getErrorDetail()` normaliza erros FastAPI (array de `detail`, objeto, string) para `alert` legível.
- Estilos dedicados em `WatchListPage.css` — a página tem layout próprio (painel, grid, botões) sem afetar outras rotas.

### 8.3 `WatchGamePage`

**Fluxo principal:**

```text
mount → fetchGame() → setInterval(1000ms) → fetchGame() → unmount clearInterval
```

**Decisões:**


| Decisão                                                  | Motivação                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| Polling de 1s                                            | Simples, funciona com API REST existente, adequado para demo acadêmica |
| Não limpar UI em erro após primeiro sucesso              | Evita “piscar” se uma requisição falhar transientemente                |
| `loggedFinishedGameRef` + `console.table` ao finalizar   | Ferramenta de depuração para validar resolução de vencedor             |
| Painel `InfoPill`                                        | Informação densa (turno, status, fase, IDs) em layout responsivo       |
| Bloco `<details>` “Dados técnicos”                       | Debug visível para professores/alunos sem poluir UI principal          |
| Variáveis CSS `--wg-`* + override `.dark-mode`           | Tema consistente sem prop drilling                                     |
| Tabuleiro ampliado via classes `.watch-game-board-large` | Legibilidade em projeção / monitor                                     |


**Resolução de vencedor:** múltiplos campos candidatos (`winner_player_id`, `winner_id`, `winner?.id`, etc.) e comparação com `sameId()` (coerção para string). Essa robustez nasceu de inconsistências reais entre formatos de resposta da API.

### 8.4 `BattlePage`

Este é o fluxo mais complexo do aplicativo — reflete a **orquestração multi-etapa** exigida pela API.

**Sequência:**

```text
1. Validar jogador local e ID do adversário
2. api.setToken(token do jogador selecionado)
3. POST /games (createGameWithSlot)
4. POST /games/{id}/join (joinOpponent) — se adversário ainda não está na partida
5. GET /games/{id} — confirmar estado
6. Validar slots (validateSlotsOrThrow)
7. POST /games/{id}/start (startGameIfPossible)
8. navigate(/watch/{gameId})
```

**Decisões defensivas e suas motivações:**

1. `**postTryingPayloads`:** tenta variações de payload (`team_slot` como número ou string, `opponent_id` vs `player_id`) quando API retorna 400/422 — acomodar versões diferentes do contrato sem quebrar a demo.
2. `**getPlayerSlot` / `validateSlotsOrThrow`:** detectar quando o backend ignora ou inverte slots — bug crítico em competição; melhor falhar com mensagem clara do que exibir partida errada.
3. `**gameContainsPlayer`:** verifica presença do adversário em múltiplas estruturas (`turing_player`, `players[]`, `participants[]`, etc.) — resposta da API nem sempre é normalizada.
4. `**startGameIfPossible`:** trata “already started” como sucesso — alguns backends iniciam automaticamente após join.
5. **Reuso de `PlayerSelect`:** centraliza lista de bots e troca de token — mesma fonte de verdade que Watch.

### 8.5 `RegisterPage`

- **Thin page:** apenas título, subtítulo e `<PlayerRegisterForm />`.
- **Motivação:** separar apresentação (copy da página) de lógica (form na feature); padrão fácil de estender com `PlayerUpdateForm` no futuro.

---

## 9. Estilização e experiência visual

### 9.1 Estratégia híbrida de CSS

O projeto combina três abordagens:

1. **CSS global por área** (`global.css`, `board.css`, `pages.css`, …) — reset, tema base, tabuleiro, hero da home.
2. **CSS de página** (`WatchListPage.css`) — layout específico de alta complexidade.
3. **CSS co-localizado** em `<style>` dentro de `GameCard` e `WatchGamePage` — componentes com tema próprio e responsividade fina.

**Motivação:** nem tudo justificava extrair para arquivo global; componentes com muitas variáveis de tema foram mantidos próximos ao JSX para facilitar manutenção visual.

### 9.2 Modo claro e escuro

- Alternância em `AppLayout` adiciona classe `dark-mode` no wrapper.
- Componentes sensíveis usam **variáveis CSS** em vez de cores fixas em `style={{}}` quando precisam reagir ao tema.
- `global.css` define variáveis para formulários (`--player-select-bg`, etc.).

### 9.3 Tabuleiro (`board.css` + `BoardCell`)

- Grid 5×5 com células dimensionadas em CSS.
- `WatchGamePage` aplica overrides responsivos (92px → 78px → 58px) para mobile.
- **Motivação:** o tabuleiro é o elemento central da experiência; merece folha de estilo dedicada e breakpoints explícitos.

---

## 10. Configuração, ambiente e segurança

### 10.1 Variáveis de ambiente (Vite)


| Variável                                         | Uso                    |
| ------------------------------------------------ | ---------------------- |
| `VITE_API_BASE_URL`                              | URL do backend         |
| `VITE_API_TOKEN`                                 | Token padrão opcional  |
| `VITE_API_TOKEN_PALERMABOT`                      | Token do PalermaBot V1 |
| `VITE_API_TOKEN_PALERMA_LOOKAHEAD_V2_TURBO_VTEC` | Token V2               |
| `VITE_API_TOKEN_BOBOCA`                          | Token V3               |


**Decisão:** tokens por bot no front-end são aceitáveis no contexto de laboratório com `.env` local não versionado; **nunca** devem ir para repositório público.

### 10.2 Porta do dev server

`vite.config.js` define `server.port: 5000` — evita conflito com outras ferramentas na 5173 e padroniza ambiente da equipe.

### 10.3 `StrictMode`

React `StrictMode` em `main.jsx` — ajuda a detectar efeitos colaterais duplicados em desenvolvimento (ex.: intervals, subscriptions).

---

## 11. Tratamento de erros e observabilidade

### 11.1 Padrões adotados

- `**console.error`** em falhas de rede com contexto.
- `**console.table**` em eventos críticos (vencedor resolvido, slots na Battle).
- `**alert()**` para erros voltados ao usuário em fluxos de criação/registro — simples, sem dependência de biblioteca de toast.

### 11.2 Por que alerts em vez de UI de erro sofisticada?

Em ambiente acadêmico, `alert` garante que falhas de API (payload inválido, slot invertido, token ausente) sejam **impossíveis de ignorar** durante testes. Uma barra de notificação poderia ser filtrada ou perdida entre abas.

---

## 12. Evolução do código: legado vs. feature module

```text
Fase inicial (núcleo do produto)
├── services/api.js
├── routes/Watch*, Battle
└── components/ compartilhados

Fase de expansão (cadastro e persistência)
├── feature/game/
├── core/helpers/fetch.js
└── GameContextProvider
```

A coexistência é **intencional e documentada**. O caminho de consolidação recomendado:

1. Migrar Watch/Battle para `feature/game/api` + `apiClient`;
2. Unificar estratégia de token (Context ou serviço único);
3. Extrair helpers `sameId`, `getWinnerName`, etc. para `core/helpers/game.js` — hoje duplicados em `GameCard` e `WatchGamePage`;
4. Integrar ou remover `WinnerBanner` conforme design final;
5. Conectar `PlayerUpdateForm` e `SpectatorRegisterForm` às rotas.

---

## 13. Fluxos de usuário sintetizados

### 13.1 Assistir e criar partida contra Random Bot

```text
Home → Watch → selecionar jogador + slot → Nova partida
     → lista atualizada → Assistir → WatchGame (polling)
```

### 13.2 Batalha entre dois bots

```text
Home → Battle → selecionar jogador + ID adversário + slot
     → orquestração create/join/start → WatchGame
```

### 13.3 Registrar novo bot

```text
Home → Registrar Jogador → formulário → API POST /players
     → token salvo no Context/localStorage → uso manual do ID/token na Battle
```

---

## 14. Lições aprendidas e decisões que se mostraram acertadas

1. **Comparação tolerante de IDs (`sameId`)** — eliminou falsos “vencedor indefinido” quando API misturava number/string.
2. **Validação de slots na Battle** — expôs problemas do backend cedo, com mensagens acionáveis.
3. **Separação rota vs. componente** — permitiu evoluir `WatchGamePage` (debug, tema, layout) sem tocar no tabuleiro.
4. **Lista `PLAYERS` centralizada** — uma única fonte para tokens e nomes em Watch e Battle.
5. **Feature folder para cadastro** — isolou persistência e formulários do restante do app.
6. **Polling com cleanup** — `clearInterval` no `useEffect` evita vazamento de requisições ao sair da página.

---

## 15. Melhorias futuras alinhadas à arquitetura atual


| Melhoria                                      | Benefício                                                  |
| --------------------------------------------- | ---------------------------------------------------------- |
| Unificar camada HTTP                          | Menos duplicação, um contrato de URL/token                 |
| Extrair helpers de domínio (`game.js`)        | DRY em vencedor, slots, nomes de jogador                   |
| WebSocket ou SSE                              | Menor latência e carga no acompanhamento                   |
| Substituir `alert` por componente de feedback | UX mais polida mantendo visibilidade de erros              |
| Testes com Vitest + Testing Library           | Proteger `sameId`, `validateSlotsOrThrow`, fluxos críticos |
| Usar `WinnerBanner` ou remover arquivo morto  | Clareza no design system interno                           |
| Rota para atualização de endpoint do bot      | Ativar `PlayerUpdateForm` já implementado                  |


---

## 16. Conclusão

O **PI5 App AI** foi estruturado como um front-end **orientado a fluxos acadêmicos**: cada rota representa um caso de uso claro (listar, assistir, batalhar, registrar), apoiada por componentes visuais reutilizáveis e por camadas de API que evoluíram junto com os requisitos.

As decisões prioritizaram **clareza para demonstração**, **tolerância a inconsistências da API** e **modularidade pragmática** — da metáfora visual do tabuleiro à orquestração defensiva da Arena de Batalha. A arquitetura híbrida (núcleo `services/` + módulo `feature/game/`) reflete essa evolução incremental e deixa um caminho natural de consolidação sem comprometer o que já funciona em produção acadêmica.

---

*Documento gerado com base na estrutura e no código do repositório* `pi5-app-ai`*.*

*Equipe: Eric Donato, Paula Martins, Matheus Henrique* 

*orientação Prof. Guilherme Rey.*
