# REPORT.md - PI5 App AI

## Visão geral

Este repositório contém o front-end do projeto PI5 - Aplicações de IA. A aplicação foi construída em React com Vite e tem como objetivo permitir o cadastro de jogadores de IA, a criação de partidas, a listagem de jogos e a visualização do estado de uma partida no papel de espectador.

Durante o desenvolvimento, a principal preocupação foi deixar a aplicação simples de usar durante os testes do torneio. Por isso, priorizamos telas diretas, com poucos passos para registrar um bot, iniciar uma partida e acompanhar o tabuleiro. Também buscamos separar responsabilidades entre páginas, componentes e serviços para evitar que toda a lógica ficasse concentrada em um único arquivo.

## Estrutura principal do projeto

A estrutura mais importante do front-end ficou organizada da seguinte forma:

```text
src/
  app.jsx
  app-layout.jsx
  main.jsx
  components/
    BoardCell.jsx
    GameCard.jsx
    Navbar.jsx
    Footer.jsx
    PlayerSelect.jsx
    WinnerBanner.jsx
  feature/
    game/
      api/
      components/
      context/
  routes/
    HomePage.jsx
    RegisterPage.jsx
    BattlePage.jsx
    WatchListPage.jsx
    WatchGamePage.jsx
  services/
    api.js
  styles/
    board.css
    global.css
    header-footer.css
    pages.css
    WatchListPage.css
```

A pasta `routes` concentra as telas principais da aplicação. A pasta `components` guarda partes reutilizáveis da interface, como cards, tabuleiro, navbar e seleção de jogador. A pasta `services` possui a comunicação mais direta com a API da arena. Já a pasta `feature/game` concentra parte da integração com a API do professor, incluindo cadastro de jogador, contexto e funções de requisição.

## Decisões de componentes

### `App` e `AppLayout`

O componente `App` ficou responsável pela definição das rotas principais da aplicação. As rotas utilizadas foram:

- `/`: página inicial;
- `/registro`: cadastro de jogador de IA;
- `/battle`: criação de uma batalha contra outro jogador;
- `/watch`: listagem de partidas;
- `/watch/:id`: tela de acompanhamento de uma partida específica.

A decisão de criar um `AppLayout` separado foi tomada para evitar repetição de estrutura visual. Dessa forma, o cabeçalho, o rodapé e o controle de tema claro/escuro ficam em volta de todas as telas. Isso deixou as páginas mais focadas em suas próprias responsabilidades.

O tema claro/escuro foi salvo no `localStorage`, pois é uma preferência local do usuário e não precisa ser enviada para a API. Essa escolha também permite que, ao recarregar a página, o tema escolhido anteriormente seja mantido.

### `PlayerRegisterForm`

O formulário de cadastro de jogador foi separado dentro da pasta `feature/game/components`, pois ele representa uma funcionalidade específica da integração com a arena. Ele coleta os dados exigidos para cadastrar uma IA, como nome do grupo, nome do jogador, avatar, descrição e endpoint de movimento.

A biblioteca `react-hook-form` foi utilizada para facilitar o controle dos campos e das validações obrigatórias. Essa escolha ajudou a reduzir a quantidade de estados manuais no formulário e deixou mais claro quais campos eram obrigatórios.

Após o cadastro, a resposta da API retorna o `id` do jogador e o `player_access_token`. Esses dados são exibidos ao usuário em um alerta, pois são informações importantes para criar partidas posteriormente.

### Inserção do access token no `localStorage`

Um requisito importante da entrega era armazenar o access token do jogador no `localStorage`. Isso foi feito através do `GameContextProvider`, que mantém o jogador cadastrado no estado global da aplicação e também o persiste no navegador.

Quando um jogador é salvo no contexto, o objeto completo do jogador é armazenado em `localStorage` na chave `player`. Além disso, o token é salvo separadamente na chave `accessToken`, por meio da função `setAccessToken`. Essa decisão foi tomada para facilitar o uso do token em requisições autenticadas, sem precisar ficar procurando o token dentro do objeto completo do jogador em toda chamada à API.

