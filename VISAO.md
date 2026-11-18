# Visão do jogo

Este documento define o que o jogo é. Ele muda raramente, e só por decisão do autor.
Toda mudança no projeto deve ser conferida contra ele.

## Em uma frase

Um jogo de ação visto de cima em que o jogador enfrenta chefes com o controle de um MOBA:
o mouse move e mira, o teclado dispara as habilidades.

## Fase de desenvolvimento
O protótipo de chefe, horadas e mapa foi aprovado.
Agora estamos na fase de desenvolvimento do projeto.

## A experiência que o jogo existe para entregar

O jogador deve se sentir desafiado pelos obstáculos impostos a ele, de forma que dominar seu personagem se torna recompensador.
A jogabilidade deve ser fluida, possibilitando o cancelamento de animação, mas sem tirar o custo de uma ação. Exemplo: Ao dar o ataque básico o personagem vai ficar parado e fazer a animação de carregar o ataque, mas o jogador pode cancelar a animação de recuperação se movendo ou usando uma habilidade, mas o jogador não pode atacar enquanto o próximo ataque não estiver disponível (depende da velocidade de ataque do personagem), se um jogador displicente clicar 2x seguidas para atacar o personagem vai ficar parado e executar os dois ataques, mas um jogador mais preciso pode dar um ataque básico, cancelar a animação de recuperação se movendo para longe do chefe e dar um segundo ataque quando o próximo ataque básico estiver pronto, ambos jogadores deram o mesmo dano no mesmo intervalo de tempo, a diferença está na precisão e intensão dos movimentos que permitiram o segundo jogador desviar de um ataque ou se reposicionar no meio tempo.
O jogador também deve se sentir recompensado por explorar um mundo aberto, ganhando recompensas variadas. Posibilitando builds criativas utilizando: Lvs, Brasões de arquetipos, habilidades novas (que escalam de acordo com o atributo upado e o arquetipo do personagem) e armaduras que dão efeitos passivos.

## Pilares

1. **Compromisso.** Toda ação tem custo. Atacar prende o personagem por um instante, e habilidade usada entra em recarga. Nada é gratuito.
2. **Ganância no kiting.** A pergunta constante da luta é "cabe mais um ataque antes de eu ter que me mover?". Ficar seguro o tempo todo não pode ser a melhor estratégia.
3. **Virada merecida.** As ferramentas de recuperação premiam risco e precisão. O jogo nunca ajuda quem está perdendo sem exigir nada em troca.
4. **Legibilidade.** Todo golpe do chefe é anunciado. O jogador sempre entende por que morreu.

## O chefe

O chefe precisa poder ser superado, não apenas decorado. Para isso ele tem:

- ataques que podem ser virados contra ele;
- reação ao comportamento do jogador (por exemplo, fechar a distância de quem só foge, varia a ordem das habilidades).

## O que o jogo não é

- Não é um MOBA: sem times, rotas, farm ou partidas longas.
- Não é PvP, pelo menos por enquanto. O 1v1 só entra em discussão depois que o combate contra chefes estiver bom.

## Escopo da primeira versão

Um personagem, quatro habilidades, um chefe, uma arena.
Formas geométricas no lugar de arte até o combate estar divertido.

## Ponto de partida do personagem

Um atirador de curto alcance:

| Tecla | Habilidade | Função |
|---|---|---|
| Clique | Ataque básico à distância, com tempo de preparo | Ritmo do kiting |
| Q | Projétil que marca o chefe | Marcas acumuladas quebram a postura |
| W | Aparo de janela curta e recarga longa | A virada |
| E | Avanço curto, com recarga reduzida por desvio no limite | Mobilidade que premia risco |
| R | Rajada forte, que só compensa com a postura quebrada | Fecho do combo |

O ciclo esperado: kitar para acumular marcas, quebrar a postura, descarregar o combo,
e usar o aparo quando tudo dá errado.

## Como usar este documento para decidir

Diante de qualquer ideia ou mudança, perguntar:

1. Isso reforça algum pilar?
2. Isso contradiz algum pilar ou entra na lista do que o jogo não é?
3. Isso cabe no escopo da primeira versão?

Se a resposta à primeira for "não", a ideia fica de fora, por melhor que pareça.
