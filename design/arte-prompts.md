# Prompts para a arte final

A pixel art em `prototipos/kiting/arte/` foi só para o protótipo. Este documento guarda os prompts para gerar a arte final em um gerador de imagens.

Os prompts estão em inglês porque os geradores comuns respondem melhor nessa língua. Funcionam como texto puro em qualquer gerador; onde houver campo de "prompt negativo", use a linha **Negative** que acompanha cada um.

## Como usar

1. Gere as cinco imagens da etapa 1. Todas mostram a mesma cena, para comparar só o estilo.
2. Escolha um estilo (ou uma mistura de dois).
3. Copie o bloco de estilo escolhido para a lacuna `[ESTILO]` do prompt-modelo da etapa 2 e gere as peças, uma de cada vez.
4. Para as peças ficarem coerentes entre si, use a imagem aprovada da etapa 1 como referência de estilo, se o gerador aceitar imagem de referência.

## Regras de leitura que toda imagem respeita

Estas regras vêm do `CONTRATO.md` do protótipo e do pilar da legibilidade do `VISAO.md`. Elas estão escritas dentro de todos os prompts.

- **Vermelho forte** só nas áreas de golpe no chão. O piso e os personagens não usam vermelho.
- **Jogador** em azul-claro, distinto do azul escuro de um dos golpes do chefe.
- **Chefe** troca o brilho do corpo inteiro no preparo de cada golpe: azul escuro (círculo), amarelo (saturno), verde (linha).
- **Roxo** é a cor da marca do W.
- Câmera alta, olhando de cima com leve inclinação, e silhuetas fortes que se leem pequenas na tela.
- As áreas de golpe e de acerto vêm dos dados em metros, nunca do tamanho da imagem. A arte pode ser trocada sem mudar as regras.

---

## Etapa 1: cinco estilos, mesma cena

### Cena de referência (igual nos cinco)

Uma arena de pedra fechada, vista de cima. À esquerda, o atirador encapuzado em azul-claro mirando uma besta de mão. À direita, o chefe (um grande boneco de treino redondo de barro, preso a dois postes de madeira com cordas) no meio do preparo do golpe "saturno": o corpo inteiro brilha em amarelo, e no chão em volta dele aparece um círculo central e um anel externo em vermelho, com uma faixa segura entre os dois. Um tiro roxo voa do jogador até o chefe, e um anel roxo de marca envolve o chefe.

### 1. Pintura digital sombria

Fantasia sombria pintada à mão, com luz dramática e pinceladas visíveis. Realista nas proporções, mas com acabamento de ilustração.

```
High-angle top-down game screenshot, camera tilted about 60 degrees looking down, 16:9.
STYLE: painterly dark fantasy, realistic proportions, hand-painted digital oil textures, visible brushwork, dramatic warm torchlight against cool shadows, rich but muted palette, high detail, polished concept-art finish.
SCENE: an enclosed circular stone arena with worn flagstone floor in cold grey and brown tones, low broken walls and two iron braziers at the edges.
On the left, a lean hooded marksman in a light sky-blue cloak and dark leather armor, aiming a compact hand crossbow to the right; clear readable silhouette.
On the right, a large round boss: a hulking clay training dummy bound with ropes to two thick wooden posts, its whole body glowing bright yellow from within as it charges an attack.
On the floor around the boss, a bright red telegraph shape: a filled red circle under the boss and a separate red ring further out, with a clean safe band of plain floor between them.
A violet bolt flies from the marksman toward the boss, and a thin glowing violet ring encircles the boss's base.
READABILITY: strong red is used ONLY for the floor telegraph; no red in the floor, walls or characters. Characters stand out clearly from the floor. No text, no user interface.
Negative: text, letters, watermark, UI, health bars, red floor, red clothing, side view, first-person view, blurry, cropped characters, extra limbs.
```

### 2. 3D semi-realista renderizado

Como um jogo moderno em 3D: materiais realistas (pedra, couro, barro), luz suave e sombras precisas, formas um pouco estilizadas para se lerem pequenas.

