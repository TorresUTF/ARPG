# Ações

Vale para habilidades do personagem e, no futuro, para os golpes dos inimigos (`src/simulacao/acao.ts`).

- Toda ação passa por três fases, sempre nesta ordem: **preparo**, **ativo**, **recuperação**. A duração de cada uma vem de `dados/`.
- Uma fase com duração zero é atravessada no mesmo passo.
- O passo em que a ação começa já conta como o primeiro passo do preparo.
- O efeito da ação acontece ao entrar na fase ativa (por exemplo, o tiro sai).
- Enquanto há uma ação em curso, o personagem fica preso no lugar.
- Comando dado durante uma ação fica guardado e vale assim que ela termina. O de mover espera o fim da ação; o de atacar só fica guardado pelo tempo definido em `dados/`.
- Parar esquece os comandos guardados, mas não interrompe a ação: toda ação tem custo.
