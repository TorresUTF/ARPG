---
id: TASK-13
title: >-
  Protótipo rodada 2: varredura em linha, salto, ritmo quebrado e ajustes de
  número
status: In Progress
assignee: []
created_date: '2026-11-20T12:29:00Z'
updated_date: '2026-11-20T12:32:00Z'
labels: []
milestone: m-3
dependencies:
  - TASK-11
references:
  - prototipos/esquiva-pulo/
  - concepts_brief-chefe-novo.md
type: spike
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Segunda rodada do protótipo de prototipos/esquiva-pulo/, a partir do feedback da interação 1 no brief. Design: concepts_brief-chefe-novo.md#Como o protótipo vai ser testado. Muda: (1) varredura como linha que passa de lado a lado e causa dano quando cruza o jogador, no lugar da área vermelha; (2) golpe de salto do chefe, com dano em área na aterrissagem e sem anel de aviso; (3) sprint antes do combo e ritmo quebrado (rajada agressiva, depois janela para kitar), com recuperações menores; (4) ajustes de número: mais vida do chefe, D mais curto em relação ao E, energia menor.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Varredura em linha: a varredura do chefe é uma linha que passa de um lado ao outro e causa dano quando cruza o jogador sem proteção; continua rasteira
- [ ] #2 Salto: o chefe pula e causa dano em área ao aterrissar, sem anel de aviso; o aviso mostra onde ele vai cair
- [ ] #3 Ritmo: o chefe dá um sprint antes do combo e alterna rajada agressiva com janela para kitar; recuperações menores
- [ ] #4 Números: vida do chefe maior, D mais curto em relação ao E e energia ajustada, todos ainda controles no painel
- [ ] #5 As respostas (a) a (g) do brief, na interação 2, estão todas marcadas como sim (em (f), sim significa que a mana não impediu o uso das habilidades)
<!-- AC:END -->
