# Painel de ajuste

- Fica em `src/painel/`. Gera um controle deslizante para cada número de `dados/`.
- Nome, faixa e passo de cada controle ficam em `src/painel/rotulos.ts`. Um teste automático falha se algum número de `dados/` não tiver linha ali, ou se o valor inicial não couber na faixa.
- A mudança vale no passo seguinte. Valores marcados com ↻ (vida da horda, posições iniciais, tamanho da arena) valem na próxima luta.
- `dados/mapa.json` (relevo e lugares) não aparece no painel: é conteúdo, não número de ajuste.
- Acima dos números há duas opções só de desenho: como a área do golpe do golem aparece e a câmera na luta.
- O valor alterado mostra o original ao lado. "Voltar aos valores iniciais" desfaz tudo.
- As mudanças não são salvas: para guardar um valor, copie-o para o arquivo em `dados/`.
