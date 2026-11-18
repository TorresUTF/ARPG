# Mundo, progressão e plano de construção do jogo

* **Author:** Gabriel Torres Andreassa
* **Date:** 2026-11-10

## Overview

O protótipo de combate (`prototipos/kiting`) tem um personagem, um chefe e uma arena, e o autor o considera divertido. A proposta é transformar esse combate em um RPG de ação 3D visto de cima, para dar ao jogador um motivo de continuar jogando: explorar, montar builds e avançar numa história.

A hipótese revisada:

- **Mundo.** Um mapa aberto visto em câmera alta, onde o jogador explora. Não existe terreno contínuo na escala de batalha. A câmera só desce para o modo batalha (a escala do protótipo, arena de cerca de 24 × 16 m) dentro de lugares fechados: chefes da história, dungeons que terminam em horda (mobs fracos mais um mini-chefe) e emboscadas. Névoa cobre as áreas não exploradas. Fogueiras salvam o jogo e permitem teletransporte.
- **Mobs.** Inimigos fracos com uma habilidade cada, que morrem entre dois ataques básicos e uma rotação de habilidades. A horda funciona como um jogo de desviar: muitos disparos lentos e anunciados ao mesmo tempo.
- **Progressão.** Builds em quatro camadas: o brasão (arquétipo) muda o ataque básico e dá um bônus de status base; as habilidades são loot de lugar fixo e trocam Q, W, E e R; cada nível aumenta um atributo, que fortalece as habilidades e nunca a vida; a armadura dá uma passiva. Os detalhes estão no item 4 das decisões.
- **Tecnologia.** TypeScript, Canvas 2D, Vite e Vitest, como já está no `CLAUDE.md`. Mapas no editor Tiled. Empacotamento para a Steam mais tarde.
- **Plano.** Construir as fundações e uma primeira fatia (uma área, uma dungeon, um chefe, cerca de três artefatos, uma fogueira) e cronometrar. Meta declarada pelo autor: uma área a cada duas semanas, jogo pronto em dois anos, com 80 a 120 horas e 20 a 30 chefes.
- **Equipe.** O autor, cerca de 20 horas por semana, com um assistente de IA para o código. Um irmão talvez ajude.

## Analysis

Sete revisores independentes leram a hipótese. Os achados abaixo estão agrupados e em ordem de gravidade. Os números entre parênteses dizem quantos dos sete levantaram o ponto.

### 1. A proposta contradiz o `VISAO.md` em vigor (7 de 7)

O `VISAO.md` diz que o jogo não é de mundo aberto nem de exploração, e que não tem níveis, itens ou equipamentos que decidam a luta. O escopo escrito é "um personagem, um chefe, uma arena". O `CLAUDE.md` manda conferir toda mudança contra esse documento. Enquanto ele não for reescrito pelo autor, o assistente vai questionar cada tarefa ou seguir uma regra que o autor já abandonou.

Sugestão dos revisores: reescrever o `VISAO.md` antes de qualquer código, em duas camadas. A primeira é o núcleo que não muda (combate contra chefe, compromisso, legibilidade). A segunda é a camada de aventura (mundo, mobs, progressão), com limites escritos, por exemplo "o nível aumenta o dano, nunca a resistência".

### 2. O prazo não tem base medida (6 de 7)

Vinte horas por semana durante dois anos somam cerca de 2.000 horas. Com 20 a 30 chefes, isso dá de 65 a 100 horas por chefe, incluindo mapa, dungeon, mobs, artefatos, arte, ajuste e testes. A meta de uma área a cada duas semanas dá 40 horas para tudo isso. O único dado real é o protótipo, que tem um chefe com três golpes.

Sugestão dos revisores: tratar a primeira fatia como medição. Anotar as horas por tipo de tarefa (base técnica, mapa, mob, chefe, artefato, arte, ajuste, correções) e definir antes um limite de decisão, por exemplo "se a área custar mais de 60 horas, o escopo é cortado". Definir também um jogo mínimo que já possa ser lançado sozinho. Os revisores sugeriram faixas diferentes, de 3 a 10 chefes e de 3 a 30 horas de jogo. As 80 a 120 horas ficam como expansão.

