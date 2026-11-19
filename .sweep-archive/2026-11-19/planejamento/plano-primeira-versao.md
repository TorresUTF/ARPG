# Plano: primeira versão jogável

Combinado com Gabriel em 10/11/2026. Projeto pessoal, sem prazo.

**Objetivo:** ter a primeira versão jogável no navegador, com o escopo do `VISAO.md`: um personagem com quatro habilidades, o mapa com hordas e masmorras, e um chefe.

**Ponto de partida (atualizado em 17/11/2026):** existem `VISAO.md`, o `CLAUDE.md` com as regras em `rules/`, os protótipos em `prototipos/` (kiting, kiting-3d, horda, lutador, viagem, viagem-3d) e a base do código em `src/` (simulação com passo fixo, movimento e ataque básico contra um boneco de treino; PR #2).

## Passos

1. **Protótipo do kiting** (em `prototipos/`) — feito em `prototipos/kiting/`. Um círculo anda para onde o jogador clica e usa o ataque básico, que tem tempo de preparo. Ele enfrenta um boneco que persegue e dá um golpe com aviso visível. O teste é saber se a pergunta "cabe mais um ataque antes de eu ter que me mover?" já diverte.
2. **Protótipo das habilidades** (em `prototipos/`) — feito em `prototipos/kiting/`, com as quatro habilidades: Q tiro, W marca, E avança e R apara. O chefe com postura não entrou em nenhum protótipo.
3. **Código de verdade** — em andamento. Feito em `src/`, seguindo as regras de arquitetura de `rules/arquitetura.md`, com documentos em `design/` e o processo EGM. Fica no repositório GitHub TorresUTF/ARPG. Até agora: movimento e ataque básico (PR #2); depois, em 18/11/2026, o protótipo `prototipos/viagem-3d/` passou inteiro para `src/`: as quatro habilidades (Q tiro, W marca, E avanço, R aparo), o golem com três golpes, as hordas, as poções, o mapa e o desenho em 3D. Falta o chefe que reage ao jogador, descrito em "O chefe" no `VISAO.md`.

## Decisões e pendências

- Os protótipos ficam na pasta do projeto, ao lado do `VISAO.md`.
- O código de verdade fica no repositório GitHub TorresUTF/ARPG (criado em 11/11/2026).
- EGM ("elephant goldfish model"): siga apenas as etapas que Gabriel escrever e não suponha como funciona.
- Cada passo só começa com o ok do Gabriel.
