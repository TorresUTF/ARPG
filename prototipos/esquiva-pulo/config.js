// Números do protótipo (metros e segundos). Valores iniciais: concepts_brief-chefe-novo.md#Números iniciais do protótipo.
// Todo número daqui vira um controle no painel (ajustes.js lê a lista AJUSTES).
const PADRAO = {
  // Personagem
  velJogador: 5.5, vidaJogador: 5,
  // Energia
  energiaMax: 85, custoD: 30, custoF: 20, taxaSequencia: 15, janelaSequencia: 0.6,
  esperaEnergia: 0.8, regenEnergia: 60,
  // Rolamento (D)
  distD: 2.2, duracaoD: 0.30, invencivelD: 0.25, recupD: 0.15,
  // Pulo (F)
  protegeF: 0.55, recupF: 0.10,
  // Mana
  manaMax: 100, custoQ: 15, custoW: 20, custoE: 10, custoR: 15, regenMana: 6,
  // Ataque básico
  preparoAtaque: 0.25, recupAtaque: 0.20, alcance: 6, velProjetil: 20, danoAA: 2,
  // Q, W, E, R (versão enxuta das habilidades do chefe-dash)
  preparoQ: 0.20, recupQ: 0.15, alcanceQ: 9, velQ: 24, larguraQ: 0.5, danoQ: 10, recargaQ: 5,
  preparoW: 0.25, recupW: 0.15, alcanceW: 8, velW: 18, larguraW: 0.6, danoW: 4, recargaW: 8,
  duracaoMarca: 5, cargasMarca: 3, danoMarca: 15,
  distE: 4, velE: 25, recupE: 0.10, recargaE: 6,
  janelaAparo: 0.25, recupAparo: 0.5, recargaAparo: 12, atordoamento: 1.5,
  guardarComando: 0.4,
  // Chefe (valores do Ferreiro; o golem usa só vidaChefe, velChefe e os números do golem)
  vidaChefe: 200, velChefe: 4.0, impetoMax: 5.0, impetoSobe: 0.4,
  // Arco de lâmina (inteiro)
  alcanceArco: 3.2, anguloArco: 50, preparoArco: 0.6, ativoArco: 0.15, recupArco: 0.45,
  // Varredura de solo (rasteira)
  raioVarredura: 3.5, anguloVarredura: 110, larguraLamina: 1.0, preparoVarredura: 0.5, rasteiroAtivo: 0.35, recupVarredura: 0.45, recupPunida: 1.0,
  // Combo Martelo e Foice
  avisoCombo: 1.2, intervaloCombo: 0.5, alcanceFoice: 3.2, anguloFoice: 70, ativoFoice: 0.15, castigoCombo: 1.0, recargaCombo: 6,
  // Salto: o chefe pula até onde você estava e causa dano em área ao aterrissar
  raioSalto: 2.8, preparoSalto: 0.8, ativoSalto: 0.10, recupSalto: 0.6, alcanceSalto: 7, minSalto: 3.5,
  // Sprint antes do combo e ritmo quebrado (rajada de golpes, depois janela para kitar)
  velSprint: 9, sprintMax: 0.5, sprintAlcance: 4,
  rajadaMin: 2, rajadaMax: 4, fatorRajada: 0.4, janelaKitar: 2.0, velJanela: 0.5,
  // Golem (modo de comparação)
  raioGolem: 2.6, preparoGolem: 0.7, ativoGolem: 0.10, recupGolem: 0.9,
  // Piso de aviso (só um alerta no painel: avisa se algum aviso ficar abaixo)
  pisoAviso: 0.5,
  // Som
  frequenciaBipe: 150, duracaoBipe: 0.09,
};
const AJUSTES = [
  ["#", "Energia"],
  ["energiaMax", "Energia máxima", 20, 300, 5],
  ["custoD", "Custo do D", 0, 100, 1],
  ["custoF", "Custo do F", 0, 100, 1],
  ["taxaSequencia", "Taxa por esquiva em sequência", 0, 60, 1],
  ["janelaSequencia", "Janela de 'em sequência' (s)", 0, 2, 0.05],
  ["esperaEnergia", "Espera antes de regenerar (s)", 0, 3, 0.05],
  ["regenEnergia", "Regeneração de energia (por s)", 0, 200, 5],
  ["#", "Rolamento (D)"],
  ["distD", "D: distância (m)", 1, 8, 0.1],
  ["duracaoD", "D: duração do movimento (s)", 0.1, 1, 0.01],
  ["invencivelD", "D: invencibilidade (s)", 0, 1, 0.01],
  ["recupD", "D: recuperação (s)", 0, 0.6, 0.01],
  ["#", "Pulo (F)"],
  ["protegeF", "F: proteção contra rasteiro (s)", 0.1, 1.5, 0.01],
  ["recupF", "F: recuperação (s)", 0, 0.6, 0.01],
  ["#", "Mana"],
  ["manaMax", "Mana máxima", 20, 300, 5],
  ["custoQ", "Custo de mana do Q", 0, 60, 1],
  ["custoW", "Custo de mana do W", 0, 60, 1],
  ["custoE", "Custo de mana do E", 0, 60, 1],
  ["custoR", "Custo de mana do R", 0, 60, 1],
  ["regenMana", "Regeneração de mana (por s)", 0, 30, 0.5],
  ["#", "Personagem e ataque básico"],
  ["velJogador", "Velocidade do jogador (m/s)", 2, 10, 0.1],
  ["vidaJogador", "Vida do jogador (golpes)", 1, 10, 1],
  ["preparoAtaque", "Ataque básico: preparo (s)", 0, 0.8, 0.01],
  ["recupAtaque", "Ataque básico: recuperação (s)", 0, 0.8, 0.01],
  ["alcance", "Ataque básico: alcance (m)", 2, 14, 0.5],
  ["danoAA", "Ataque básico: dano", 0, 20, 1],
  ["guardarComando", "Comando guardado por (s)", 0, 1, 0.05],
  ["#", "Q, W, E, R"],
  ["danoQ", "Q: dano", 0, 50, 1], ["recargaQ", "Q: recarga (s)", 0, 20, 0.5],
  ["danoW", "W: dano do tiro", 0, 50, 1], ["recargaW", "W: recarga (s)", 0, 20, 0.5],
  ["danoMarca", "Marca do W: dano da explosão", 0, 80, 1],
  ["distE", "E: distância (m)", 1, 10, 0.5], ["recargaE", "E: recarga (s)", 0, 20, 0.5],
  ["janelaAparo", "R: janela do aparo (s)", 0.05, 1, 0.01], ["recargaAparo", "R: recarga (s)", 0, 30, 0.5],
  ["atordoamento", "R: atordoamento do chefe ao aparar (s)", 0, 4, 0.1],
  ["#", "Chefe: geral"],
  ["vidaChefe", "Vida do chefe", 20, 400, 5],
  ["velChefe", "Velocidade do chefe (m/s)", 1, 9, 0.1],
  ["impetoMax", "Ímpeto: velocidade máxima (m/s)", 1, 9, 0.1],
  ["impetoSobe", "Ímpeto: ganho (m/s por s)", 0, 2, 0.05],
  ["#", "Ferreiro: arco e varredura"],
  ["alcanceArco", "Arco: alcance (m)", 1, 6, 0.1], ["anguloArco", "Arco: meio-ângulo (graus)", 10, 90, 5],
  ["preparoArco", "Arco: aviso (s)", 0.2, 1.5, 0.05], ["ativoArco", "Arco: tempo ativo (s)", 0.02, 0.6, 0.01],
  ["recupArco", "Arco: recuperação (s)", 0, 2, 0.05],
  ["raioVarredura", "Varredura: alcance da lâmina (m)", 1, 6, 0.1], ["anguloVarredura", "Varredura: meio-arco da lâmina (graus)", 30, 180, 5], ["larguraLamina", "Varredura: largura da lâmina (m)", 0.2, 2, 0.1], ["preparoVarredura", "Varredura: aviso (s)", 0.2, 1.5, 0.05],
  ["rasteiroAtivo", "Varredura: tempo ativo (s)", 0.05, 1, 0.01], ["recupVarredura", "Varredura: recuperação (s)", 0, 2, 0.05],
  ["recupPunida", "Varredura pulada: recuperação punida (s)", 0, 3, 0.1],
  ["#", "Ferreiro: salto"],
  ["raioSalto", "Salto: raio da aterrissagem (m)", 1, 5, 0.1], ["preparoSalto", "Salto: aviso e tempo no ar (s)", 0.3, 1.5, 0.05],
  ["ativoSalto", "Salto: tempo ativo (s)", 0.02, 0.6, 0.01], ["recupSalto", "Salto: recuperação (s)", 0, 2, 0.05],
  ["alcanceSalto", "Salto: usa a partir de (m)", 3, 12, 0.5], ["minSalto", "Salto: não usa mais perto que (m)", 1, 8, 0.5],
  ["#", "Ferreiro: sprint e ritmo quebrado"],
  ["velSprint", "Sprint antes do combo: velocidade (m/s)", 5, 16, 0.5], ["sprintMax", "Sprint: duração máxima (s)", 0.1, 1.5, 0.05],
  ["sprintAlcance", "Sprint: começa a partir de (m além do alcance)", 0, 8, 0.5],
  ["rajadaMin", "Rajada: mínimo de golpes", 1, 6, 1], ["rajadaMax", "Rajada: máximo de golpes", 1, 8, 1],
  ["fatorRajada", "Rajada: recuperação multiplicada por", 0.1, 1, 0.05],
  ["janelaKitar", "Janela para kitar depois da rajada (s)", 0, 5, 0.1], ["velJanela", "Janela: velocidade do chefe (fração)", 0.1, 1, 0.05],
  ["#", "Ferreiro: combo Martelo e Foice"],
  ["avisoCombo", "Combo: aviso do golpe 1 (s)", 0.5, 2.5, 0.05],
  ["intervaloCombo", "Combo: intervalo até o golpe 2 (s)", 0.1, 1.5, 0.05],
  ["alcanceFoice", "Foice: alcance (m)", 1, 6, 0.1], ["anguloFoice", "Foice: meio-ângulo (graus)", 10, 180, 5],
  ["ativoFoice", "Foice: tempo ativo (s)", 0.02, 0.6, 0.01],
  ["castigoCombo", "Combo: chefe parado no fim (s)", 0, 3, 0.1], ["recargaCombo", "Combo: recarga (s)", 0, 20, 0.5],
  ["#", "Golem (comparação)"],
  ["raioGolem", "Golem: tamanho do círculo (m)", 1, 5, 0.1], ["preparoGolem", "Golem: aviso (s)", 0.2, 1.5, 0.05],
  ["recupGolem", "Golem: recuperação (s)", 0, 2, 0.05],
  ["#", "Som"],
  ["frequenciaBipe", "Bipe: frequência (Hz)", 80, 600, 10], ["duracaoBipe", "Bipe: duração (s)", 0.04, 0.2, 0.01],
];
const C = { ...PADRAO };
