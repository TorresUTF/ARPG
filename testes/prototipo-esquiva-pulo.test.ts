import configJs from "../prototipos/esquiva-pulo/config.js?raw";
import simJs from "../prototipos/esquiva-pulo/sim.js?raw";
import bossJs from "../prototipos/esquiva-pulo/boss.js?raw";
import passoJs from "../prototipos/esquiva-pulo/passo.js?raw";
import entradaJs from "../prototipos/esquiva-pulo/entrada.js?raw";
import desenhoJs from "../prototipos/esquiva-pulo/desenho.js?raw";
import { describe, expect, it } from "vitest";

// O protótipo é feito de scripts simples (sem módulos). Para testar a simulação, junta os arquivos sem tela e roda num escopo próprio.
/* eslint-disable @typescript-eslint/no-explicit-any */
const ler = (nome: string) => ({ "entrada.js": entradaJs, "desenho.js": desenhoJs } as Record<string, string>)[nome];
function carregar(): any {
  const codigo = [configJs, simJs, bossJs, passoJs].join("\n");
  return new Function(codigo + "\nreturn { C, AJUSTES, PADRAO, SW, novoJogo, passo, comando, comandoMover, criarGolpe, getS: () => s, passos, custoEnergia, motivoRecusa, escolherGolpe };")();
}
function novo(): any {
  const m = carregar();
  m.novoJogo();
  const s = m.getS();
  s.j.x = 10; s.j.y = 8; s.b.x = 12; s.b.y = 8; s.b.recCombo = 99;
  m.SW.travar = "arco"; m.SW.impeto = false;
  return m;
}
const andar = (m: any, n: number) => { for (let i = 0; i < n; i++) m.passo(); };
/** Põe o chefe já no meio do preparo de um golpe, com o jogador na área. */
function golpe(m: any, nome: string) { const s = m.getS(); s.b.g = m.criarGolpe(nome); s.b.estado = "golpe"; s.b.g.t = s.b.g.prep - 1; }
const resultados = (m: any) => m.getS().log.map((l: string) => l.split(" | ")[3]);

