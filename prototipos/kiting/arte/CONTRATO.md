# Contrato das artes do protótipo do kiting

Combinado entre a conversa do protótipo e a da pixel art em 10/11/2026.

## Regras gerais

- **Escala:** 1 m = 20 pixels de arte. Cada pixel de arte vira 2×2 na tela (40 px por metro). O jogo desenha com `imageSmoothingEnabled = false`.
- **Pasta:** `prototipos/kiting/arte/`, PNG com fundo transparente.
- **Entrega:** além dos PNGs, um `arte.js` que define `window.ARTE = { nome: "data:image/png;base64,..." }`, com o nome do arquivo sem `.png`. O jogo carrega `arte/arte.js`, e se ele não existir, ou faltar alguma peça, usa as formas geométricas.
- **Folhas:** quadros lado a lado na horizontal, todos do mesmo tamanho, centrados no centro do corpo (a área de colisão).
- **Direção:** personagens e tiros olham para a direita. O jogo espelha os personagens e gira os tiros.

## Cores reservadas

- O **vermelho forte** fica só para as áreas de golpe no chão. Não use vermelho no piso.
- O **jogador** é azul-claro (~`#4da3ff`) e precisa se distinguir do `boneco_circulo` azul escuro (~`#3d55e8`).
- O **boneco** troca o corpo inteiro de cor no preparo: azul escuro no círculo, amarelo (~`#f0c419`) no saturno e verde (~`#2fc46a`) na linha.
- O **roxo** (~`#c77dff`) é a marca do W.

## Peças

| Arquivo | Quadros | O que é |
|---|---|---|
| `chao.png` | 4 de 20×20 | Variações de piso (1 m cada), sorteadas por casa |
| `jogador.png` | 11 de 24×24 | Parado (2), andando (4), preparo do tiro (1), tiro (1), avanço (1), aparo (1), atingido (1), nesta ordem |
| `boneco_normal.png` | 2 de 48×48 | Andando ou parado |
| `boneco_circulo.png` | 2 de 48×48 | Preparando o círculo (azul escuro) |
| `boneco_saturno.png` | 2 de 48×48 | Preparando o saturno (amarelo) |
| `boneco_linha.png` | 2 de 48×48 | Preparando a linha (verde) |
| `boneco_recuperacao.png` | 2 de 48×48 | Recuperação depois do golpe (escuro) |
| `boneco_atordoado.png` | 2 de 48×48 | Atordoado depois de um aparo certo, bem diferente da recuperação |
| `boneco_atingido.png` | 1 de 48×48 | Clarão branco quando leva dano |
| `tiro_aa.png` | 1 de 8×8 | Tiro do ataque básico |
| `tiro_q.png` | 1 de 16×16 | Tiro do Q |
| `tiro_w.png` | 1 de 16×16 | Tiro do W |
| `marca.png` | 1 de 64×64 | Anel roxo em volta do boneco marcado |
| `carga.png` | 2 de 6×6 | Carga da marca: vazia e cheia |
| `explosao.png` | 4 de 64×64 | Explosão da marca |
| `aparo.png` | 3 de 32×32 | Efeito em volta do jogador durante a janela do aparo |
| `destino.png` | 1 de 12×12 | Marcador do clique de mover |
| `icones.png` | 4 de 22×22 | Q, W, E e R, nesta ordem (botão de recarga, 44 px na tela) |

Ficam no código, sem arte: áreas de golpe no chão, barras de vida, linhas de mira, arco de preparo e anel de alcance.
