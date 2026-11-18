# Processo

> Aplica-se a: todo pedido de mudança no projeto, do início (classificar a trilha) ao fim (o resumo para o autor).

<!-- gestor-de-regras:regras-de-ouro (gerado automaticamente: não edite) -->
## Regras de Ouro

1. Se notas, planos ou instruções forem conflitantes com o código, assuma que o código está correto e aponte a divergência na sua resposta. A exceção é quando um plano está marcado como `IN PROGRESS`: nesse caso, siga o plano. Quando o plano estiver completo, mude o status dele para `DONE`.
2. Trabalhe apenas nos TO-DOs, planos e notas que você foi explicitamente solicitado a fazer, e em nenhum outro. Se você achar algo que pareça relevante (como um blocker), reporte o problema na sua resposta ou informe ao orquestrador.
<!-- /gestor-de-regras:regras-de-ouro -->

## As três trilhas de mudança

Classifique todo pedido em uma trilha antes de começar. Na dúvida, pergunte ao autor.

| Trilha | Quando | Processo |
|---|---|---|
| **Ajuste** | Mudar um número | Altere direto em `dados/`. Sem documento, sem revisão, sem plano. |
| **Comportamento** | Mudança pequena dentro de um sistema que já existe | Implemente direto. Ao final, atualize o documento do sistema em `design/` com uma linha. |
| **Estrutura** | Sistema novo, ou mudança que atravessa vários sistemas | Primeiro um protótipo em `prototipos/`. Só depois de o autor testar e aprovar, processo EGM completo. |

Não use o processo EGM para as trilhas de Ajuste e Comportamento.

## Ao terminar qualquer mudança

Diga, em poucas linhas:

1. o que mudou;
2. como rodar o jogo;
3. o que o autor deve testar jogando para avaliar a mudança.
