# Plano: primeira versão jogável

Combinado com Gabriel em 10/11/2026. Projeto pessoal, sem prazo.

**Objetivo:** ter a primeira versão jogável no navegador, com o escopo do `VISAO.md`: um personagem, quatro habilidades, um chefe e uma arena.

**Ponto de partida:** só existem `VISAO.md` e `CLAUDE.md`. Ainda não há código.

## Passos

1. **Protótipo do kiting** (em `prototipos/`). Um círculo anda para onde o jogador clica e usa o ataque básico, que tem tempo de preparo. Ele enfrenta um boneco que persegue e dá um golpe com aviso visível. O teste é saber se a pergunta "cabe mais um ataque antes de eu ter que me mover?" já diverte.
2. **Protótipo da luta completa** (em `prototipos/`). Entram o chefe com postura e as quatro habilidades: Q marca, W apara, E avança e R descarrega. O teste é o ciclo inteiro: marcar, quebrar a postura, fazer o combo e virar a luta com o aparo.
3. **Código de verdade.** Só começa depois de Gabriel aprovar os protótipos. Será feito em `src/`, seguindo as regras de arquitetura do `CLAUDE.md`, com documentos em `design/` e o processo EGM. Fica em um repositório GitHub que ainda vai ser criado.

## Decisões e pendências

- Os protótipos ficam na pasta do projeto, ao lado do `VISAO.md`.
- O código de verdade vai para um repositório GitHub, a ser criado por Gabriel antes do passo 3.
- EGM ("elephant goldfish model"): Gabriel vai descrever as etapas antes do passo 3. Siga apenas o que ele escrever e não suponha como funciona.
- Cada passo só começa com o ok do Gabriel. O passo 1 ainda aguarda esse ok.
