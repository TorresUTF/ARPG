---
id: TASK-14
title: Script do Blender que monta o rascunho do Ferreiro
status: To Do
assignee: []
created_date: '2026-11-22T20:02:00Z'
labels: []
milestone: m-3
dependencies:
  - TASK-12
references:
  - prototipos/ferreiro-3d/
  - design_draft.md
type: spike
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Script Python para o Blender em prototipos/ferreiro-3d/rascunho_ferreiro.py que monta um rascunho do Ferreiro de Cinzas (corpo de formas simples, esqueleto, foice, martelo e as 15 animações), para o autor ou o irmão refinarem à mão. Primeira peça da rodada 3 do protótipo.
Design: design_draft.md#Ficha do modelo do Ferreiro (para o Blender)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Rodado na aba Scripting do Blender, o script limpa a cena e monta o rascunho com corpo, esqueleto, foice e martelo
- [ ] #2 O rascunho segue a ficha: 1 unidade = 1 m, cabe num círculo de 0,9 m de raio visto de cima, cerca de 2,2 m de altura, origem entre os pés no chão, olhando para a vista Front
- [ ] #3 O rascunho tem as 15 animações com os nomes exatos da tabela da ficha, todas no lugar (sem sair da origem)
- [ ] #4 Exportado em glTF Binary para src/apresentacao/arte/ferreiro.glb e importado de volta num Blender vazio, mostra o modelo com as 15 animações pelos nomes
- [ ] #5 Na vista Top, a pose de cada animação _inicio mostra qual golpe vem (varredura baixa, foice alta, martelada, pulo)
<!-- AC:END -->
