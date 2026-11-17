# Arquitetura

> Aplica-se a: todo o código do jogo em `src/` e às entradas de ações em `dados/`.

<!-- gestor-de-regras:regras-de-ouro (gerado automaticamente: não edite) -->
## Regras de Ouro

1. Se notas, planos ou instruções forem conflitantes com o código, assuma que o código está correto e aponte a divergência na sua resposta. A exceção é quando um plano está marcado como `IN PROGRESS`: nesse caso, siga o plano. Quando o plano estiver completo, mude o status dele para `DONE`.
2. Trabalhe apenas nos TO-DOs, planos e notas que você foi explicitamente solicitado a fazer, e em nenhum outro. Se você achar algo que pareça relevante (como um blocker), reporte o problema na sua resposta ou informe ao orquestrador.
<!-- /gestor-de-regras:regras-de-ouro -->

## Regras de arquitetura

1. **Simulação separada do desenho.** O código em `src/simulacao/` contém as regras do jogo e não conhece tela, som nem entrada do usuário. Ele deve poder rodar em testes automáticos, sem navegador.
2. **Passo de tempo fixo.** A simulação avança 60 vezes por segundo, sempre com o mesmo intervalo, independente da taxa de quadros do desenho.
3. **Unidades do mundo.** A simulação usa metros e segundos, nunca pixels. A conversão para a tela acontece só em `src/apresentacao/`.
4. **Toda ação tem três fases: preparo, ativo e recuperação.** Vale para as habilidades do personagem e para os ataques do chefe. O preparo do chefe é o aviso do golpe e sempre precisa ser visível.
5. **Ações descritas em dados.** Nenhum número de jogo fica escrito no código. Habilidades e ataques do chefe são entradas em `dados/` com a duração das fases, o alcance e os efeitos.
6. **Controle convertido em intenções.** `src/controle/` transforma mouse e teclado em comandos ("mover para este ponto", "usar Q nesta direção"). A simulação só recebe comandos.
7. **Eventos para a parte sensorial.** A simulação emite eventos ("acertou", "aparou", "postura quebrada") e `src/apresentacao/` responde com efeitos visuais e som. Efeitos nunca alteram as regras.
8. **Painel de ajuste.** `src/painel/` permite alterar os valores de `dados/` com o jogo rodando. Todo valor novo em `dados/` deve aparecer no painel.

Arte não é prioridade: formas geométricas até o autor dizer o contrário.

```
src/
├── simulacao/     regras: movimento, ações, postura, chefe
├── controle/      mouse e teclado viram intenções
├── apresentacao/  desenho, som e efeitos
└── painel/        ajuste dos números com o jogo rodando
```