```
High-angle top-down game screenshot, camera tilted about 60 degrees looking down, 16:9.
STYLE: semi-realistic 3D render, physically based materials (rough stone, worn leather, cracked clay, splintered wood), soft global illumination, crisp contact shadows, subtle ambient occlusion, slightly stylized chunky proportions for readability, clean high-end modern action game look.
SCENE: an enclosed circular stone arena with worn flagstone floor in cold grey and brown tones, low broken walls and two iron braziers at the edges.
On the left, a lean hooded marksman in a light sky-blue cloak and dark leather armor, aiming a compact hand crossbow to the right; clear readable silhouette.
On the right, a large round boss: a hulking clay training dummy bound with ropes to two thick wooden posts, its whole body emitting a bright yellow glow as it charges an attack.
On the floor around the boss, a bright red telegraph decal: a filled red circle under the boss and a separate red ring further out, with a clean safe band of plain floor between them.
A violet energy bolt flies from the marksman toward the boss, and a thin glowing violet ring encircles the boss's base.
READABILITY: strong red is used ONLY for the floor telegraph; no red in the floor, walls or characters. Characters stand out clearly from the floor. No text, no user interface.
Negative: text, letters, watermark, UI, health bars, red floor, red clothing, side view, first-person view, plastic toy look, blurry, cropped characters, extra limbs.
```

### 3. Realismo sombrio e granulado

O mais realista dos cinco: cores dessaturadas, sujeira, desgaste e névoa. Ambiente pesado, onde só as cores do jogo (azul-claro, amarelo, vermelho, roxo) brilham.

```
High-angle top-down game screenshot, camera tilted about 60 degrees looking down, 16:9.
STYLE: gritty grounded realism, desaturated earthy palette, photographic material detail (wet stone, mud, frayed cloth, dented iron), thin drifting fog, overcast cold light, heavy grime and wear; the only saturated colors in the image are the gameplay colors.
SCENE: an enclosed circular stone arena with cracked, damp flagstone floor in cold grey and brown tones, low broken walls and two iron braziers at the edges.
On the left, a lean hooded marksman in a weathered light sky-blue cloak and dark leather armor, aiming a compact hand crossbow to the right; clear readable silhouette.
On the right, a large round boss: a hulking cracked clay training dummy bound with frayed ropes to two thick wooden posts, its whole body glowing bright yellow through the cracks as it charges an attack.
On the floor around the boss, a vivid red telegraph: a filled red circle under the boss and a separate red ring further out, with a clean safe band of plain floor between them.
A violet bolt flies from the marksman toward the boss, and a thin glowing violet ring encircles the boss's base.
READABILITY: strong red is used ONLY for the floor telegraph; no red in the floor, walls or characters. Characters stand out clearly from the floor despite the muted palette. No text, no user interface.
Negative: text, letters, watermark, UI, health bars, red floor, red clothing, blood, side view, first-person view, cartoon, blurry, cropped characters, extra limbs.
```

### 4. Ilustração em nanquim e aquarela

Traço de nanquim firme com aquarela por cima, como uma graphic novel adulta. Anatomia realista, contornos que deixam tudo muito legível.

```
High-angle top-down game screenshot, camera tilted about 60 degrees looking down, 16:9.
STYLE: refined ink and watercolor illustration, confident black ink linework with varied line weight, transparent watercolor washes, paper grain texture, realistic anatomy, mature graphic-novel look, limited palette with strong color accents.
SCENE: an enclosed circular stone arena with flagstone floor washed in cold grey and sepia, low broken walls and two iron braziers at the edges.
On the left, a lean hooded marksman in a light sky-blue cloak and dark leather armor, aiming a compact hand crossbow to the right; clear inked silhouette.
On the right, a large round boss: a hulking clay training dummy bound with ropes to two thick wooden posts, its whole body washed in glowing bright yellow as it charges an attack.
On the floor around the boss, a bold red telegraph: a filled red circle under the boss and a separate red ring further out, with a clean safe band of plain floor between them.
A violet bolt flies from the marksman toward the boss, and a thin violet ring encircles the boss's base.
READABILITY: strong red is used ONLY for the floor telegraph; no red in the floor, walls or characters. Characters stand out clearly from the floor. No text, no user interface.
Negative: text, letters, watermark, UI, health bars, red floor, red clothing, side view, first-person view, messy sketch, blurry, cropped characters, extra limbs.
```

### 5. Sprite pré-renderizado

Modelos 3D detalhados renderizados e "achatados" em imagens 2D, como os RPGs de computador clássicos com visual de alta resolução. É o estilo que mais combina com o Canvas 2D do jogo: cada peça vira uma imagem pronta.

