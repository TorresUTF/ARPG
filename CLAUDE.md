# Instruções do projeto

<!-- gestor-de-regras:regras-de-ouro (gerado automaticamente: não edite) -->
## Regras de Ouro

1. Se notas, planos ou instruções conflitarem com o código, assuma que o código está correto e aponte a divergência na sua resposta. O ticket ou plano que você foi pedido para fazer manda apenas no que ele diz para mudar; para todo o resto, mandam o código e os testes. Se fazer o ticket quebraria um teste existente, pare e relate. Como e quando um ticket é marcado como concluído está nas regras do projeto.
2. Trabalhe apenas nos TO-DOs, planos e notas que você foi explicitamente solicitado a fazer, e em nenhum outro. Se você achar algo que pareça relevante (como um blocker), reporte o problema na sua resposta ou informe ao orquestrador.
<!-- /gestor-de-regras:regras-de-ouro -->

<!-- gestor-de-regras:indice-de-regras (gerado automaticamente a partir de rules/: não edite) -->
## Onde estão as regras

Este arquivo é só um índice. As regras do projeto ficam em `rules/`: antes de trabalhar em uma área, leia o arquivo dela. Regras novas vão para `rules/<área>.md`, nunca direto aqui.

### Arquitetura
Aplica-se a: todo o código do jogo em `src/` e às entradas de ações em `dados/`.
Arquivo: `rules/arquitetura.md`

### Regras gerais
Aplica-se a: todo o projeto.
Arquivo: `rules/geral.md`

### Pastas
Aplica-se a: os arquivos e pastas de documentação e dados na raiz do projeto (`VISAO.md`, `TESTES.md`, `dados/`, `design/`, `prototipos/`).
Arquivo: `rules/pastas.md`

### Processo
Aplica-se a: todo pedido de mudança no projeto, do início (classificar a trilha) ao fim (o resumo para o autor).
Arquivo: `rules/processo.md`

### Tecnologia
Aplica-se a: escolha de linguagem, ferramentas e dependências, e aos comandos para instalar, rodar e testar o jogo.
Arquivo: `rules/tecnologia.md`
<!-- /gestor-de-regras:indice-de-regras -->

Jogo de ação visto de cima com chefes e controle de MOBA.
Antes de qualquer trabalho, leia `VISAO.md`: ele define o que o jogo é e o que não é.

## Sobre o autor

- Trabalha sozinho e não é programador experiente. Explique as mudanças em português claro, sem jargão desnecessário.
- Responda sempre em português.
- Faça apenas o que foi pedido. Ideias extras são bem-vindas como sugestão em uma linha, nunca implementadas por conta própria.
