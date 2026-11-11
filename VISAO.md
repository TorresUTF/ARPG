# Visão do jogo

Este documento define o que o jogo é. Ele muda raramente, e só por decisão do autor.
Toda mudança no projeto deve ser conferida contra ele.

## Em uma frase

Um jogo de ação visto de cima em que o jogador enfrenta chefes com o controle de um MOBA:
o mouse move e mira, o teclado dispara as habilidades.

## A experiência que o jogo existe para entregar

O jogador vence porque jogou melhor, não porque tinha números maiores.
Os dois momentos que o jogo precisa produzir o tempo todo:

- **O combo que tira a reação do chefe**: ler a luta, quebrar a defesa dele e descarregar tudo na janela conquistada.
- **A virada**: sair de uma situação quase perdida usando a habilidade certa no instante certo.

## Pilares

1. **Compromisso.** Toda ação tem custo. Atacar prende o personagem por um instante, e habilidade usada entra em recarga. Nada é gratuito.
2. **Ganância no kiting.** A pergunta constante da luta é "cabe mais um ataque antes de eu ter que me mover?". Ficar seguro o tempo todo não pode ser a melhor estratégia.
3. **Postura.** O chefe tem uma defesa que é quebrada por jogadas certas, não por dano acumulado sem critério. Quebrar a postura abre a janela do combo.
4. **Virada merecida.** As ferramentas de recuperação premiam risco e precisão. O jogo nunca ajuda quem está perdendo sem exigir nada em troca.
5. **Legibilidade.** Todo golpe do chefe é anunciado. O jogador sempre entende por que morreu.

## O chefe

O chefe precisa poder ser superado, não apenas decorado. Para isso ele tem:

- algo a perder (a postura);
- ataques que podem ser virados contra ele;
- reação ao comportamento do jogador (por exemplo, fechar a distância de quem só foge).

## O que o jogo não é

- Não é um MOBA: sem times, rotas, farm ou partidas longas.
- Não é um jogo de progressão por números: sem níveis, itens ou equipamentos que decidam a luta.
- Não é um jogo de mundo aberto ou de exploração.
- Não é PvP, pelo menos por enquanto. O 1v1 só entra em discussão depois que o combate contra chefes estiver bom.

## Escopo da primeira versão

Um personagem, quatro habilidades, um chefe, uma arena.
Formas geométricas no lugar de arte até o combate estar divertido.

## Ponto de partida do personagem (pode mudar com os testes)

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
