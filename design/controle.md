# Controle

- `src/controle/entrada.ts` transforma mouse e teclado em comandos. A simulação só recebe comandos.
- A conversão da posição do mouse para metros vem da apresentação (`camera3d.ts`): é o ponto do chão embaixo do mouse. Como a câmera anda, esse ponto é recalculado a cada passo.
- Teclas: botão direito move (pode segurar), botão esquerdo ou A ataca, Q W E R usam as habilidades no ponto do mouse, 1 bebe poção, S para, Espaço ou Enter entra num lugar, descansa ou volta ao mapa. F liga a tela cheia (não é comando de jogo).
- O teclado só funciona com a arena em foco; clicar na arena dá o foco.
- O inimigo que será atacado é escolhido pela simulação, a partir do ponto do mouse.