```
High-angle top-down game screenshot, camera tilted about 60 degrees looking down, 16:9.
STYLE: high-resolution pre-rendered 3D sprites on a hand-crafted 2D background, classic computer role-playing game look modernized, detailed sculpted models, crisp edges, baked soft lighting from the top-left, subtle rim light on characters, rich textured background art.
SCENE: an enclosed circular stone arena with worn flagstone floor in cold grey and brown tones, low broken walls and two iron braziers at the edges.
On the left, a lean hooded marksman in a light sky-blue cloak and dark leather armor, aiming a compact hand crossbow to the right; clear readable silhouette.
On the right, a large round boss: a hulking clay training dummy bound with ropes to two thick wooden posts, its whole body glowing bright yellow as it charges an attack.
On the floor around the boss, a bright red telegraph: a filled red circle under the boss and a separate red ring further out, with a clean safe band of plain floor between them.
A violet bolt flies from the marksman toward the boss, and a thin glowing violet ring encircles the boss's base.
READABILITY: strong red is used ONLY for the floor telegraph; no red in the floor, walls or characters. Characters stand out clearly from the floor. No text, no user interface.
Negative: text, letters, watermark, UI, health bars, red floor, red clothing, side view, first-person view, pixel art, low resolution, blurry, cropped characters, extra limbs.
```

---

## Etapa 2: prompt-modelo para todas as peças

Geradores de imagem erram muito quando se pede uma folha inteira de quadros de uma vez. Por isso o modelo gera **uma peça (ou um quadro) por imagem**: o bloco comum fica igual e só a linha **PIECE** muda. Depois, as imagens são recortadas e montadas nas folhas do `CONTRATO.md`.

Preencha `[ESTILO]` com a linha **STYLE** do estilo escolhido na etapa 1.

### Bloco comum

```
Single game asset for a high-angle top-down 2D action game, camera tilted about 60 degrees looking down.
STYLE: [ESTILO]
PIECE: [PEÇA]
FRAMING: one subject only, centered, whole subject visible with a small margin, facing right unless stated, isolated on a plain flat neutral grey background (to be removed later), even lighting from the top-left, consistent scale with the other assets.
CHARACTERS: the player is a lean hooded marksman in a light sky-blue cloak and dark leather armor with a compact hand crossbow. The boss is a large round clay training dummy bound with ropes to two thick wooden posts.
COLOR RULES: no strong red anywhere (red is reserved for floor attack zones drawn by the game). The player's light sky-blue must stay clearly different from the boss's dark-blue windup glow. Violet is reserved for the mark effects.
Negative: text, letters, watermark, UI, background scenery, floor shadow shapes, multiple subjects, red, side view, cropped, blurry, extra limbs.
```

### Lista de peças (troque `[PEÇA]` por uma linha de cada vez)

Os nomes entre parênteses são os arquivos do `CONTRATO.md`. Use a mesma semente (seed) em todos os quadros de uma mesma peça, se o gerador permitir.

**Piso** (`chao`): 4 variações. Para o piso, troque o FRAMING por: `seamless tileable square floor texture seen from straight above, fills the whole image, no subject`.

- `worn grey-brown stone flagstone floor tile, variation 1 of 4, plain`
- `worn grey-brown stone flagstone floor tile, variation 2 of 4, with a hairline crack`
- `worn grey-brown stone flagstone floor tile, variation 3 of 4, with a little moss in the seams`
- `worn grey-brown stone flagstone floor tile, variation 4 of 4, with scattered pebbles and dust`

**Jogador** (`jogador`): 11 quadros, nesta ordem.

- `player idle, standing relaxed, crossbow lowered, frame 1 of 2`
- `player idle, standing relaxed, cloak slightly shifted by breathing, frame 2 of 2`
- `player walking, frame 1 of 4: left foot forward`
- `player walking, frame 2 of 4: feet passing, body upright`
- `player walking, frame 3 of 4: right foot forward`
- `player walking, frame 4 of 4: feet passing, cloak swinging`
- `player shot windup: crossbow raised and aimed to the right, body tense`
- `player shooting: crossbow firing to the right with a small muzzle flash, slight recoil`
- `player dashing to the right: body leaning low and forward, cloak streaming behind, light motion blur`
- `player parrying: crossbow held across the body as a guard, bracing stance`
- `player hit: flinching backward, head turned away`

**Chefe** (`boneco_*`): 2 quadros por estado (um leve balanço entre o quadro 1 e o 2), mais um quadro do clarão.

