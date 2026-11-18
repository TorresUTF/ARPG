# Simulação

Regras do jogo, em `src/simulacao/`. Não conhece tela, som, mouse nem teclado.

## Partes

- `jogo.ts`: o jogo inteiro. Guarda o mapa e, quando há uma, a luta em andamento; decide se cada comando vale para o mapa ou para a luta.
- `viagem.ts`: o mapa (ver `mapa.md`).
- `mundo.ts`: uma luta. `criarMundo` monta a arena com quem aparece na sala; `avancar` faz um passo.
- `jogador.ts`, `inimigos.ts`, `luta.ts`: o personagem, os inimigos e as regras que os dois compartilham (dano, aparo).

## Como avança

- O jogo avança em passos fixos, 60 por segundo. `avancarJogo(jogo, comandos)` faz um passo.
- Os tempos de `dados/` estão em segundos e viram número inteiro de passos. Assim a duração de uma ação é exata e igual em qualquer computador.
- Num passo de luta, nesta ordem: recargas, comandos recebidos, comandos guardados, jogador, áreas no chão, inimigos, disparos da horda, corpos, tiros do jogador. No fim, saem os inimigos derrotados e a luta acaba se o jogador morreu ou não sobrou inimigo.
- Luta acabada fica parada até o jogador pedir para voltar ao mapa.
- Se o desenho atrasar, o laço do navegador roda vários passos de uma vez, até um limite, e descarta o resto.

## Entrada e saída

- **Entra:** comandos (`comandos.ts`): mover, atacar, habilidade, poção, parar, interagir.
- **Sai:** eventos (`eventos.ts`), apagados a cada passo: fases, disparos, acertos, golpes, aparos, fim da luta, baú aberto, descanso. A apresentação reage a eles; nada que ela faz volta para as regras.

## Números

- Todos vêm de `dados/*.json`, carregados por `dadosIniciais()`, que devolve uma cópia. O conteúdo do mapa vem de `mapaInicial()`.
- O jogo guarda uma referência a essa cópia. O painel altera a mesma cópia, e a mudança vale no passo seguinte.

## Repetição exata

- Toda aleatoriedade passa pelo sorteio com semente (`aleatorio.ts`). Nunca `Math.random` na simulação.
- A semente do jogo aparece na página. Cada luta recebe uma semente sorteada a partir dela.
- `gravacao.ts` guarda a semente, os números, o mapa e os comandos de cada passo, e `reproduzir` refaz o jogo idêntico. Um teste automático confere isso.