describe("protótipo esquiva-pulo", () => {
  it("task-11 AC1: o rolamento protege de qualquer golpe; o pulo só do rasteiro", () => {
    let m = novo(); golpe(m, "arco"); m.comando("d", 14, 8); andar(m, 20); // o chefe emenda outro golpe depois
    expect(resultados(m)).toEqual(["esquivado pelo D"]);
    m = novo(); golpe(m, "varredura"); m.comando("f", 10, 8); andar(m, 60);
    expect(resultados(m)).toEqual(["esquivado pelo F"]);
    m = novo(); golpe(m, "arco"); m.comando("f", 10, 8); andar(m, 20);
    expect(resultados(m)).toEqual(["atingido"]);
    m = novo(); m.SW.tudoInteiro = true; golpe(m, "varredura"); m.comando("f", 10, 8); andar(m, 25);
    expect(resultados(m)).toEqual(["atingido"]);
  });

  it("task-11 AC1: o rolamento não cobre o rasteiro até o fim, e o pulo tem margem de pelo menos 0,20 s", () => {
    const m = novo(); const C = m.C;
    expect(C.invencivelD).toBeLessThan(C.rasteiroAtivo);
    expect(C.protegeF - C.rasteiroAtivo).toBeGreaterThanOrEqual(0.19);
    expect(m.passos(C.invencivelD)).toBe(15);
    expect(m.passos(C.protegeF)).toBe(33);
    expect(m.passos(C.rasteiroAtivo)).toBe(21);
  });

  it("task-11 AC1: a tela cheia está na tecla L e o F é o pulo", () => {
    const e = ler("entrada.js");
    expect(e).toContain('k === "l") { alternarCheia()');
    expect(e).toContain('["q", "w", "e", "r", "d", "f"]');
  });

  it("task-11 AC2: D e F gastam energia, com taxa fixa por esquiva em sequência", () => {
    const m = novo(); const s = m.getS();
    m.comando("d", 14, 8); expect(s.j.energia).toBe(m.C.energiaMax - 30);
    andar(m, 30); // movimento do D acabou há pouco: o F é em sequência
    expect(m.custoEnergia("f")).toBe(35);
    s.j.energia = 100; s.j.acao = null; s.fimEsq = -9999;
    expect(m.custoEnergia("f")).toBe(20);
  });

  it("task-11 AC2: Q, W, E e R gastam mana, e a mana nunca bloqueia o D", () => {
    const m = novo(); const s = m.getS();
    m.comando("q", 14, 8); expect(s.j.mana).toBe(85);
    s.j.mana = 0; s.j.acao = null;
    expect(m.motivoRecusa("w")).toBe("mana");
    expect(m.motivoRecusa("d")).toBeNull();
  });

  it("task-11 AC3: ação recusada emite evento com o motivo e não começa a recarga", () => {
    const m = novo(); const s = m.getS();
    s.j.energia = 5; m.comando("d", 14, 8);
    s.j.mana = 0; m.comando("w", 14, 8);
    s.j.rec.e = 3; m.comando("e", 14, 8);
    expect(s.eventos.filter((e: any) => e.tipo === "recusa").map((e: any) => e.motivo)).toEqual(["energia", "mana", "recarga"]);
    expect(s.j.rec.w).toBe(0);
    expect(s.recusaTexto.texto).toBe("em recarga");
  });

  it("task-11 AC3: o bipe é um som gerado por código, no máximo um a cada 150 ms, com mudo", () => {
    const e = ler("entrada.js");
    expect(e).toContain('"square"');
    expect(e).toContain("< 150");
    expect(e).toContain("mudo");
  });

  it("task-11 AC4: o Ferreiro tem arco, varredura e combo Martelo e Foice, e a foice vem depois do martelo", () => {
    const m = novo(); const s = m.getS();
    expect(m.criarGolpe("arco").altura).toBe("inteiro");
    expect(m.criarGolpe("varredura").altura).toBe("rasteiro");
    m.SW.travar = "combo"; s.b.recCombo = 0;
    andar(m, 60 * 12);
    const nomes = s.log.map((l: string) => l.split(" | ")[1]);
    expect(nomes.slice(0, 2)).toEqual(["martelo", "foice"]);
  });

  it("task-11 AC4: o combo custa 65 de energia e dá para vencê-lo (F no martelo, D na foice)", () => {
    const m = novo(); const s = m.getS();
    expect(m.C.custoF + m.C.custoD + m.C.taxaSequencia).toBe(65);
    m.SW.travar = "combo"; s.b.recCombo = 0;
    for (let i = 0; i < 60 * 12 && s.log.length < 2; i++) {
      const g = s.b.g;
      if (g && g.nome === "martelo" && g.fase === "preparo" && g.prep - g.t === 12) m.comando("f", 10, 8);
      if (g && g.nome === "foice" && g.fase === "preparo" && g.prep - g.t === 6) m.comando("d", 14, 8);
      m.passo();
    }
    expect(resultados(m)).toEqual(["esquivado pelo F", "esquivado pelo D"]);
  });

  it("task-11 AC4: o aviso mínimo é de 0,5 s e o golpe 2 do combo cai pelo menos 0,5 s depois do golpe 1", () => {
    const m = novo(); const C = m.C;
    for (const k of ["preparoArco", "preparoVarredura", "avisoCombo", "intervaloCombo"]) expect(C[k]).toBeGreaterThanOrEqual(0.5);
  });

  it("task-11 AC4: o ímpeto sobe até 5,0 m/s e zera quando o chefe acerta", () => {
    const m = novo(); const s = m.getS();
    m.SW.impeto = true; s.j.x = 2; s.j.y = 2; s.b.x = 20; s.b.y = 14;
    andar(m, 60 * 4);
    expect(s.b.impeto).toBeGreaterThan(0.2);
    expect(m.C.velChefe + s.b.impeto).toBeLessThanOrEqual(5.0001);
    s.b.impeto = 0.8; s.j.x = 10; s.j.y = 8; s.b.x = 11; s.b.y = 8; golpe(m, "arco"); andar(m, 5);
    expect(s.b.impeto).toBe(0);
  });

  it("task-11 AC4: o chefe escolhe o golpe contra a última defesa (D leva à varredura, F ao arco)", () => {
    const m = novo(); const s = m.getS(); m.SW.travar = "auto";
    s.b.recCombo = 99;
    const contar = (def: string) => {
      let v = 0; s.j.ultimaDefesa = def;
      for (let i = 0; i < 300; i++) if (m.escolherGolpe() === "varredura") v++;
      return v;
    };
    expect(contar("D")).toBeGreaterThan(contar("F"));
  });

  it("task-11 AC4: pular a varredura deixa o chefe preso por cerca de 1 s a mais; aparar atordoa e cancela o combo", () => {
    let m = novo(); let s = m.getS();
    golpe(m, "varredura"); m.comando("f", 10, 8); andar(m, 60);
    expect(s.b.estado).toBe("golpe"); // ainda na recuperação punida (1,0 s), não na de 0,6 s
    m = novo(); s = m.getS(); s.j.rec.r = 0;
    golpe(m, "martelo"); m.comando("r", 10, 8); andar(m, 15); // a lâmina da varredura passa pelo jogador no meio do ativo
    expect(resultados(m)).toEqual(["aparado"]);
    expect(s.b.estado).toBe("atordoado");
    andar(m, 80); // o atordoamento dura 90 passos e o segundo golpe do combo não vem
    expect(s.b.estado).toBe("atordoado");
    expect(s.log.length).toBe(1);
  });

  it("task-11 AC5: o golpe acerta uma vez, no primeiro passo ativo em que o jogador está na área sem proteção", () => {
    const m = novo(); const s = m.getS();
    golpe(m, "varredura"); andar(m, 40);
    expect(resultados(m)).toEqual(["atingido"]);
    expect(s.j.vida).toBe(4);
  });

  it("task-11 AC5: fora da área o resultado é 'fora da área'", () => {
    const m = novo(); const s = m.getS();
    s.j.x = 1; golpe(m, "arco"); andar(m, 40);
    expect(resultados(m)).toEqual(["fora da área"]);
    expect(s.j.vida).toBe(5);
  });

  it("task-11 AC6: as chaves de diagnóstico, o registro e a tela final existem", () => {
    const e = ler("entrada.js"), d = ler("desenho.js");
    for (const t of ["Energia infinita", "Mana:", "Todos os golpes inteiros", "Travar golpe", "Ímpeto", "Velocidade 0,5x", "Pausa", "Jogador não morre", "Mudo", "Som da recarga", "Direção do D", "Chefe:"]) expect(e).toContain(t);
    for (const t of ["Rolamentos (D)", "Recusas:", "Dano levado", "energia zerada", "mana zerada"]) expect(d).toContain(t);
    const m = novo(); golpe(m, "arco");
    andar(m, 40);
    expect(m.getS().log[0]).toMatch(/\| arco \| inteiro \| atingido \| energia \d+ \| mana \d+/);
  });

  it("task-11 AC7: todos os números do brief são controles no painel", () => {
    const m = novo();
    const ids = new Set(m.AJUSTES.map((a: any[]) => a[0]));
    const doBrief = ["energiaMax", "custoD", "custoF", "taxaSequencia", "esperaEnergia", "regenEnergia", "distD", "duracaoD", "invencivelD", "recupD",
      "protegeF", "recupF", "rasteiroAtivo", "manaMax", "custoQ", "custoW", "custoE", "custoR", "regenMana", "avisoCombo", "intervaloCombo", "castigoCombo",
      "vidaChefe", "velChefe", "impetoMax", "raioVarredura", "frequenciaBipe", "duracaoBipe"];
    for (const k of doBrief) expect(ids.has(k), k).toBe(true);
    for (const k of ids as Set<string>) if (k !== "#") expect(k in m.PADRAO, k).toBe(true);
  });
});

