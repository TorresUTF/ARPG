---
id: TASK-7
title: Avanço do chefe que se adapta ao jogador
status: Done
assignee: []
created_date: '2026-11-19T12:10:00Z'
updated_date: '2026-11-19T12:41:00Z'
labels: []
milestone: m-2
dependencies:
  - TASK-6
type: feature
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Levar o avanço do protótipo chefe-dash para src/simulacao/inimigos.ts.
Design: design/inimigos.md (seção escrita em task-6)
Critérios de aceite: a preencher a partir de task-6.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 O golem usa o avanço com as três fases: o preparo mostra a faixa laranja e a direção trava no começo do aviso
- [x] #2 Avanço que termina perto do jogador emenda um círculo com aviso mais curto; se termina longe, o golem volta a perseguir
- [x] #3 O golem não usa o avanço com o jogador já no alcance do círculo
- [x] #4 Pressão: usa o avanço assim que fica pronto, com o jogador longe
- [x] #5 Paciente: segura o avanço até o E do jogador estar em recarga e o jogador ao alcance, ou até cansar de esperar
- [x] #6 Garantir o golpe: segura o avanço até o jogador ficar preso num ataque, ao alcance, ou até cansar de esperar
- [x] #7 O estilo segue as notas de fuga, esquiva com E e agressão, e só troca depois do tempo mínimo no estilo atual
- [x] #8 A tela mostra o estilo atual e o motivo de cada avanço; os números do avanço estão em dados/ e no painel
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Avanço do golem em src/simulacao/cerebroGolem.ts e inimigos.ts, com os três estilos do protótipo. Números em dados/avanco-golem.json e dados/estilos-golem.json, no painel. Testes 'task-7 AC<n>' em testes/avanco-golem.test.ts.
<!-- SECTION:FINAL_SUMMARY:END -->