### 3. Hordas de mobs fracos não foram provadas (7 de 7)

A diversão do protótipo vem de um boneco que avisa o golpe por 0,7 s enquanto o jogador decide se cabe mais um ataque. Um mob que morre em dois ataques quase nunca chega a golpear. Muitos disparos lentos ao mesmo tempo são outro tipo de jogo, com outra leitura, e podem ferir o pilar da legibilidade. Dungeons e emboscadas são cerca de metade do conteúdo planejado.

Sugestão dos revisores: antes de qualquer mapa, um protótipo só de horda em `prototipos/`, com uma sala, alguns mobs e um mini-chefe. O autor escreve antes o critério de aprovação, por exemplo "jogo dez minutos e quero repetir". Se a horda falhar, a dungeon vira uma sequência curta de mini-chefes, que reaproveita o que já funciona. O `CLAUDE.md` já exige esse protótipo para a trilha de Estrutura.

### 4. Nível que aumenta o dano pode esvaziar a luta (5 de 7)

Se o chefe morre em menos golpes, o jogador pode voltar mais forte e vencer sem aprender a luta. A luta também pode acabar antes de as janelas de combo aparecerem. Cada chefe passa a ser ajustado para uma faixa inteira de dano.

Sugestões dos revisores, que não são compatíveis entre si e pedem uma escolha do autor:

- teto de dano por área ou por chefe (por exemplo, no máximo 20% a mais);
- o dano do nível só vale na janela em que o chefe está vulnerável, para premiar quem executa o combo;
- trocar o nível por desbloqueio de opções, sem números.

Em qualquer caso: poucos níveis na primeira fatia, a tabela de níveis em um único arquivo de `dados/`, e um teste automático que confirma que a resistência do jogador não muda com o nível.

### 5. Artefatos que trocam qualquer tecla podem quebrar a luta (5 de 7)

Se um artefato substitui a habilidade que marca o chefe ou o aparo, o jogador fica sem a ferramenta que a luta exige. Com três artefatos por tecla já são 81 combinações para testar contra cada chefe.

Sugestão dos revisores: cada tecla tem um papel fixo (por exemplo marcar, aparar, mover, descarregar) e o artefato muda só a forma de cumprir o papel. Todos os artefatos de uma tecla têm poder parecido. Nos dados, separar três coisas desde o início: a habilidade (o que faz), o artefato (o que a entrega) e a tecla (onde fica), com identificadores que nunca mudam. Começar com dois ou três artefatos e adiar as armaduras com passiva.

### 6. Dois modos de jogo dobram o trabalho técnico (4 de 7)

O mapa em câmera alta e a arena de batalha são dois sistemas, com movimento, escala e controle próprios. Entre eles há transições, salvamento, névoa e teletransporte, que precisam funcionar em qualquer ordem.

Sugestões dos revisores:

- A luta é uma peça fechada: recebe os combatentes e a arena, devolve "venceu" ou "morreu". O mapa só chama a luta. Assim o combate é testado sozinho.
- Para a primeira fatia, o mapa pode ser uma lista de lugares ligados por caminhos, guardada em um arquivo de dados, com a névoa por lugar. Três revisores recomendaram isso no lugar do mapa explorável, e um deles sugeriu uma simples tela de seleção.
- Emboscadas e transições animadas ficam fora da primeira fatia.

### 7. A regra de morte precisa ser decidida antes do salvamento (5 de 7)

O que o jogador perde ao morrer define o que o arquivo de salvamento guarda e como a fogueira reinicia a área. Mudar isso depois mexe em tudo.

Sugestão dos revisores: a regra mais simples. Morrer devolve o jogador à última fogueira, o chefe e os mobs reiniciam, nada mais é perdido. O custo é tempo. O jogo só salva em repouso, nunca no meio de uma luta.

### 8. Salvamento, dados e mapas precisam nascer preparados para mudar (3 de 7)

Cada área nova muda o que precisa ser salvo. Sem cuidado, cada atualização apaga o progresso de quem testa.

Sugestões dos revisores:

- o arquivo de salvamento tem um número de versão e guarda uma cópia do anterior;
- ele guarda nomes fixos (de artefatos, fogueiras, baús, chefes), nunca posições em listas nem coordenadas do mapa;
- toda leitura e gravação passa por uma única peça pequena, para que a troca do navegador pelo programa instalável mexa só nela;
- ao carregar mapas e dados, o jogo valida e mostra erros claros.