- `boss normal, neutral clay color, frame 1 of 2` e `frame 2 of 2, slightly swayed on its ropes` (`boneco_normal`)
- `boss charging the circle attack: whole body glowing deep dark blue, frame 1 of 2` e `frame 2 of 2, glow stronger` (`boneco_circulo`)
- `boss charging the saturn attack: whole body glowing bright yellow, frame 1 of 2` e `frame 2 of 2, glow stronger` (`boneco_saturno`)
- `boss charging the line attack: whole body glowing bright green, frame 1 of 2` e `frame 2 of 2, glow stronger` (`boneco_linha`)
- `boss recovering after an attack: body darkened and slumped, ropes slack, frame 1 of 2` e `frame 2 of 2` (`boneco_recuperacao`)
- `boss stunned after a parry: body grey and tilted, small spinning stars above it, frame 1 of 2` e `frame 2 of 2, stars rotated` (`boneco_atordoado`, precisa ser bem diferente da recuperação)
- `boss taking damage: whole silhouette flashed pure white` (`boneco_atingido`)

**Tiros**, voando para a direita:

- `small fast crossbow bolt with a short pale-blue trail, basic attack projectile` (`tiro_aa`)
- `heavier glowing crossbow bolt with a bright light-blue energy trail, skill shot projectile` (`tiro_q`)
- `crossbow bolt wrapped in swirling violet energy, marking projectile` (`tiro_w`)

**Efeitos**:

- `thin glowing violet ring seen from above, empty center, mark around a target` (`marca`)
- `small violet charge gem, empty and dim` e `small violet charge gem, full and glowing` (`carga`, 2 quadros)
- `violet magical explosion seen from above`, em 4 quadros: `frame 1 of 4: small bright flash`, `frame 2 of 4: expanding burst`, `frame 3 of 4: wide ring of violet sparks`, `frame 4 of 4: fading smoke and sparks` (`explosao`)
- `pale-blue protective shimmer around a character seen from above`, em 3 quadros: `frame 1 of 3: faint`, `frame 2 of 3: brightest`, `frame 3 of 3: fading` (`aparo`)
- `small pale-blue ground marker seen from above, where the player clicked to move` (`destino`)

**Ícones das habilidades** (`icones`): troque o FRAMING por `square ability icon, bold simple symbol, dark framed background, readable at 44 pixels`.

- `ability icon Q: a glowing light-blue crossbow bolt`
- `ability icon W: a crossbow bolt wrapped in violet energy with a mark symbol`
- `ability icon E: a dashing cloaked figure with speed lines`
- `ability icon R: a crossbow raised as a guard with a pale-blue shimmer`

### Fora da lista

Ficam no código, sem arte: as áreas de golpe no chão, as barras de vida, as linhas de mira, o arco de preparo e o anel de alcance. Por isso nenhum prompt pede vermelho.

---

## Folha do chefe em um prompt só (feito para o Nano Banana)

Pedido do autor em 2026-11-13: gerar os 7 estados do chefe numa imagem só, sem editar prompt. Anexe ao gerador a imagem de estilo escolhida na etapa 1 e cole o texto abaixo sem mudar nada. O Nano Banana não tem campo de prompt negativo, então as proibições estão escritas dentro do texto.

```
Using the attached image as the style reference (same rendering, lighting, materials and level of detail), create a character sheet for a top-down action game boss.

The boss is a large round clay training dummy bound with ropes to two thick wooden posts, seen from a high camera tilted about 60 degrees looking down, facing right. Draw the exact same boss, same size, same pose and same camera angle, seven times, in a clean grid of 4 columns and 2 rows of equal square cells on a plain flat neutral grey background. Leave the eighth cell (bottom right) empty grey. Each cell shows one state, in this order, left to right, top to bottom:

1. Normal: natural clay color, calm, ropes taut.
2. Charging the circle attack: the whole body glows deep dark blue from within.
3. Charging the saturn attack: the whole body glows bright yellow from within.
4. Charging the line attack: the whole body glows bright green from within.
5. Recovering after an attack: body darkened to a dull brown, slumped forward, ropes slack.
6. Stunned after a parry: body turned flat grey and tilted to one side, with a few small spinning white stars above it. It must look clearly different from state 5.
7. Taking damage: the whole silhouette flashed pure white, same outline as state 1.

The color change must cover the entire body so each state reads instantly at small size. Keep every cell centered with the whole boss visible and a small margin. Do not use red anywhere, do not draw a floor, shadows shaped like areas, scenery, text, numbers, labels or borders between cells.
```

## Demais peças em três prompts (Nano Banana)

