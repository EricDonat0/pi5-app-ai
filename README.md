# PI5 App AI

Interface web para cadastro, criação, acompanhamento e análise de partidas entre inteligências artificiais no projeto PI5 - Aplicações de IA.

Este repositório contém o front-end do sistema, responsável por conectar o usuário à API principal da competição, permitir o registro de jogadores, iniciar batalhas entre bots, acompanhar partidas em tempo real e visualizar o estado final do tabuleiro.

O projeto foi desenvolvido com foco acadêmico, modularidade e clareza visual, servindo como camada de interação para experimentos com agentes autônomos em jogos de estratégia determinísticos inspirados em Santorini.

---

## Sumário

- [Visão geral](#visão-geral)
- [Objetivos do front-end](#objetivos-do-front-end)
- [Arquitetura da aplicação](#arquitetura-da-aplicação)
- [Principais funcionalidades](#principais-funcionalidades)
- [Fluxo de uso](#fluxo-de-uso)
- [Estrutura sugerida do projeto](#estrutura-sugerida-do-projeto)
- [Componentes principais](#componentes-principais)
- [Rotas principais](#rotas-principais)
- [Integração com a API](#integração-com-a-api)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Instalação e execução](#instalação-e-execução)
- [Criação de partidas](#criação-de-partidas)
- [Acompanhamento de partidas](#acompanhamento-de-partidas)
- [Tratamento de vencedor](#tratamento-de-vencedor)
- [Modo claro e modo escuro](#modo-claro-e-modo-escuro)
- [Boas práticas adotadas](#boas-práticas-adotadas)
- [Possíveis melhorias futuras](#possíveis-melhorias-futuras)
- [Licença e contexto acadêmico](#licença-e-contexto-acadêmico)

---

## Visão geral

O `pi5-app-ai` é a aplicação cliente do ecossistema PI5. Sua função é fornecer uma interface gráfica para interagir com jogadores de IA cadastrados em uma API de competição.

A aplicação permite:

- visualizar partidas existentes;
- criar novas partidas contra Random Bot;
- criar batalhas entre dois jogadores de IA;
- assistir partidas em andamento;
- consultar status, turno, fase e vencedor;
- visualizar o tabuleiro 5x5 da arena;
- alternar entre modo claro e modo escuro;
- trabalhar com múltiplos bots cadastrados no projeto.

O front-end não executa a inteligência artificial diretamente. Ele atua como cliente visual e operacional, chamando endpoints HTTP da API responsável por gerenciar jogadores, partidas e estados do jogo.

---

## Objetivos do front-end

O objetivo principal deste repositório é oferecer uma interface simples, confiável e adequada para experimentação acadêmica com agentes de IA.

Entre os objetivos específicos estão:

1. Facilitar o cadastro e seleção de jogadores de IA.
2. Permitir a criação de confrontos entre bots.
3. Exibir partidas em tempo real de forma visualmente compreensível.
4. Apresentar o estado do tabuleiro e seus níveis.
5. Mostrar informações técnicas relevantes, como IDs de jogadores e vencedor.
6. Auxiliar na depuração de resultados de partidas.
7. Separar claramente responsabilidades entre interface, serviços e componentes.

---

## Arquitetura da aplicação

A aplicação segue uma organização típica de front-end React:

```text
src/
  components/
    BoardCell.jsx
    GameCard.jsx
    PlayerSelect.jsx
    WinnerBanner.jsx

  routes/
    BattlePage.jsx
    WatchListPage.jsx
    WatchGamePage.jsx
    RegisterPlayerPage.jsx
    HomePage.jsx

  services/
    api.js

  App.jsx
  main.jsx
```

A arquitetura é orientada a componentes reutilizáveis. As páginas de rota organizam o fluxo de negócio, enquanto os componentes encapsulam elementos visuais reutilizados em diferentes telas.

---

## Principais funcionalidades

### Listagem de partidas

A tela de listagem consulta a API principal e exibe as partidas mais recentes. Cada partida é apresentada em um card contendo:

- jogador Turing;
- jogador Lovelace;
- status da partida;
- turno atual;
- vencedor, quando a partida está finalizada;
- botão para assistir.

### Criação de partidas contra Random Bot

A aplicação permite selecionar um jogador conhecido no front-end e criar uma partida contra um bot aleatório gerenciado pelo backend.

O payload típico é:

```javascript
const payload = {
    player_id: playerEncontrado.id,
    team_slot: 1,
    vs_random_bot: true,
};
```

### Criação de batalhas entre jogadores

A tela de batalha permite selecionar um jogador próprio e informar o ID do adversário. O fluxo ideal é:

```text
1. Criar partida com o primeiro jogador.
2. Inserir o adversário por meio do endpoint de join.
3. Confirmar se os dois jogadores entraram.
4. Iniciar a partida.
5. Redirecionar para a tela de acompanhamento.
```

### Acompanhamento em tempo real

A tela de assistir jogo consulta periodicamente a API usando `setInterval`, atualizando o estado da partida a cada segundo.

Isso permite acompanhar:

- setup inicial;
- fase de batalha;
- movimentos dos professores;
- evolução dos níveis do tabuleiro;
- conclusão da partida.

---

## Fluxo de uso

Um fluxo comum de uso é:

```text
1. Acessar a aplicação.
2. Selecionar ou registrar um jogador.
3. Criar uma partida na tela Watch ou Battle.
4. Aguardar o início da partida.
5. Abrir a tela de visualização.
6. Observar o tabuleiro e o andamento dos turnos.
7. Verificar o vencedor ao final.
```

---

## Componentes principais

### `GameCard.jsx`

Responsável por renderizar cada partida na lista.

Exibe:

- nomes dos jogadores;
- avatares dos jogadores, quando disponíveis;
- status ou vencedor;
- link para assistir a partida.

Uma implementação segura deve comparar IDs de forma tolerante, pois APIs podem retornar IDs como número ou string:

```javascript
function sameId(a, b) {
    if (a === undefined || a === null || b === undefined || b === null) {
        return false;
    }

    return String(a) === String(b);
}
```

Essa abordagem evita erros em comparações como:

```javascript
134 === "134" // false
String(134) === String("134") // true
```

### `BoardCell.jsx`

Representa uma célula individual do tabuleiro.

Cada célula deve exibir:

- nível atual;
- professor posicionado;
- estilo visual de acordo com altura ou ocupação.

O tabuleiro é uma matriz 5x5, renderizada por meio de `map` duplo:

```jsx
{data.board.map((row, rowIndex) =>
    row.map((cell, colIndex) => (
        <BoardCell
            key={`${rowIndex}-${colIndex}`}
            level={cell.level}
            professor={cell.professor}
        />
    ))
)}
```

### `PlayerSelect.jsx`

Centraliza a seleção dos jogadores cadastrados no front-end.

Esse componente permite evitar repetição de listas de jogadores em múltiplas telas.

### `WinnerBanner.jsx`

Componente visual usado para destacar o vencedor de uma partida finalizada.

---

## Rotas principais

### Home

Página inicial da aplicação.

Deve apresentar o contexto do projeto, navegação principal e acesso às funcionalidades.

### Watch

Página de listagem das partidas.

Responsável por consultar:

```text
GET /games?page=1&page_size=20
```

### Watch Game

Página de acompanhamento de uma partida específica.

Consulta:

```text
GET /games/{id}
```

Atualiza periodicamente os dados da partida.

### Registrar Jogador

Página destinada ao cadastro de novos jogadores de IA.

### Batalhar

Página para criar confronto entre dois jogadores específicos.

---

## Integração com a API

A integração HTTP é centralizada em `src/services/api.js`.

Uma camada de API centralizada é importante para:

- evitar repetição de `fetch`;
- padronizar headers;
- padronizar tratamento de erros;
- permitir troca de token em tempo de execução;
- facilitar manutenção.

Exemplo de estrutura recomendada:

```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
let currentToken = import.meta.env.VITE_API_TOKEN;

const getHeaders = () => ({
    "accept": "application/json",
    "Content-Type": "application/json",
    ...(currentToken ? { "Authorization": `Bearer ${currentToken}` } : {})
});
```

É importante não enviar `Authorization: Bearer undefined`, pois isso pode gerar falhas de autenticação difíceis de diagnosticar.

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis necessárias.

Exemplo:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TOKEN=seu_token_aqui
```

Em alguns cenários, também pode ser útil trabalhar com tokens específicos por jogador.

Exemplo:

```env
VITE_API_TOKEN_PALERMABOT=token_do_palermabot
```

Nunca versionar tokens reais em repositórios públicos.

---

## Instalação e execução

### Pré-requisitos

- Node.js 18 ou superior;
- npm ou yarn;
- API principal disponível;
- jogadores cadastrados na API.

### Instalação

```bash
npm install
```

### Execução em desenvolvimento

```bash
npm run dev
```

A aplicação normalmente fica disponível em:

```text
http://localhost:5173
```

### Build de produção

```bash
npm run build
```

### Pré-visualização do build

```bash
npm run preview
```

---

## Criação de partidas

A criação de partidas depende do backend principal.

Para partidas contra Random Bot, o payload típico é:

```javascript
{
    player_id: 134,
    team_slot: 1,
    vs_random_bot: true
}
```

Para partidas entre dois jogadores, o fluxo recomendado é:

```text
POST /games
POST /games/{gameId}/join
POST /games/{gameId}/start
```

A aplicação deve validar:

- se o jogador selecionado existe;
- se o ID do adversário é válido;
- se o adversário entrou na partida;
- se a partida retornou um ID válido;
- se o start foi executado ou se a partida já iniciou automaticamente.

---

## Acompanhamento de partidas

A página de acompanhamento usa polling a cada segundo:

```javascript
useEffect(() => {
    if (!id) return;

    fetchGame();

    const intervalId = setInterval(() => {
        fetchGame();
    }, 1000);

    return () => clearInterval(intervalId);
}, [id]);
```

Esse mecanismo é simples e suficiente para o contexto acadêmico. Em uma aplicação de produção, WebSockets poderiam reduzir latência e carga de requisições.

---

## Tratamento de vencedor

Um ponto crítico do projeto é identificar corretamente o vencedor.

Uma lógica frágil seria:

```javascript
const winnerName = game.winner_player_id === turingPlayer?.id
    ? player1Name
    : player2Name;
```

Essa lógica pode errar quando:

- `winner_player_id` vem como string;
- `turingPlayer.id` vem como número;
- o backend retorna outro campo de vencedor;
- o vencedor está indefinido;
- o segundo jogador ainda não entrou.

A abordagem recomendada é:

```javascript
function getWinnerName(game, player1Name, player2Name) {
    const winnerId = game?.winner_player_id ?? game?.winner_id ?? game?.winner?.id;
    const turingId = game?.turing_player?.id ?? game?.turing_player_id;
    const lovelaceId = game?.lovelace_player?.id ?? game?.lovelace_player_id;

    if (sameId(winnerId, turingId)) {
        return player1Name;
    }

    if (sameId(winnerId, lovelaceId)) {
        return player2Name;
    }

    return "Indefinido";
}
```

Isso torna a interface mais confiável e evita interpretações incorretas dos resultados.

---

## Modo claro e modo escuro

O projeto possui alternância visual entre modo claro e escuro.

Para que uma tela respeite corretamente o tema, evite cores fixas diretamente em `style={...}` quando elas precisam variar com o tema.

Prefira variáveis CSS:

```css
.watch-game-page-theme {
    --wg-title: #0f172a;
    --wg-panel-bg: #ffffff;
}

.dark-mode .watch-game-page-theme {
    --wg-title: #f5f6fa;
    --wg-panel-bg: #1e2a32;
}
```

No componente:

```javascript
const styles = {
    title: {
        color: "var(--wg-title)",
    },
    compactPanel: {
        background: "var(--wg-panel-bg)",
    },
};
```

Essa abordagem mantém o componente compatível com ambos os temas.

---

## Boas práticas adotadas

- Centralização das chamadas HTTP em `api.js`.
- Componentização da interface.
- Separação entre rotas e componentes visuais.
- Uso de polling controlado com limpeza de intervalo.
- Comparação segura de IDs.
- Tratamento explícito de estados de carregamento e erro.
- Interface adaptada para depuração acadêmica.
- Suporte visual para modo claro e escuro.

---

## Possíveis melhorias futuras

- Implementar WebSocket para partidas em tempo real.
- Adicionar histórico completo de movimentos.
- Exibir motivo da vitória: vitória por nível, timeout, jogada inválida ou ausência de movimento.
- Criar tela de análise estatística por jogador.
- Adicionar filtros na lista de partidas.
- Permitir exportação de partidas em JSON.
- Criar replay turno a turno.
- Exibir logs da IA diretamente no front-end.
- Melhorar validação de criação de batalhas com escolha explícita de slot.
- Adicionar testes automatizados de componentes.

---

## Licença e contexto acadêmico

Este projeto foi desenvolvido no contexto da disciplina PI5 - Aplicações de IA, com o objetivo de estudar integração entre front-end, APIs, jogos determinísticos e agentes autônomos.

O front-end atua como ferramenta de visualização, controle e análise para experimentos com inteligências artificiais em ambiente competitivo.