### 9. A arte não tem fonte para a escala planejada (5 de 7)

O `gerar.py` desenha cada peça a partir de grades de letras. Serve para marcar lugar, não para 25 chefes e dezenas de mobs com arte refinada. A câmera alta pede um segundo conjunto de arte em outra escala.

Sugestões dos revisores: fixar um estilo simples que o autor consegue produzir (silhuetas fortes, poucos quadros, cor por função). Fixar um orçamento de arte por chefe. Registrar no `CONTRATO.md` que as áreas de acerto e de aviso vêm dos dados em metros, nunca do tamanho da imagem, para que a arte possa ser trocada sem tocar nas regras. Se o irmão ajudar, arte e mapas são o melhor uso.

### 10. Ferramentas para o autor enxergar e reproduzir problemas (1 de 7)

- **Sorteio com semente fixa** na simulação, com gravação da semente e dos comandos, para repetir qualquer luta de forma idêntica. É barato agora e muito caro depois, e deve virar regra de arquitetura.
- **Registro por luta** (duração, golpes levados, qual golpe matou, tentativas), usando os eventos que a regra 7 do `CLAUDE.md` já prevê.
- **Menu de desenvolvedor** para criar inimigos, definir nível, dar artefatos e ir a qualquer fogueira.
- **Contador de desempenho** na tela, com um limite definido, por exemplo 60 quadros por segundo com 40 disparos.
- **Tabela automática de tempo para matar cada chefe** por nível e por artefato.

### 11. Tiled e Steam entram cedo demais (5 de 7)

São decisões de lançamento em um projeto que ainda não tem um jogo completo. O primeiro mapa cabe em um arquivo de dados. O Tiled entra quando houver mais lugares do que dá para manter à mão. O empacotamento espera um jogo curto e fechado. Um revisor recomendou Electron por ter mais exemplos, porque o Tauri exige ferramentas extras.

### 12. O protótipo não é igual ao `VISAO.md` (achado desta conversa)

A maioria dos revisores não abriu o protótipo e assumiu o conjunto de habilidades descrito no `VISAO.md`. O protótipo é diferente: o Q é um tiro mirado, o W marca o boneco e três ataques básicos explodem a marca, o E é o avanço e o R é o aparo. **O sistema de postura não existe no protótipo**, e também não existe a rajada de fecho. O que o autor achou divertido foi kiting, marca e aparo. A postura, que é um dos cinco pilares, nunca foi testada. O novo `VISAO.md` precisa dizer se a postura continua sendo pilar.

### Resultado ideal

O combate continua sendo o único código complexo. O mundo, os chefes, os mobs e os artefatos são arquivos de dados que chamam esse combate. Cada área nova custa conteúdo, não programação.

### Ordem de trabalho sugerida pelos revisores

1. O autor reescreve o `VISAO.md`.
2. Protótipo de horda, com critério de aprovação escrito antes.
3. Decisão da regra de morte, do papel de cada tecla e do limite do nível.
4. Primeira fatia, cronometrada por tipo de tarefa.
5. Só então, cadência e tamanho final do jogo.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  * Reescrever o `VISAO.md` para o jogo novo (feito pelo autor).
  * Provar em protótipo que a luta contra hordas diverte.
  * Entregar e cronometrar uma primeira fatia: uma área, uma dungeon, um chefe, dois ou três artefatos, uma fogueira.
  * Progressão por artefatos que trocam habilidades e por níveis que aumentam só o dano.
  * Salvamento com número de versão e nomes fixos desde a primeira fatia.
* **Out-of-Scope Non-Goals:**
  * Terreno contínuo na escala de batalha.
  * Níveis que aumentam a resistência do jogador.
  * Launcher próprio.
  * Empacotamento para a Steam antes de existir um jogo curto e fechado.
  * Armaduras com passiva, emboscadas e transições animadas na primeira fatia (proposto pelos revisores, ainda não confirmado pelo autor).
  * Compromisso com 80 a 120 horas e 20 a 30 chefes antes da medição (proposto pelos revisores, ainda não confirmado pelo autor).
  * PvP e arte final.

