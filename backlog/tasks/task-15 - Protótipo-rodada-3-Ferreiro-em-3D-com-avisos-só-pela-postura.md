---
id: TASK-15
title: 'Protótipo rodada 3: Ferreiro em 3D com avisos só pela postura'
status: To Do
assignee: []
created_date: '2026-11-22T20:02:00Z'
labels: []
milestone: m-3
dependencies:
  - TASK-14
references:
  - prototipos/ferreiro-3d/
  - prototipos/esquiva-pulo/
  - design_draft.md
type: spike
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rodada 3 do protótipo, em 3D, em prototipos/ferreiro-3d/. Testa se a postura do Ferreiro substitui os avisos coloridos (cor do corpo e área no chão) aprovados na task-12. A rodada 2 (prototipos/esquiva-pulo/) não muda.
Design: design_draft.md#Decisões tomadas no draft e design_draft.md#Perguntas em aberto
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A luta usa as mesmas regras e números do Ferreiro da rodada 2 (prototipos/esquiva-pulo/config.js), vista de cima em 3D com three.js
- [ ] #2 O Ferreiro é o modelo de src/apresentacao/arte/ferreiro.glb, com cada animação tocada na fase certa e esticada para durar o tempo da fase
- [ ] #3 Cada golpe usa as animações do mapeamento da ficha, e a varredura e a foice alta aparecem espelhadas quando o golpe vem do outro lado
- [ ] #4 O Ferreiro não troca a cor do corpo e não desenha área no chão: o aviso é só a postura
- [ ] #5 Respostas às 4 perguntas em aberto do draft, registradas pelo autor depois de jogar
<!-- AC:END -->
