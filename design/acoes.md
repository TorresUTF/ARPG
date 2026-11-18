# Ações

Vale para as ações do personagem e para os golpes dos inimigos (`src/simulacao/acao.ts`).

- Toda ação passa por três fases, sempre nesta ordem: **preparo**, **ativo**, **recuperação**. A duração de cada uma vem de `dados/`.
- Uma fase com duração zero é atravessada no mesmo passo.
- O passo em que a ação começa já conta como o primeiro passo do preparo.
- O efeito da ação acontece ao entrar na fase ativa (por exemplo, o tiro sai). O avanço (E) anda durante a fase ativa inteira; no aparo (R), a fase ativa é a janela.
- Enquanto há uma ação em curso, o personagem fica preso no lugar.
- Mover ou usar uma habilidade **corta a recuperação**. O preparo nunca é cortado.
- Comando dado durante o preparo fica guardado: o de mover espera o fim do preparo e então corta a recuperação; o de habilidade e o de atacar ficam guardados só pelo tempo definido em `dados/`. Se houver mais de um guardado, vale primeiro a habilidade, depois o ataque, depois o movimento.
- Parar esquece os comandos guardados, mas não interrompe a ação: toda ação tem custo.
- O preparo dos inimigos é o aviso do golpe e sempre aparece na tela.
