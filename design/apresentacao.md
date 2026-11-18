# Apresentação

Desenho em `src/apresentacao/`, com three.js. Só lê o estado da simulação e os eventos; nunca altera as regras.

- Duas cenas 3D: o mapa (`cenaMapa.ts`) e a arena (`cenaLuta.ts`). O x do mundo fica igual, o y vira a profundidade e a altura é nova.
- Em cada cena há três camadas: a cena 3D, desenhos planos colados no chão (áreas de golpe, miras, alcance, névoa) e um Canvas 2D por cima (vida, recargas, textos).
- A câmera (`camera3d.ts`) é alta e em perspectiva. No mapa segue o personagem de longe; na luta, de perto ou parada mostrando a arena inteira.
- Os modelos (`modelos.ts`) são formas simples. Vermelho forte só nas áreas que machucam; o jogador é azul-claro; o roxo é da marca do W.
- `efeitos.ts` guarda os enfeites que reagem a eventos (clarões, explosões, textos de aviso, escurecer na troca de cena), com tempos de tela.
- Os tamanhos de desenho (câmera, modelos, duração dos clarões) ficam no código da apresentação: não são números de jogo.
