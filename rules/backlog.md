# Backlog

> Aplica-se a: todo trabalho feito a partir de tickets do Backlog.md

<!-- gestor-de-regras:regras-de-ouro (gerado automaticamente: não edite) -->
## Regras de Ouro

1. Se notas, planos ou instruções conflitarem com o código, assuma que o código está correto e aponte a divergência na sua resposta. O ticket ou plano que você foi pedido para fazer manda apenas no que ele diz para mudar; para todo o resto, mandam o código e os testes. Se fazer o ticket quebraria um teste existente, pare e relate. Como e quando um ticket é marcado como concluído está nas regras do projeto.
2. Trabalhe apenas nos TO-DOs, planos e notas que você foi explicitamente solicitado a fazer, e em nenhum outro. Se você achar algo que pareça relevante (como um blocker), reporte o problema na sua resposta ou informe ao orquestrador.
<!-- /gestor-de-regras:regras-de-ouro -->

## Glossário
- **Seção:** um milestone do Backlog.md. Cada seção é uma fatia que o autor consegue testar à mão.
- **Ticket de implementação:** ticket que muda código ou dados. Tem critérios de aceite numerados (AC1, AC2, ...).
- **Ticket de validação:** ticket com o rótulo `validacao`, atribuído ao autor, que fecha uma seção. Os critérios de aceite dele são o roteiro de teste manual. Só o autor o marca Done.
- **Done:** na `main`, um ticket está Done só quando o PR `[<id>]` foi mergeado com os checks obrigatórios verdes.
- **Contrato:** os testes cujo nome começa com `<id> AC<n>:`. Eles provam que o ticket continua cumprido.
- **Abandonado:** ticket In Progress sem PR aberto e sem commit na branch `<id>-*` há 14 dias, ou com o PR fechado sem merge.
- **Conflito:** ticket To Do cujo pedido contradiz um critério de aceite de um ticket Done.
- **Substituição:** ticket que muda de propósito um comportamento Done. Leva o rótulo `substitui-<id>` (por exemplo, `substitui-task-7`).
- **Obsoleto:** ticket To Do que uma nova decomposição tornou desnecessário. Leva o rótulo `obsoleto`, e o /sweep o arquiva.
- **Status:** só `To Do`, `In Progress` e `Done`, com essa grafia.

## Configuração do projeto
- Validação manual: ligada
- Comando de teste: npm run verificar
- Pastas de teste: testes/

## Decomposição
1. Antes de criar qualquer ticket, liste os existentes com `backlog task list --plain`. Se um ticket já cobre o pedido, atualize-o em vez de criar outro.
2. Crie um milestone por seção do design.
3. Na descrição de cada ticket, cite a seção do design de origem: `Design: <arquivo>#<seção>`.
4. Os critérios de aceite vêm do design. Se o design não define um critério, pergunte ao autor; não invente.
5. Um ticket é a menor mudança que vale um PR próprio.
6. Use `--dep` para as dependências. O primeiro ticket de um milestone depende do ticket de validação do milestone anterior (ou, com a validação desligada, de todos os tickets desse milestone).
7. Com a validação ligada, termine cada milestone com um ticket de validação. Ele tem o rótulo `validacao`, tem o autor como responsável, traz o roteiro de teste nos critérios de aceite e depende de todos os tickets de implementação do milestone.
8. Numa nova decomposição de um design revisado, compare o design com o código, não com os tickets antigos. Crie tickets só para a diferença. Ponha o rótulo `obsoleto` nos To Do que deixaram de valer.
9. Mostre a lista criada ao autor e espere o ok antes de implementar.

## Próximo ticket
É o primeiro `To Do` sem o rótulo `validacao` cujas dependências estão todas Done, na ordem de `backlog task list`. Se nenhum ticket se encaixar, diga isso ao autor e não escolha outro.

## Execução
1. Crie a branch `<id>-<resumo>` a partir da `main` atualizada.
2. Primeiro commit: `backlog task edit <id> -s "In Progress"`.
3. Escreva os testes nas pastas de teste, com o nome `"<id> AC<n>: ..."`, um ou mais por critério de aceite.
4. Implemente até o comando de teste passar.
5. Último commit: `backlog task edit <id> -s Done`.
6. Abra o PR com o título `[<id>] <resumo>`. Não faça o merge: quem faz é o autor.

## Substituição
Num ticket com o rótulo `substitui-<id>`, ao chegar à mudança nos testes de `<id>`, pare e pergunte ao autor se segue. Só altere esses testes depois do sim. Isso vale mesmo com a validação manual desligada.

## Validação
- Só o autor marca um ticket de validação como Done, num PR `[<id>] validação` que contém só a mudança de status.
- Se o roteiro falhar: crie um ticket de correção no mesmo milestone, adicione-o como dependência do ticket de validação e devolva o ticket de validação para `To Do`.

## Proibições
- Editar arquivos de `backlog/` sem a CLI.
- Abrir tickets arquivados (`backlog task view` de um ID arquivado).
- Mudar o status de um ticket que você não foi pedido para fazer.

## CLI
Para o uso da CLI, rode `backlog instructions overview`.
