---
id: TASK-8
title: Chefe varia a ordem dos golpes conforme o jogador
status: Done
assignee: []
created_date: '2026-11-19T12:10:00Z'
updated_date: '2026-11-19T12:52:00Z'
labels: []
milestone: m-2
dependencies:
  - TASK-7
type: feature
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design: design/inimigos.md (seção escrita em task-6)
Critérios de aceite: a preencher a partir de task-6.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Golpe que acerta o jogador sobe de peso; golpe de que o jogador escapa ou que ele apara desce; o peso fica entre um mínimo e um máximo
- [x] #2 A recarga do saturno e da linha é dividida pelo peso do golpe
- [x] #3 Quando mais de um golpe serve na distância atual, o golem sorteia entre eles pelo peso, com a semente da luta
- [x] #4 A tela avisa quando o golpe preferido (o de maior peso) muda
- [x] #5 Os números do peso estão em dados/ e no painel
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Pesos dos golpes em src/simulacao/cerebroGolem.ts (anotarGolpe, sortearGolpe) e na escolha do golpe em inimigos.ts. Números em dados/pesos-golem.json, no painel. Testes 'task-8 AC<n>' em testes/ordem-golpes.test.ts.
<!-- SECTION:FINAL_SUMMARY:END -->