Esse fluxo permite que o usuário cadastre uma IA, recarregue a página e ainda mantenha os dados necessários para interagir com a arena.

### `PlayerSelect`

O componente `PlayerSelect` foi criado para centralizar a seleção dos jogadores disponíveis para criação de partidas. A motivação foi evitar repetir a lista de jogadores em várias telas, principalmente na tela de batalha e na tela de criação de partida contra o Random Bot.

Nele, cada jogador possui:

- `id`, usado pela API da arena;
- `name`, usado na interface;
- `token`, usado para autenticar as ações daquele jogador.

Durante os testes, mantivemos jogadores fixos no front-end para facilitar a demonstração dos bots desenvolvidos pelo grupo. Isso ajudou bastante no momento de apresentar e testar rapidamente as versões da IA, sem precisar cadastrar tudo de novo a cada execução.

### `WatchListPage`

A `WatchListPage` é a tela responsável pela listagem de partidas. Ela faz uma requisição para `/games?page=1&page_size=20` e renderiza os resultados usando o componente `GameCard`.

Além de listar partidas, essa tela também permite criar uma nova partida contra o Random Bot. Para isso, o usuário seleciona o jogador e o slot desejado. O payload enviado para a API segue a estrutura:

```json
{
  "player_id": 123,
  "team_slot": 1,
  "vs_random_bot": true
}
```

A decisão de colocar a criação contra Random Bot nessa tela foi prática: durante os testes, era comum criar uma partida e logo em seguida acompanhar o resultado. Deixar os dois recursos próximos reduziu o número de cliques e facilitou a apresentação.

O CSS dessa tela foi separado em `src/styles/WatchListPage.css`, pois a página tinha muitos estilos específicos, principalmente depois dos ajustes de responsividade para desktop e celular. Essa separação deixou o JSX mais legível.

### `GameCard`

O `GameCard` foi criado para exibir uma partida de forma resumida. Ele mostra os jogadores Turing e Lovelace, avatar quando disponível, status da partida, turno atual ou vencedor, além do botão para assistir.

Um cuidado importante nesse componente foi a resolução do vencedor. Durante os testes, percebemos que comparar IDs diretamente poderia gerar erro quando um ID vinha como número e outro como string. Por isso, foi criada uma função de comparação que converte os valores para texto antes de comparar. Isso evitou exibir o vencedor errado em partidas finalizadas.

O componente também foi ajustado para funcionar melhor em telas pequenas, principalmente quando os nomes dos bots eram longos.

### `WatchGamePage`

A `WatchGamePage` é a tela de espectador da partida. Ela é acessada pela rota `/watch/:id` e busca os dados da partida pelo ID da URL.

Essa tela exibe:

- número do turno;
- status da partida;
- fase atual;
- jogador Turing;
- jogador Lovelace;
- vencedor, quando a partida está finalizada;
- dados técnicos de IDs;
- tabuleiro 5x5 com níveis e professores.

Para manter a partida atualizada, foi usado um polling com `setInterval`, chamando a API a cada segundo. A escolha por polling foi feita por simplicidade e confiabilidade, já que a API da arena já disponibilizava o endpoint HTTP de detalhe da partida. A implementação com WebSocket chegou a ser estudada, mas o polling atendeu bem ao escopo do projeto e foi suficiente para acompanhar as partidas em tempo de apresentação.

O trecho principal desse funcionamento é a chamada periódica de `fetchGame()`, que atualiza o estado local da tela com `setData(game)`.

### `BoardCell`

O `BoardCell` representa uma célula do tabuleiro. Ele recebe o nível da construção e o professor presente naquela posição. Separar essa célula em um componente próprio facilitou a montagem do tabuleiro na tela de espectador e deixou o `WatchGamePage` menos carregado.

