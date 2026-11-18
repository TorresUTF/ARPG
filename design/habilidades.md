# Habilidades

Ficam em `src/simulacao/jogador.ts`. Todas miram no ponto do mouse, seguem `acoes.md` e entram em recarga ao começar. Em recarga, o comando é ignorado.

- **Q, tiro mirado:** voa em linha reta e acerta o primeiro inimigo que encostar, até o alcance.
- **W, tiro que marca:** como o Q, mas marca o inimigo atingido por um tempo. Cada ataque básico no marcado conta uma carga; com todas as cargas, a marca explode e causa dano extra. A marca some se o tempo acabar.
- **E, avanço:** anda depressa na direção do mouse; a fase ativa dura o tempo de percorrer a distância.
- **R, aparo:** a fase ativa é a janela. Um golpe ou disparo que chegar dentro dela é anulado, o personagem fica livre na hora e quem atacou fica atordoado. Sem golpe, a recuperação é longa.
- **Poção (tecla 1):** na luta é uma ação com preparo (o personagem fica parado bebendo); a cura acontece na fase ativa. Com a vida cheia, não bebe.
