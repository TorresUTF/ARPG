# Pastas

> Aplica-se a: os arquivos e pastas de documentação e dados na raiz do projeto (`VISAO.md`, `TESTES.md`, `dados/`, `design/`, `prototipos/`).

<!-- gestor-de-regras:regras-de-ouro (gerado automaticamente: não edite) -->
## Regras de Ouro

1. Se notas, planos ou instruções forem conflitantes com o código, assuma que o código está correto e aponte a divergência na sua resposta. A exceção é quando um plano está marcado como `IN PROGRESS`: nesse caso, siga o plano. Quando o plano estiver completo, mude o status dele para `DONE`.
2. Trabalhe apenas nos TO-DOs, planos e notas que você foi explicitamente solicitado a fazer, e em nenhum outro. Se você achar algo que pareça relevante (como um blocker), reporte o problema na sua resposta ou informe ao orquestrador.
<!-- /gestor-de-regras:regras-de-ouro -->

## Estrutura de pastas

- `VISAO.md`: pilares do jogo. Só o autor altera.
- `TESTES.md`: diário de testes do autor. Nunca escreva nem edite este arquivo. Leia-o para entender o que foi sentido nos testes.
- `dados/`: todos os números do jogo (dano, alcance, recargas, velocidades, tempos dos ataques do chefe).
- `design/`: um documento por sistema. Descreve estrutura e regras, nunca valores.
- `prototipos/`: código descartável, para descobrir se uma ideia diverte. Não precisa de qualidade nem de documento.
