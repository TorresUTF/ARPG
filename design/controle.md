# Controle

- `src/controle/entrada.ts` transforma mouse e teclado em comandos. A simulação só recebe comandos.
- A conversão da posição do mouse para metros vem da apresentação (`camera.ts`); o controle não sabe o tamanho da tela.
- Teclas: botão direito move (pode segurar), botão esquerdo ou A ataca, S para, Enter recomeça.
- O teclado só funciona com a arena em foco; clicar na arena dá o foco.
- O inimigo que será atacado é escolhido pela simulação, a partir do ponto do mouse.