## Alternatives Weighed

* **Mundo contínuo percorrido a pé no modo batalha, com névoa atravessada lutando.** Rejeitado pelo autor: a arena tem 24 × 16 m, e um mundo nessa escala são milhares de telas para preencher, que o modo viagem serviria para pular.
* **Sem níveis, só artefatos.** Rejeitado pelo autor: ele quer que o jogador possa sair, explorar e voltar mais forte, como no Elden Ring.
* **Níveis que aumentam vida ou resistência.** Rejeitado pelo autor: o chefe deve continuar matando em 3 a 5 golpes em qualquer nível.
* **Godot como motor.** Rejeitado nesta conversa, com a escolha delegada pelo autor ao assistente: boa parte do trabalho no Godot é feita clicando no editor, onde o assistente de IA ajuda pouco. Em TypeScript tudo é texto e as regras rodam em testes automáticos.
* **Launcher próprio.** Rejeitado nesta conversa: a Steam já cumpre esse papel.
* **Construir o motor completo antes do conteúdo.** Rejeitado nesta conversa: peças reutilizáveis feitas antes do segundo chefe costumam ser as erradas. O reuso sai de construir a primeira área e extrair o que se repete na segunda.
* **Mapa de lugares ligados por caminhos (ou tela de seleção) no lugar do mapa explorável.** Em aberto. Recomendado por três revisores para a primeira fatia. O autor escolheu antes o mapa explorável em câmera alta.

## Key Decisions & Staging for Next Steps

Decididas:

* O jogo passa a ter mundo, progressão e história. O `VISAO.md` será reescrito.
* A câmera só desce para o modo batalha em lugares fechados.
* O nível aumenta o dano e nunca a resistência.
* Fogueiras salvam e teletransportam.
* A tecnologia do `CLAUDE.md` é mantida.
* A primeira fatia é cronometrada antes de qualquer promessa de prazo. O autor aceitou que a meta de dois anos e de uma área a cada duas semanas não tem base até essa medição.
* Um protótipo de horda em `prototipos/` vem antes da primeira fatia.
* O `VISAO.md` deve evoluir com o projeto, e o autor vai reescrevê-lo.

Em aberto, para o autor decidir antes do `/egm-draft`:

1. (Resolvida em 2026-11-11.) A postura deixa de ser pilar. Ela nunca existiu no protótipo, e a marca do W mais o atordoamento do aparo já abrem a janela de dano.
2. (Resolvida em 2026-11-11.) O protótipo de horda (`prototipos/horda`) passou no critério definido pelo autor antes de jogar: "depois de limpar a sala, quero jogar de novo sem ser obrigado". O autor jogou várias vezes. O que ele observou:
   * a sala ficou legível, mas só depois de aumentar o tempo de aviso dos mobs;
   * desviar e atacar ao mesmo tempo diverte, então a pergunta "cabe mais um ataque?" continua valendo contra hordas;
   * o aparo (R) não serve para matar mobs, mas tira o jogador de situações ruins;
   * a marca (W) só rendeu contra o mini-chefe;
   * com 8 mobs a sala continuou boa.

   Limites desse teste: uma pessoa, um dia, uma sala, três tipos de mob. Ele não diz se a décima dungeon ainda diverte. O autor rejeitou exigir o uso de todas as habilidades: uma habilidade pode ficar reservada para oponentes fortes.