Pedido do autor em 2026-11-13, depois de aprovar a folha do chefe no estilo 3D semi-realista. Use na mesma conversa do Gemini em que a folha do chefe foi gerada, com a folha anexada como referência. As peças ficam em três imagens porque, com muitos itens numa imagem só, o gerador tende a misturar ou pular peças.

### 1. Personagem (11 quadros)

```
Using the attached boss sheet as the style reference (semi-realistic 3D render, physically based materials, soft global illumination, crisp contact shadows, slightly stylized chunky proportions for readability, clean high-end modern action game look), create an animation sheet for the player character of the same top-down action game.

The player is a lean hooded marksman in a light sky-blue hooded cloak and dark leather armor, holding a compact hand crossbow, seen from the same high camera tilted about 60 degrees looking down, facing right. The cloak must be a clear light sky-blue, never dark blue. The character is much smaller than the boss in the game, so keep a bold, simple silhouette that reads at small size.

Draw the exact same character, same size and same camera angle, eleven times, in a clean grid of 4 columns and 3 rows of equal square cells on a plain flat neutral grey background. Leave the twelfth cell (bottom right) empty grey. Each cell shows one frame, in this order, left to right, top to bottom:

1. Idle: standing relaxed, crossbow lowered.
2. Idle: same as 1, cloak slightly shifted by breathing.
3. Walking: left foot forward.
4. Walking: feet passing, body upright.
5. Walking: right foot forward.
6. Walking: feet passing, cloak swinging.
7. Shot windup: crossbow raised and aimed to the right, body tense.
8. Shooting: crossbow firing to the right with a small pale-blue muzzle flash, slight recoil.
9. Dashing to the right: body leaning low and forward, cloak streaming behind.
10. Parrying: crossbow held across the body as a guard, bracing stance, a faint pale-blue shimmer around him.
11. Hit: flinching backward, head turned away.

Keep every cell centered with the whole character visible and a small margin. Do not use red anywhere, do not draw a floor, scenery, text, numbers, labels or borders between cells.
```

### 2. Tiros e efeitos (14 peças)

```
Using the attached boss sheet as the style reference (semi-realistic 3D render, physically based materials, soft global illumination, clean high-end modern action game look), create a sheet of projectiles and visual effects for the same top-down action game, seen from the same high camera looking down.

Use a clean grid of 4 columns and 4 rows of equal square cells on a plain flat neutral grey background. Each row is one group, left to right:

Row 1, projectiles flying to the right:
1. A small, fast crossbow bolt with a short pale-blue trail (basic attack).
2. A heavier crossbow bolt with a bright light-blue glowing energy trail (skill shot).
3. A crossbow bolt wrapped in swirling violet energy (marking shot).
4. A thin glowing violet ring seen from above, empty center, the mark that circles a target.

Row 2, small markers:
5. A small violet charge gem, empty and dim.
6. The same violet charge gem, full and glowing.
7. A small pale-blue ground marker seen from above, showing where the player clicked to move.
8. Empty grey cell.

Row 3, a violet magical explosion seen from above, four animation frames:
9. Small bright violet flash.
10. Expanding violet burst.
11. Wide ring of violet sparks.
12. Fading violet smoke and sparks.

Row 4, a pale-blue protective shimmer around an invisible character, seen from above, three animation frames:
13. Faint shimmer.
14. Brightest shimmer.
15. Fading shimmer.
16. Empty grey cell.

Each effect is centered in its cell with a small margin. Violet is only for the mark effects, pale blue only for the player's effects. Do not use red anywhere, do not draw characters, a floor, scenery, text, numbers, labels or borders between cells.
```

### 3. Ícones das habilidades (4)

```
Using the attached boss sheet as the style reference (semi-realistic 3D render, physically based materials, soft lighting, clean high-end modern action game look), create four ability icons for the same action game, in a single row of 4 equal square cells on a plain flat neutral grey background.

Each icon is a square with a dark worn-metal frame and a dark background, with one bold, simple symbol in the center that reads clearly at 44 pixels. Left to right:

1. Q: a glowing light-blue crossbow bolt flying diagonally.
2. W: a crossbow bolt wrapped in violet energy, with a small violet ring behind it.
3. E: a hooded light-blue figure dashing forward with speed lines.
4. R: a crossbow raised as a guard, with a pale-blue shimmer around it.

All four icons share the same frame, size and lighting. Do not use red anywhere, and do not draw text, letters, numbers or labels.
```
