# Inimigos

Ficam em `src/simulacao/inimigos.ts`. Todo golpe segue as três fases de `acoes.md`; acertar o jogador tira vida (ou é aparado, ver `habilidades.md`). Atordoado, o inimigo não faz nada.

## Golem (chefe e mini-chefe)

- Persegue o jogador. A vida vem da sala do lugar em `dados/mapa.json`.
- Escolhe o golpe pela distância: **círculo** em volta dele se o jogador está muito perto; **saturno** (círculo central e anel, com uma faixa segura entre os dois) a média distância; **linha** reta, de longe, na direção em que o jogador estava no começo do aviso. Saturno e linha têm recarga.
- Durante o aviso do saturno, continua andando devagar.
- O desenho mostra a área do golpe no chão conforme a opção escolhida na página (completa, parcial ou escondida). O corpo inteiro troca de cor em cada aviso.

## Chefe que reage ao jogador

Vale para o golem (chefe e mini-chefe). Vem do protótipo aprovado em `prototipos/chefe-dash/` (task-5). Todos os números ficam em `dados/` e aparecem no painel. O avanço e os estilos estão em `src/simulacao/cerebroGolem.ts` e `dados/avanco-golem.json`, `dados/estilos-golem.json`.

### Avanço (dash)

- O golem tem um avanço próprio, com recarga maior que a do E do jogador (no protótipo: 9 s contra 6 s).
- Como todo golpe, tem as três fases. **Preparo:** o golem fica laranja e mostra no chão uma faixa laranja na direção do avanço; a direção trava no começo do aviso, mirando onde o jogador vai estar quando o aviso acabar. **Ativo:** corre em linha reta até a distância máxima ou até encostar no jogador. **Recuperação:** curta.
- Se o avanço termina perto do jogador, o golem emenda um círculo com aviso mais curto que o normal. Se termina longe, volta a perseguir.
- Não usa o avanço se o jogador já está no alcance do círculo.
- O golem escolhe um **estilo** de usar o avanço, a partir do que percebe do jogador:
  - **Pressão** (o jogador foge muito): usa o avanço assim que fica pronto, se o jogador estiver longe.
  - **Paciente** (o jogador escapa dos golpes com o E): segura o avanço até o E do jogador estar em recarga e o jogador estar ao alcance do avanço mais o círculo.
  - **Garantir o golpe** (o jogador troca golpes de perto): segura o avanço até o jogador ficar preso no preparo ou na recuperação de um ataque, ao alcance.
  - Paciente e Garantir seguram o avanço por um tempo máximo; depois disso usam, se o jogador estiver longe ("cansou de esperar").
- O golem percebe o jogador por três notas que esquecem com o tempo: quanto tempo ele passa andando para longe do golem (fuga), quantas vezes usou o E com um golpe do golem ameaçando (esquiva com E) e quantos ataques fez de perto (agressão). O estilo é o de maior nota; só troca se o novo estilo for claramente melhor e o atual já durou um tempo mínimo.
- A tela mostra o estilo atual e o motivo de cada avanço (por exemplo, "seu E está em recarga").

### Ordem dos golpes

- O golem prefere os golpes que estão dando dano. Cada golpe (círculo, saturno, linha) tem um **peso**, que começa em 1.
- Quando um golpe acerta o jogador, o peso dele sobe. Quando o jogador escapa (sai da área ou apara com R), o peso desce. O peso fica entre um mínimo e um máximo.
- **Frequência:** a recarga do saturno e da linha é dividida pelo peso. Golpe que acerta volta mais rápido; golpe de que o jogador desvia fácil demora mais.
- **Escolha:** a distância continua decidindo quais golpes servem (perto, círculo; média, saturno; longe, linha). Quando mais de um golpe serve ao mesmo tempo, o golem sorteia entre eles pelo peso, com a semente da luta.
- O círculo emendado depois do avanço conta para o peso do círculo.
- A tela avisa quando o golpe preferido (o de maior peso) muda, por exemplo "O chefe está preferindo a linha".

### Golpes virados contra o chefe

- O aparo (R) basta: aparar qualquer golpe do golem, inclusive o círculo emendado depois do avanço, anula o golpe e deixa o golem atordoado (`habilidades.md`). Não há outro golpe que possa ser virado contra ele.

## Horda

- Três tipos: **reto** (um disparo), **leque** (três disparos abertos) e **área** (marca uma área onde o jogador está, que explode depois do aviso).
- Mantém distância: só se aproxima se estiver longe. A mira trava no começo do aviso.
- A recarga tem uma pequena variação sorteada (com a semente da luta), para a horda não atirar toda junta.

## Corpos

- Corpos não se atravessam: o jogador é empurrado para fora dos inimigos, e os inimigos se afastam entre si. Ninguém sai da arena.
