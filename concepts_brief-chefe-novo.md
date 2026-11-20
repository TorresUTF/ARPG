# Rolamento, pulo, energia, mana e o segundo chefe (m-3)

* **Autor:** Gabriel Torres Andreassa
* **Data:** 2026-11-19
* **Estado:** brainstorm concluído, depois de duas rodadas de revisão Goldfish. Próximo passo: o protótipo.

## Visão geral

A etapa m-3 adiciona ao personagem o que o `VISAO.md` descreve e o jogo ainda não tem:

* **Rolamento (D):** curto, com invencibilidade, custa energia.
* **Pulo (F):** parado no lugar, protege só de golpe rasteiro, custa energia.
* **Energia:** gasta pelo D e pelo F, com taxa extra para esquivas em sequência. Volta rápido depois de uma pausa.
* **Mana:** gasta por Q, W, E e R.

Junto vem um segundo chefe, o **Ferreiro de Cinzas**. Ele é mais agressivo que o golem e foi feito para testar o D e o F. Tem golpes rasteiros e um combo anunciado. Para esse chefe, D e F são a resposta **mais barata**, não a única: o R, andar para fora da área e o E também escapam, só que custam mais.

Ordem de trabalho (`rules/processo.md`, PR #26): este brief, depois um protótipo em `prototipos/`, depois a validação do autor, depois o draft EGM, os tickets e o código em `src/`. Tudo numa etapa só, por decisão do autor.

Fora deste brief: mundo aberto, níveis, arquétipos, armaduras e tutorial.

## Regras decididas

Todas as regras abaixo foram decididas pelo autor. As que vieram de propostas dos revisores foram aceitas em 19/11/2026.

### Teclas
* A tela cheia vai para a tecla **L**. O F passa a ser o pulo. Também precisam mudar `src/main.ts`, `index.html`, `design/controle.md` e `src/controle/entrada.ts`.
* O D e o F ficam guardados como as habilidades: apertados durante outra ação, rodam quando ela permitir.

### Rolamento (D)
* É invencível a qualquer golpe enquanto dura a invencibilidade.
* Vai na direção do mouse; se o mouse estiver em cima do personagem, usa a última direção de movimento. O protótipo tem uma chave para testar a direção de movimento.
* Tem distância menor que a do E. O E reposiciona (longe, com recarga, sem invencibilidade); o D acerta o momento.
* Atravessa o corpo do chefe. Sem isso, "rolar para as costas" não funciona.

### Pulo (F)
* Parado no lugar, sem movimento no ar.
* Protege só de golpe **rasteiro**. Golpes **inteiros** (todos os do golem e da horda) acertam quem está pulando.

### D e F são ações fixas, não habilidades
* Custam a recuperação e a energia, sem recarga. Isso é uma exceção consciente à regra de `design/habilidades.md` ("toda habilidade entra em recarga") e precisa ser escrita lá.

### Quando um golpe acerta
* **Regra:** o golpe acerta no primeiro passo da simulação em que o jogador está na área e sem proteção, uma vez só.
* **Golpe rasteiro:** fica no chão por mais tempo que a invencibilidade do D e por menos tempo que a proteção do F.
* **Margem do pulo:** a proteção do F menos a duração do rasteiro dá pelo menos 0,20 s. Sem essa margem, o pulo vira "acertar o quadro exato" (cerca de 33 ms).
* Os tempos são contados em passos inteiros (60 por segundo), não em segundos com vírgula.
* Sair da área também escapa do rasteiro. O texto da causa de morte é: "rasteiro: o rolamento não protege; pule (F) ou saia da área".
* O resultado de um golpe tem três estados: **atingido**, **aparado** ou **esquivado**. Sem isso, o golem passa a preferir justamente os golpes que o jogador está vencendo.
* Projétil da horda esquivado atravessa o jogador.

### Energia
* Está sempre visível. Ficar sem energia no meio do combo é punição aceita: é má gestão, não falta de legibilidade. O chefe não confere a energia do jogador.
* "Em sequência": qualquer D ou F que começa até 0,6 s depois do fim do movimento do D ou F anterior. Vale para todos os pares (D→F, F→D, D→D, F→F). A taxa é fixa (+15) e não acumula. E e R não contam.
* Volta cheia a cada luta.
* A barra tem marcas mostrando quanto o próximo D e o próximo F vão custar.

### Mana
* Q, W, E e R custam mana. A mana nunca bloqueia o D nem o F.
* Uma habilidade só sai se a recarga estiver pronta **e** houver mana.
* A mana é conferida quando a tecla é apertada e de novo quando um comando guardado roda. É paga no começo da ação.
* Se faltar mana, a ação é recusada e a recarga **não** começa.
* Volta cheia a cada luta. A poção não devolve mana.
* Começa folgada: usando Q, W, E e R sempre que a recarga acaba, a primeira recusa por mana só vem depois de pelo menos 30 s. Se a mana for apertada, a luta vira só ataque básico e a horda fica mais difícil.

### Ação recusada e som
* A simulação emite um evento "ação recusada" com o motivo: **energia**, **mana** ou **recarga**.
* Toca um só som para os três motivos, e o motivo aparece em texto curto na tela ("sem energia", "sem mana", "em recarga"). O protótipo tem uma chave para desligar o som da recarga, caso irrite.
* É o primeiro som do jogo. Fica em `src/apresentacao/som.ts` e ouve os eventos no mesmo ponto dos efeitos visuais. É um bipe gerado por código, sem arquivo de áudio, no máximo um a cada 150 ms, com caixa de mudo.
* O navegador só liga o áudio depois da primeira tecla ou do primeiro clique do jogador.
* Qualquer outro som está fora do escopo.

### Barras e painel
* As barras de energia e de mana ficam logo abaixo da barra de vida.
* A mana não usa o azul-claro do jogador, para não se confundir com a vida.
* O D e o F ganham caixas ao lado de Q, W, E e R, apagadas quando não há energia para pagar.
* A caixa de uma habilidade mostra "sem mana" de um jeito diferente de "em recarga".

### O chefe: Ferreiro de Cinzas
* Duelista de armadura. Não é golem e não repete os golpes do golem.
* **"Habilidade repetida"** vale só para golpes, isto é, forma, aviso e resposta. As reações que o VISAO exige ficam, mas com outro mecanismo.
* **Golpes:**
  * **Arco de lâmina:** inteiro, em cone à frente.
  * **Varredura de solo:** rasteira.
  * **Combo "Martelo e Foice":** primeiro a varredura **rasteira** (resposta barata: F), depois um golpe **inteiro** (resposta barata: D). Custa 65 de energia: 20 do F, mais 30 do D, mais 15 de taxa.
* **Fecha a distância com ímpeto:** a velocidade sobe enquanto o jogador foge, até um limite abaixo da velocidade do jogador (5,0 contra 5,5 m/s), e zera quando o chefe acerta.
* **Varia a ordem dos golpes:** lê a última defesa do jogador (D, F, R ou nenhuma) e escolhe o próximo golpe contra ela.
* **Golpe virado contra ele:** pular a varredura deixa o chefe preso na recuperação por cerca de 1 s. O R também funciona.
* **R no combo:** funciona em todos os golpes. Aparar o primeiro atordoa o chefe e cancela o segundo, como o código já faz. O custo é a recarga de 12 s mais a mana.
* **Piso de aviso: 0,5 s**. A agressividade vem de recuperações curtas e golpes encadeados, nunca de aviso curto. O golpe 2 do combo cai pelo menos 0,5 s depois do fim do golpe 1.
* Algumas recuperações duram pelo menos um ataque básico inteiro (0,45 s), para sobrar espaço para a ganância no kiting.
* **Adiado:** a fenda (parece a "linha" do golem) e o atordoamento ao bater na parede.

### O golem
* No protótipo, a única mudança é que um golpe esquivado conta como erro. Na fase em `src/` entra um ajuste mínimo: D e F contam como esquiva, o D não conta como "preso", e o E sem mana conta como indisponível, com o texto "seu E não está disponível".

## Números iniciais do protótipo

Todos são controles ajustáveis no protótipo. Os valores finais vão para `dados/`.

| Item | Valor | Em passos | Origem |
|---|---|---|---|
| Energia máxima | 100 | | aceito |
| Custo do D / do F | 30 / 20 | | aceito |
| Taxa por esquiva em sequência | +15, sem acumular | | aceito |
| Espera antes de regenerar a energia / velocidade | 0,8 s / 60 por segundo | | aceito |
| D | 3 m em 0,30 s; invencível 0,25 s; recuperação 0,15 s | invencível: 15 | aceito |
| F | protege 0,55 s; recuperação 0,10 s | protege: 33 | aceito |
| Golpe rasteiro ativo | 0,35 s | 21 | aceito |
| Margem do pulo | cerca de 0,2 s | 13 | aceito |
| Mana máxima | 100 | | aceito |
| Custo de mana Q / W / E / R | 15 / 20 / 10 / 15 | | aceito |
| Regeneração de mana | 6 por segundo, contínua | | aceito |
| Combo | aviso 1,2 s (é o preparo do golpe 1); golpe 2 pelo menos 0,5 s depois; o chefe fica 1,5 s parado no fim (castigo) | | aceito |
| Chefe | vida 120; velocidade 4,0 m/s; ímpeto até 5,0 m/s; varredura com raio 3,5 m | | aceito |
| Som | bipe de onda quadrada, cerca de 150 Hz, 60 a 120 ms | | aceito |

Com esses números, a energia regenera uns 24 durante o aviso de 1,2 s. O combo pode ser vencido começando o aviso com 65 de energia, ou com 41 sem gastar nada durante o aviso. Esse é um teste automático da fase em `src/`.

## Como o protótipo vai ser testado

A etapa é única, então o protótipo precisa de chaves para descobrir qual peça está ruim.

* **Chaves no painel** (reaproveitar o painel de `prototipos/chefe-dash/`):
  * energia infinita;
  * mana infinita ou desligada;
  * "todos os golpes inteiros";
  * golem ou Ferreiro;
  * travar o chefe num golpe só;
  * ímpeto ligado ou desligado;
  * velocidade 0,5x;
  * pausa e avanço de um passo;
  * jogador que não morre;
  * mudo;
  * som da recarga ligado ou desligado;
  * direção do D: mouse ou movimento.
* **Registro:** uma linha por golpe recebido, com o golpe, a altura, o resultado (atingido, aparado, esquivado pelo D, esquivado pelo F, fora da área), a energia e a mana.
* **Tela final:** usos de D e F, recusas por motivo, dano por causa, e segundos com energia ou mana zerada.
* **Ordem do teste, tudo na mesma versão:**
  1. Energia e mana infinitas, um golpe por vez. Responde a pergunta (a).
  2. Energia ligada e mana desligada, chefe completo. Responde (b), (c) e (d).
  3. Tudo ligado. Responde (e), (f) e (g).
* **Perguntas para responder depois de jogar:**
  * (a) Dá para reconhecer o golpe rasteiro na primeira vez?
  * (b) O rolamento e a energia criam decisões sem deixar o R e o E inúteis?
  * (c) O combo é vencido na 2ª ou 3ª tentativa, e você entende por que morreu?
  * (d) O chefe parece agressivo e mesmo assim dá para kitar?
  * (e) O E ainda tem motivo para existir ao lado do D?
  * (f) A mana te impediu de usar habilidades? A luta virou só ataque básico?
  * (g) Você reconheceu o som de "não pode" sem olhar a barra?
* **Critério de sucesso:** o autor responde "sim" para (a), (b), (c), (d) e (g), e "não" para (f). Se a mana não fizer nada (zero recusas) ou pesar demais, ela é revista antes de ir para `src/`.

## Objetivos e fora do escopo

* **Objetivos:**
  * D, F, energia e mana, com as regras acima.
  * O Ferreiro de Cinzas, com arco, varredura, combo, ímpeto, ordem que reage à defesa do jogador e um golpe que pode ser virado contra ele.
  * Resultado de golpe em três estados, e a causa do dano mostrada na tela.
  * Evento de ação recusada, o primeiro som do jogo e as barras de energia e mana.
  * Regras que viram testes: margem do pulo, combo que pode ser vencido, piso de aviso e mana que dura pelo menos 30 s.
* **Fora do escopo:**
  * Golpes altos e um eixo vertical na simulação.
  * Motor genérico de chefes.
  * Redesenhar o E.
  * Modelos 3D ou animações novas.
  * Movimento durante o pulo.
  * Reajustar a horda.
  * Outros sons além do "não pode".
  * A fenda e o atordoamento na parede.
  * Níveis, arquétipos, armaduras, mundo aberto e tutorial.

## Alternativas consideradas

* **Dividir em duas etapas (D e energia contra o golem, depois F e o chefe):** rejeitada pelo autor. Em troca, o protótipo ganha chaves de diagnóstico.
* **O chefe conferir a energia do jogador antes do combo:** rejeitada pelo autor. Ficar sem energia é má gestão, e a barra visível basta.
* **Regra "o rolamento não desvia de golpe rasteiro":** rejeitada pelos revisores. É arbitrária e contradiz o VISAO. Foi trocada pela regra da duração.
* **Proibir o R, o E e andar como saídas do combo:** rejeitada pelo autor. O R já tem recarga longa, então D e F são naturalmente a saída mais barata.
* **Deixar a mana fora desta etapa:** rejeitada pelo autor. O VISAO cita a mana, e a etapa testa o personagem novo.
* **Altura como eixo vertical de verdade:** rejeitada pelos revisores. Uma etiqueta "rasteiro ou inteiro" basta.
* **Combo como uma ação única com vários golpes:** rejeitada pelos revisores, porque não cabe em `design/acoes.md`. O combo vira uma sequência de golpes normais.
* **Pular o protótipo:** rejeitada pelo autor, porque fere a trilha Estrutura.
* **Draft EGM antes do protótipo:** rejeitada pelo autor, porque o draft vira retrabalho se o protótipo mudar a ideia.
* **Outros chefes:** a "Corrente Pendular" (puxa o jogador) e o "Espelho Partido" (copia a última defesa do jogador). Os dois têm mais risco de parecer injustos.

## Pendências e avisos

* **Divergência com o código:** a primeira rodada falava em cerca de 19 testes ligados a "golem"; o código tem 85 ocorrências em 4 arquivos de teste. Quem vale é o código, e isso só pesa na fase em `src/`.
* **Fase em `src/`:** os testes que usam habilidades seguidas vão quebrar se a mana não cobrir. A saída é custo 0 nesses testes, ou mana inicial suficiente. Todo campo novo em `dados/` precisa de rótulo em `src/painel/rotulos.ts`.

## Histórico

* **Rodada 1:** apontou a tecla F, o rolamento passando pelo rasteiro, o combo com outras saídas, o resultado de golpe em dois estados e a energia sem regras. Tudo isso foi resolvido pelas decisões acima.
* **Rodada 2:** apontou a margem do pulo, a ordem do combo contraditória, a mana e a ação recusada sem regras, o primeiro som, as chaves de diagnóstico e o brief desatualizado. Tudo isso foi resolvido nesta versão. O autor aceitou os padrões propostos em 19/11/2026.
