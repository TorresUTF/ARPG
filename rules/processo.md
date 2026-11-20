# Processo

> Aplica-se a: todo pedido de mudança no projeto, do início (classificar a trilha) ao fim (o resumo para o autor).

<!-- gestor-de-regras:regras-de-ouro (gerado automaticamente: não edite) -->
## Regras de Ouro

1. Se notas, planos ou instruções conflitarem com o código, assuma que o código está correto e aponte a divergência na sua resposta. O ticket ou plano que você foi pedido para fazer manda apenas no que ele diz para mudar; para todo o resto, mandam o código e os testes. Se fazer o ticket quebraria um teste existente, pare e relate. Como e quando um ticket é marcado como concluído está nas regras do projeto.
2. Trabalhe apenas nos TO-DOs, planos e notas que você foi explicitamente solicitado a fazer, e em nenhum outro. Se você achar algo que pareça relevante (como um blocker), reporte o problema na sua resposta ou informe ao orquestrador.
<!-- /gestor-de-regras:regras-de-ouro -->

## As três trilhas de mudança

Classifique todo pedido em uma trilha antes de começar. Na dúvida, pergunte ao autor.

| Trilha | Quando | Processo | Ticket |
|---|---|---|---|
| **Ajuste** | Mudar um número | Altere direto em `dados/`. Sem documento, sem revisão, sem plano. | Ticket com o rótulo `ajuste` e um teste que confere o valor em `dados/`. |
| **Comportamento** | Mudança pequena dentro de um sistema que já existe | Implemente direto. Ao final, atualize o documento do sistema em `design/` com uma linha. | Ticket com teste dos critérios de aceite. |
| **Estrutura** | Sistema novo, ou mudança que atravessa vários sistemas | Primeiro o brainstorm EGM (`/egm:egm-brainstorm`, gera um `concepts_brief*.md`). Depois, um protótipo em `prototipos/`. Só depois de o autor testar e aprovar o protótipo, o draft EGM (`/egm:egm-draft`, que é o design), a decomposição em tickets e a implementação em `src/`. | Protótipo e validação dele (citam o brief), depois draft EGM, depois decomposição do draft em milestone. |

Não use o processo EGM para as trilhas de Ajuste e Comportamento.

Toda mudança de código ou de dados do jogo tem um ticket no Backlog.md e um PR `[<id>]`; veja `rules/backlog.md`. PRs de manutenção do fluxo (CI, configuração, regras geradas pelo mod, arquivamentos do /sweep) usam o título `[infra] <resumo>` e não têm ticket.

## Ao terminar qualquer mudança

Diga, em poucas linhas:

1. o que mudou;
2. como rodar o jogo;
3. o que o autor deve testar jogando para avaliar a mudança.
