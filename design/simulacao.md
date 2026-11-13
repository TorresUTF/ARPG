# Simulação

Regras do jogo, em `src/simulacao/`. Não conhece tela, som, mouse nem teclado.

## Como avança

- O mundo avança em passos fixos, 60 por segundo. `avancar(mundo, comandos)` faz um passo.
- Os tempos de `dados/` estão em segundos e viram número inteiro de passos. Assim a duração de uma ação é exata e igual em qualquer computador.
- Em cada passo, nesta ordem: recebe os comandos, aplica um comando guardado (se o jogador ficou livre), atualiza o jogador, atualiza os projéteis.
- Se o desenho atrasar, o laço do navegador roda vários passos de uma vez, até um limite, e descarta o resto.

## Entrada e saída

- **Entra:** comandos (`comandos.ts`): mover para um ponto, atacar o inimigo mais perto de um ponto, parar.
- **Sai:** eventos (`eventos.ts`), apagados a cada passo: mudança de fase, disparo, acerto, derrota. A apresentação reage a eles; nada que ela faz volta para as regras.

## Números

- Todos vêm de `dados/*.json`, carregados por `dadosIniciais()`, que devolve uma cópia.
- O mundo guarda uma referência a essa cópia. O painel altera a mesma cópia, e a mudança vale no passo seguinte.

## Repetição exata

- Toda aleatoriedade passa pelo sorteio com semente (`aleatorio.ts`), guardado dentro do mundo. Nunca `Math.random` na simulação.
- A semente da luta aparece na tela.
- `gravacao.ts` guarda a semente, os números e os comandos de cada passo, e `reproduzir` refaz a luta idêntica. Um teste automático confere isso.
