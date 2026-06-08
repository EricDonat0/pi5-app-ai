# PI5: Aplicações de Inteligência Artificial

[![Deploy Vercel](https://img.shields.io/badge/Vercel-Live_Deploy-000000?style=for-the-badge&logo=vercel)](https://pi5-app-ai.vercel.app/)

Repositório oficial do front-end do Projeto Integrador 5 (PI5). O objetivo principal deste projeto é desenvolver uma interface web interativa e dinâmica que se integra a um orquestrador de partidas, permitindo o gerenciamento, a visualização e a simulação de Inteligências Artificiais (baseadas em Busca Heurística Simbólica e Antecipação) que jogam de forma totalmente autônoma.

---

## Funcionalidades da Aplicação

O sistema foi estruturado para refletir com precisão as regras do torneio e a temática da disciplina, incorporando as seguintes mecânicas:

* **Arena de Batalha:** Interface dedicada para configurar e simular combates, permitindo a seleção de agentes (bots) por meio de seus identificadores únicos.
* **Gestão e Registro de IA:** Fluxo integrado para o cadastro de novos agentes computacionais diretamente na plataforma, comunicando-se com a API do torneio.
* **Renderização de Tabuleiro Temático:** Motor visual que interpreta o estado da matriz do jogo em tempo real. A lógica de elevação das casas foi adaptada para representar a progressão acadêmica, refletindo os anos da faculdade até a Graduação.
* **Feedback Visual de Condição de Vitória:** Sistema dinâmico de interface que aplica destaques visuais na célula em que ocorre o movimento que define o vencedor da partida.
* **Watch List:** Sistema de monitoramento que lista e reproduz o histórico das últimas partidas processadas pelo servidor da disciplina, permitindo a análise das estratégias adotadas pelas IAs.
* **Arquitetura Componentizada:** Código modularizado (utilizando componentes como `BoardCell`, `WatchGamePage` e `PlayerSelect`) para garantir escalabilidade e padronização.

---

## Equipe de Desenvolvimento

* **[Eric Donato](https://www.linkedin.com/in/ericdonato/)**
* **[Paula Martins](https://www.linkedin.com/in/paulamorin/)**
* **[Matheus Henrique](https://www.linkedin.com/in/matheus-henrique-b04a08253/)**

**Orientador:** **[Prof. Guilherme Rey](https://www.linkedin.com/in/guirey/)**

---

## Stack Tecnológico

A aplicação foi construída utilizando ferramentas modernas de desenvolvimento web para garantir performance e manutenibilidade:

* **Front-end:** React, Vite, JavaScript (ESNext)
* **Roteamento:** React Router DOM
* **Estilização:** CSS3 puro arquitetado com variáveis dinâmicas (Custom Properties)
* **Comunicação Assíncrona:** Axios (Consumo da API RESTful)
* **Hospedagem e CI/CD:** Vercel

---

## Conteúdo Programático e Acompanhamento

O ciclo de desenvolvimento da aplicação e da arquitetura da IA segue os módulos propostos pela disciplina:

1.  **Aula 01:** Introdução (Projeto Integrador 5: Aplicações de Inteligência Artificial)
2.  **Aula 02:** Trilhando nosso caminho (Fundamentos Web, HTTP e APIs)
3.  **Aula 03:** Papo sobre front-end (História e Evolução das interfaces)
4.  **Aula 04:** Construindo nosso front-end (Setup inicial com React e Vite)
5.  **Aula 05:** Mergulho em APIs (Comunicação estruturada entre Front e Back)
6.  **Aula 06:** Documentação da PI5-API (Leitura, interpretação e consumo de endpoints)
7.  **Aula 07:** Implementação da Arena e UX (Rotas, seleção de agentes e personalização visual)
8.  **Aula 08:** Integração de Lógicas de Tabuleiro (Progressão temática, registro de entidades e finalização de estados de jogo)

---

## Instruções de Execução Local

Para compilar e executar este projeto em um ambiente de desenvolvimento local, siga os passos abaixo:

**1. Clone o repositório para a sua máquina local:**
`git clone https://github.com/EricDonat0/pi5-app-ai.git`

**2. Navegue até o diretório do projeto:**
`cd pi5-app-ai`

**3. Instale as dependências necessárias:**
`npm install`

**4. Configuração das Variáveis de Ambiente:**
Por questões de segurança, os tokens de acesso e chaves de API não são versionados no repositório. Para que a aplicação funcione corretamente, é necessário configurar o ambiente local:
* Crie um arquivo chamado `.env` na raiz do projeto.
* Solicite as credenciais de acesso aos desenvolvedores ou utilize o arquivo `.env.example` (se disponibilizado) como base para preencher os tokens necessários do Vite e da API do orquestrador.

**5. Inicie o servidor de desenvolvimento:**
`npm run dev`

A aplicação estará disponível para acesso no navegador, geralmente no endereço `http://localhost:5173/`.