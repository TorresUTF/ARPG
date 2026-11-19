# Visão do jogo

Este documento define o que o jogo é. Ele pode mudar após testes de jogabilidade, e só por decisão do autor.
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

## Os chefes

Os chefes precisam poder serem superados. Para isso ele tem:

* ataques que podem ser virados contra ele;
* reação ao comportamento do jogador (por exemplo, fechar a distância de quem só foge, varia a ordem das habilidades).



## O que o jogo não é

* Não é um MOBA: sem times, rotas, farm ou partidas longas.
* Não é PvP, pelo menos por enquanto. O 1v1 só entra em discussão depois que o combate contra chefes estiver bom.



## Personagens



Sobre os Personagens:
1.Tem arquétipos, que mudam sua jogabilidade.
2.Tem os atributos: Vida, Velocidade de ataque (ataque básico), Redução de cooldown das habilidades, Alcance do ataque básico, Energia, Carga e Mana.
3.Personagens tem 4 habilidades customizáveis (que escalam de acordo com os atributos) e 2 fixa (D -> Um dash (rolamento do elden Ring) que dá frames de invulnerabilidade. E o F -> Um pulo que dá Frames de invulnerabilidade para parte de baixa do personagem).
4.Gastam energia usando as habilidades fixas ou habilidades que especificamente usam energia.
5. Gastam mana usando habilidades que não gastam energia.
6. Tem Lvs, a cada Lv o jogador pode escolher um atributo para upar, com exceção do alcance (esse é fixo e depende da classe do personagem).
7. Perde vida quando é acertado por um inimigo.
8. Perde energia quando faz esquivas consecutivas, após um periodo sem gastar energia ela regenera rápidamente.

## Como usar este documento para decidir