Como o tabuleiro possui sempre 5x5 posições, o componente é renderizado a partir do array `data.board`, percorrendo linhas e colunas.

### `BattlePage`

A `BattlePage` foi criada para permitir partidas entre dois jogadores específicos. Nela, o usuário escolhe o próprio jogador, informa o ID do adversário e escolhe o slot desejado. A tela tenta criar a partida, inserir o adversário e iniciar o jogo.

Essa tela teve mais validações porque o fluxo de batalha entre dois jogadores é mais sensível do que jogar contra o Random Bot. Foram criadas funções auxiliares para validar IDs, identificar slots, confirmar se o adversário entrou na partida e evitar situações em que o backend pudesse inverter os lados sem o front perceber.

## Listagem de partidas

A listagem de partidas foi implementada na rota `/watch`, por meio da `WatchListPage`. Ela consulta a API da arena e exibe as partidas recentes em formato de cards.

Cada card apresenta informações suficientes para o usuário decidir qual partida deseja abrir, sem precisar entrar em todos os detalhes. Isso inclui nomes dos jogadores, status ou vencedor e botão para assistir.

## Detalhe de uma partida finalizada

O detalhe de uma partida finalizada aparece na rota `/watch/:id`, dentro da `WatchGamePage`. Quando o status da partida é `FINISHED`, a tela exibe o vencedor em destaque e também mostra uma área de dados técnicos com os IDs usados para resolver o resultado.

Essa área técnica foi útil durante o desenvolvimento, porque em alguns momentos o vencedor poderia aparecer errado se a comparação entre IDs fosse feita de maneira ingênua. Mantivemos esse bloco para facilitar a conferência durante os testes.

## Tela de espectador de uma partida

A tela de espectador também está em `/watch/:id`. Ela permite acompanhar partidas em andamento e finalizadas. Quando a partida ainda está acontecendo, o front atualiza os dados periodicamente e redesenha o tabuleiro conforme o estado retornado pela API.

A decisão de mostrar o tabuleiro com células visuais, em vez de apenas imprimir o JSON, foi tomada para facilitar a compreensão da partida. Durante a apresentação, isso também tornou o sistema mais demonstrável, pois era possível ver a evolução das jogadas de forma visual.

## Comunicação com a API

O arquivo `src/services/api.js` centraliza chamadas simples para a API da arena. Ele monta os headers, inclui o bearer token quando existe, trata resposta vazia e transforma erros HTTP em objetos mais fáceis de debugar no front.

Além dele, a pasta `feature/game/api` possui funções mais específicas para operações da arena, como cadastrar jogador, listar partidas, iniciar jogo, entrar em partida e registrar espectador.

Essa divisão ocorreu porque parte do projeto veio de uma estrutura mais próxima da base fornecida pelo professor, enquanto outra parte foi implementada diretamente para as telas finais do grupo.

## Estilização e responsividade

O projeto usa CSS comum, separado em arquivos dentro de `src/styles`. No começo, alguns estilos estavam inline, principalmente durante a prototipação. Conforme as telas ficaram maiores, parte do CSS foi movida para arquivos próprios, como `WatchListPage.css`.

A tela de listagem recebeu atenção especial em responsividade, porque os nomes dos bots podiam ser grandes e quebrar o layout no celular. O layout dos cards foi ajustado para funcionar tanto em desktop quanto em telas menores.

## Considerações finais

O front-end foi construído buscando equilibrar clareza, funcionalidade e facilidade de teste. As decisões de componentes foram tomadas a partir das necessidades reais do projeto: cadastrar uma IA, guardar seu token, criar partidas, listar jogos e assistir o andamento de cada partida.

Ainda há melhorias possíveis, como padronizar todas as chamadas em um único cliente de API, remover estilos inline restantes e evoluir o acompanhamento da partida para WebSocket. Mesmo assim, a versão entregue cumpre os requisitos principais e permite demonstrar o funcionamento completo da integração entre front-end, arena e jogadores de IA.