3. (Resolvida em 2026-11-11.) O nível tem um teto de dano por área, com poucos níveis na primeira fatia.
4. (Resolvida em 2026-11-12; o segundo arquétipo foi provado em protótipo.) Builds em quatro camadas, pedidas pelo autor:
   * **brasão** (arquétipo): muda o ataque básico e dá um bônus de status base. Exemplos do autor: tanque com 100% a mais de vida, mago com recarga menor;
   * **habilidades** (Q, W, E, R): loot de lugar fixo, equipadas e desequipadas, cada uma escalando com um atributo;
   * **atributos**: cada nível aumenta um atributo;
   * **armadura**: dá uma passiva, com um preço. A mais frágil dá a passiva mais forte.

   O autor quer que builds mistas funcionem (mago assassino, lutador com passiva elétrica). Regras confirmadas por ele em 2026-11-12:
   * o brasão não restringe habilidades: qualquer habilidade entra em qualquer brasão;
   * nenhum atributo aumenta a vida. A vida vem só do brasão e da armadura, para o desvio continuar valendo;
   * brasão, habilidades e armadura são trocados só na fogueira; os pontos são redistribuídos na fogueira com um item raro de lugar fixo;
   * a primeira fatia passa a ter dois brasões, dois atributos, cerca de seis habilidades e duas armaduras.

   Resultado do protótipo `prototipos/lutador` (a sala da horda com um brasão de perto: 8 de vida, golpe corpo a corpo, Q em arco, W investida que marca), jogado pelo autor:
   * dá para jogar de perto e é divertido, sem mudar mobs nem mini-chefe;
   * com os números iniciais o lutador estava forte demais: colar no mini-chefe o matava antes de ele reagir. O autor reduziu o alcance do golpe de 1,3 m para 0,8 m e o dano de 4 para 3, e ficou bom. Depois preferiu manter o dano 4 com o ataque mais lento, por combinar mais com o lutador;
   * versão aprovada pelo autor em 2026-11-12: preparo de 0,35 s, e a recuperação do golpe virou uma espera de 0,5 s até o próximo ataque básico, que não prende o personagem no lugar. Ele bate e pode sair. Fica por decidir se o atirador segue a mesma regra;
   * mais velocidade de movimento para o lutador é uma ideia do autor, que ele mesmo pesa contra os dois avanços (W e E) que o brasão já tem.

   Custo que continua valendo: cada brasão é um ataque básico a desenhar e ajustar contra todos os chefes, e cada atributo pede habilidades para as quatro teclas.
5. (Resolvida em 2026-11-11.) Morte no estilo Dark Souls: a experiência não gasta fica no lugar da morte e pode ser recuperada. Ela só vira nível quando o jogador descansa na fogueira. Como as lutas acontecem em lugares fechados, o salvamento guarda o nome do lugar onde a experiência ficou.
6. (Resolvida em 2026-11-12; ver o item 10.) O mapa é explorável, contra a recomendação de três revisores, porque a exploração é metade do jogo pretendido e nunca foi testada. O protótipo `prototipos/viagem` testa o modo viagem com o mapa em um arquivo de dados, sem o Tiled.
7. (Provisória.) Jogo mínimo: três áreas e três chefes, a rever depois da fatia cronometrada.
8. (Resolvida em 2026-11-11.) A arte continua provisória até a fatia. Regra fixada: as áreas de acerto e de aviso vêm dos dados em metros, nunca do tamanho da imagem.
9. (Resolvida em 2026-11-11.) Os artefatos ficam em lugar fixo: cada dungeon e cada chefe da história entrega um artefato definido. O autor rejeitou o sorteio com raridade porque ele leva a repetir a mesma dungeon até o item cair, e ele não quer farm de loot no jogo. Do modelo do Silksong foi adotado o brasão como arquétipo (item 4). Ferramentas por categoria e espaços extras achados na exploração ficam como ideias, sem decisão.
10. (Resolvida em 2026-11-11, depois de o autor jogar `prototipos/viagem`.) O modo viagem foi aprovado, com estes acréscimos pedidos pelo autor e já no protótipo:
    * relevo e barreiras (montanhas, rio, pontes), para o jogador ter que cumprir uma sequência até chegar aonde quer;
    * três poções que curam um pouco fora da fogueira;
    * descansar na fogueira recupera vida e poções e faz as emboscadas voltarem. Refazer o caminho tem custo, seguir com pouca vida tem risco, e quem quiser pode repetir emboscadas para ganhar experiência.

    Consequência aceita pelo autor: repetir emboscadas é farm de experiência. O teto de dano por área (item 3) é o que limita o efeito.

    Acréscimos de 2026-11-12, também aprovados pelo autor depois de jogar:
    * o mapa é maior que a tela e a câmera acompanha o personagem;
    * o clique leva em linha reta e o personagem para no relevo. Não há trajeto automático: ele tirava do jogador a decisão de achar a passagem, mostrava o caminho por dentro da névoa e levava a emboscadas não escolhidas.
