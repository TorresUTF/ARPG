# Inimigos

Ficam em `src/simulacao/inimigos.ts`. Todo golpe segue as três fases de `acoes.md`; acertar o jogador tira vida (ou é aparado, ver `habilidades.md`). Atordoado, o inimigo não faz nada.

## Golem (chefe e mini-chefe)

- Persegue o jogador. A vida vem da sala do lugar em `dados/mapa.json`.
- Escolhe o golpe pela distância: **círculo** em volta dele se o jogador está muito perto; **saturno** (círculo central e anel, com uma faixa segura entre os dois) a média distância; **linha** reta, de longe, na direção em que o jogador estava no começo do aviso. Saturno e linha têm recarga.
- Durante o aviso do saturno, continua andando devagar.
- O desenho mostra a área do golpe no chão conforme a opção escolhida na página (completa, parcial ou escondida). O corpo inteiro troca de cor em cada aviso.

## Horda

- Três tipos: **reto** (um disparo), **leque** (três disparos abertos) e **área** (marca uma área onde o jogador está, que explode depois do aviso).
- Mantém distância: só se aproxima se estiver longe. A mira trava no começo do aviso.
- A recarga tem uma pequena variação sorteada (com a semente da luta), para a horda não atirar toda junta.

## Corpos

- Corpos não se atravessam: o jogador é empurrado para fora dos inimigos, e os inimigos se afastam entre si. Ninguém sai da arena.