describe("protótipo esquiva-pulo, rodada 2", () => {
  it("task-13 AC1: a varredura é uma lâmina que fere só quando passa pelo jogador, e continua rasteira", () => {
    let m = novo(); golpe(m, "varredura");
    expect(m.getS().b.g.altura).toBe("rasteiro");
    andar(m, 3);
    expect(m.getS().log).toEqual([]); // no começo do ativo a lâmina ainda não chegou
    andar(m, 40);
    expect(resultados(m)).toEqual(["atingido"]);
    m = novo(); golpe(m, "varredura"); m.getS().j.x = 14; andar(m, 40); // fora do arco da lâmina
    expect(resultados(m)).toEqual(["fora da área"]);
    m = novo(); golpe(m, "varredura"); m.comando("f", 10, 8); andar(m, 25);
    expect(resultados(m)).toEqual(["esquivado pelo F"]);
  });

  it("task-13 AC2: o salto cai onde o jogador estava, fere em área na aterrissagem e dá para esquivar com o pulo (F)", () => {
    let m = novo(); let s = m.getS();
    s.b.x = 20; s.b.g = m.criarGolpe("salto"); s.b.estado = "golpe";
    expect(s.b.g.cx).toBe(10);
    andar(m, m.passos(m.C.preparoSalto) - 1);
    expect(s.log).toEqual([]);
    andar(m, 3);
    expect(Math.hypot(s.b.x - 10, s.b.y - 8)).toBeLessThan(0.01);
    expect(resultados(m)).toEqual(["atingido"]);
    m = novo(); s = m.getS();
    s.b.x = 20; s.b.g = m.criarGolpe("salto"); s.b.estado = "golpe";
    andar(m, m.passos(m.C.preparoSalto) - 20); m.comando("f", 10, 8); andar(m, 30);
    expect(resultados(m)).toEqual(["esquivado pelo F"]);
    m = novo(); s = m.getS();
    s.b.x = 20; s.b.g = m.criarGolpe("salto"); s.b.estado = "golpe"; s.j.x = 2;
    andar(m, 80);
    expect(resultados(m)).toEqual(["fora da área"]);
  });

  it("task-13 AC2: o aviso do salto não desenha o anel que encolhe", () => {
    expect(ler("desenho.js")).not.toContain("raio * prog");
  });

  it("task-13 AC3: o chefe dá um sprint antes do combo quando está um pouco longe", () => {
    const m = novo(); const s = m.getS();
    m.SW.travar = "combo"; s.b.recCombo = 0; s.b.x = 17; s.j.x = 10;
    const estados = new Set<string>();
    for (let i = 0; i < 120; i++) { m.passo(); estados.add(s.b.estado); }
    expect(estados.has("sprint")).toBe(true);
    expect(s.log.length + (s.b.g ? 1 : 0)).toBeGreaterThan(0);
  });

  it("task-13 AC3: a rajada tem recuperação curta e o último golpe abre a janela para kitar", () => {
    let m = novo(); let s = m.getS();
    s.b.rajada = 2; golpe(m, "arco"); s.j.x = 1; andar(m, 15);
    expect(s.b.g.recupReal).toBe(Math.round(m.passos(m.C.recupArco) * m.C.fatorRajada));
    m = novo(); s = m.getS();
    s.b.rajada = 1; golpe(m, "arco"); s.j.x = 1; andar(m, 15);
    expect(s.b.g.recupReal).toBe(m.passos(m.C.recupArco));
    andar(m, m.passos(m.C.recupArco) + 2);
    expect(s.b.estado).toBe("janela");
    andar(m, m.passos(m.C.janelaKitar) + 2);
    expect(s.b.estado).not.toBe("janela");
  });

  it("task-13 AC3: as recuperações do chefe encolheram, sem tocar no aviso mínimo de 0,5 s", () => {
    const C = novo().C;
    expect(C.recupVarredura).toBeLessThanOrEqual(0.45);
    expect(C.recupArco).toBeLessThanOrEqual(0.45);
    expect(C.castigoCombo).toBeLessThan(1.5);
    for (const k of ["preparoArco", "preparoVarredura", "avisoCombo", "intervaloCombo", "preparoSalto"]) expect(C[k]).toBeGreaterThanOrEqual(0.5);
  });

  it("task-13 AC4: mais vida do chefe, D mais curto que o E e energia menor, tudo no painel", () => {
    const m = novo(); const C = m.C;
    expect(C.vidaChefe).toBeGreaterThan(120);
    expect(C.distD).toBeLessThan(C.distE);
    expect(C.energiaMax).toBeLessThan(100);
    expect(C.energiaMax).toBeGreaterThanOrEqual(C.custoF + C.custoD + C.taxaSequencia);
    const ids = new Set(m.AJUSTES.map((a: any[]) => a[0]));
    for (const k of ["vidaChefe", "distD", "energiaMax", "raioSalto", "anguloVarredura", "velSprint", "fatorRajada", "janelaKitar"]) expect(ids.has(k), k).toBe(true);
  });

  it("task-13 AC3: o Ferreiro não fica parado no preparo do golpe: anda até o jogador, e o golem continua parado", () => {
    let m = novo(); let s = m.getS();
    s.j.x = 2; s.b.x = 12; golpe(m, "arco"); s.b.g.t = 0;
    andar(m, 20);
    expect(s.b.x).toBeLessThan(12);
    expect(s.b.g.aimx).toBeLessThan(0); // a mira continua a do começo
    m = novo(); s = m.getS(); m.SW.chefe = "golem";
    s.j.x = 2; s.b.x = 12; golpe(m, "golem"); s.b.g.t = 0;
    andar(m, 20);
    expect(s.b.x).toBe(12);
  });

  it("task-13 AC1: a foice também é uma lâmina, vem pelo caminho contrário do martelo e continua inteira", () => {
    const m = novo(); const s = m.getS();
    const martelo = m.criarGolpe("martelo");
    const foice = m.criarGolpe("foice", -martelo.sentido);
    expect(foice.forma).toBe("varre");
    expect(foice.altura).toBe("inteiro");
    expect(foice.sentido).toBe(-martelo.sentido);
    s.b.g = foice; s.b.estado = "golpe"; foice.t = foice.prep - 1;
    andar(m, 2);
    expect(s.log).toEqual([]); // a lâmina ainda não chegou ao jogador
    andar(m, 30);
    expect(resultados(m)).toEqual(["atingido"]);
  });

  it("task-13 AC4: menos mana por segundo, E mais caro em mana e com recarga maior", () => {
    const C = novo().C;
    expect(C.regenMana).toBeLessThan(6);
    expect(C.custoE).toBeGreaterThan(10);
    expect(C.recargaE).toBeGreaterThan(6);
  });
});
