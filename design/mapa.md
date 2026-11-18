# Mapa

Fica em `src/simulacao/viagem.ts` e `src/simulacao/jogo.ts`. O desenho do mapa e a lista de lugares estão em `dados/mapa.json`; os números de ajuste, em `dados/viagem.json`.

- O botão direito manda o personagem em linha reta até o ponto. Ele não procura caminho: ao bater no relevo, escorrega pela parede ou para. Só chão e ponte deixam passar.
- A névoa some num raio em volta do personagem. Um lugar escondido perto o bastante aparece como uma dica (?).
- **Fogueira:** Espaço descansa: vida e poções cheias, vira o ponto de retorno e as emboscadas voltam a valer.
- **Baú:** abre ao encostar.
- **Emboscada:** escondida até começar; começa sozinha quando o personagem passa perto.
- **Dungeon e chefe:** Espaço em cima do anel começa a luta. Lugar vencido não abre outra luta.
- Vida e poções passam do mapa para a luta e voltam. Vencer marca o lugar e tira a névoa em volta. Morrer leva à última fogueira, descansado.
- Fora da luta, a poção cura na hora.
- Cada luta recebe uma semente sorteada pela semente do jogo: a mesma semente refaz o jogo inteiro.
