// task-15: rodada 3 do protótipo (prototipos/ferreiro-3d/). Confere que a luta é a da rodada 2, que cada animação do
// ferreiro.glb toca na fase certa e dura o tempo da fase, que o espelho bate com o sentido do golpe, e que o Ferreiro não
// troca de cor nem desenha área no chão.
import configJs from "../prototipos/esquiva-pulo/config.js?raw";
import simJs from "../prototipos/esquiva-pulo/sim.js?raw";
import bossJs from "../prototipos/esquiva-pulo/boss.js?raw";
import passoJs from "../prototipos/esquiva-pulo/passo.js?raw";
import posturaJs from "../prototipos/ferreiro-3d/postura.js?raw";
import indexHtml from "../prototipos/ferreiro-3d/index.html?raw";
import cenaJs from "../prototipos/ferreiro-3d/cena.js?raw";
import entradaJs from "../prototipos/ferreiro-3d/entrada.js?raw";
import { beforeAll, describe, expect, it } from "vitest";
import { AnimationMixer, Group, Vector3, type AnimationClip, type Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ModuloFs {
  readFileSync(caminho: URL): Uint8Array;
  existsSync(caminho: URL): boolean;
}
const fs = (await import(/* @vite-ignore */ "node:" + "fs")) as ModuloFs;

/* eslint-disable @typescript-eslint/no-explicit-any */
function carregar(): any {
  const codigo = [configJs, simJs, bossJs, passoJs, posturaJs].join("\n");
  return new Function(codigo + "\nreturn { C, SW, DT, novoJogo, passo, passos, criarGolpe, getS: () => s, posturaDoChefe, direcaoDoChefe };")();
}
function novo(travar: string): any {
  const m = carregar();
  m.novoJogo();
  m.SW.travar = travar; m.SW.imortal = true; m.SW.impeto = false;
  const s = m.getS(); s.j.x = 10; s.j.y = 8; s.b.x = 12; s.b.y = 8; s.b.recCombo = 99;
  return m;
}

/** Joga `n` passos e devolve, para cada passo, o golpe, a fase e a postura do chefe. */
function gravar(m: any, n: number) {
  const linhas: any[] = [];
  let id = 0, ultimo: any = null;
  for (let i = 0; i < n; i++) {
    m.passo();
    const b = m.getS().b, g = b.g;
    if (g && g !== ultimo) { id++; ultimo = g; }
    linhas.push({ id, estado: b.estado, golpe: g?.nome, fase: g?.fase, punido: b.punido, p: m.posturaDoChefe(b, 0) });
  }
  return linhas;
}

let raiz: Object3D, clipes: AnimationClip[];
beforeAll(async () => {
  const bytes = fs.readFileSync(new URL("../src/apresentacao/arte/ferreiro.glb", import.meta.url));
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const gltf = await new GLTFLoader().parseAsync(buffer, "");
  raiz = gltf.scene; clipes = gltf.animations;
});

/** Mesmo caminho do cena.js: gira o chefe para `theta`, espelha se pedido, põe o clipe no ponto e mede a ponta da foice. */
function anguloDaFoice(nome: string, progresso: number, espelhar: boolean, theta: number): number {
  const chefe = new Group(), espelho = new Group();
  chefe.add(espelho); espelho.add(raiz);
  chefe.rotation.y = Math.PI / 2 - theta;
  espelho.scale.x = espelhar ? -1 : 1;
  const mixer = new AnimationMixer(raiz), clipe = clipes.find(c => c.name === nome)!;
  const acao = mixer.clipAction(clipe); acao.play();
  acao.time = Math.min(progresso, 0.999) * clipe.duration; mixer.update(0);
  chefe.updateMatrixWorld(true);
  const p = raiz.getObjectByName("ponta_foice")!.getWorldPosition(new Vector3());
  mixer.stopAllAction(); mixer.uncacheClip(clipe); espelho.remove(raiz);
  return Math.atan2(p.z, p.x);
}
const normal = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

describe("task-15 rodada 3: Ferreiro em 3D", () => {
  it("task-15 AC1: a página usa as regras e os números da rodada 2 (os mesmos arquivos), desenhada com three.js", () => {
    for (const f of ["config", "sim", "boss", "passo"]) expect(indexHtml).toContain(`<script src="../esquiva-pulo/${f}.js"></script>`);
    // nenhuma cópia das regras ou dos números dentro da rodada 3
    for (const f of ["config.js", "sim.js", "boss.js", "passo.js"])
      expect(fs.existsSync(new URL("../prototipos/ferreiro-3d/" + f, import.meta.url))).toBe(false);
    expect(posturaJs).not.toMatch(/\bC\.\w+\s*=[^=]/); // a postura só lê os números
    expect(cenaJs).toContain('from "three"');
    expect(cenaJs).toContain("PerspectiveCamera");
  });

  it("task-15 AC2: o modelo é src/apresentacao/arte/ferreiro.glb e tem todas as animações que a postura pede", () => {
    expect(cenaJs).toContain("../../src/apresentacao/arte/ferreiro.glb");
    const nomes = clipes.map(c => c.name);
    for (const golpe of ["varredura", "martelada", "pulo", "foice_alta"])
      for (const fase of ["_inicio", "_meio", "_fim"]) expect(nomes).toContain(golpe + fase);
    for (const n of ["andar", "sprint", "cansado"]) expect(nomes).toContain(n);
  });

  it("task-15 AC2: cada fase toca a animação certa, do começo ao fim, esticada para durar o tempo da fase", () => {
    const sufixo: Record<string, string> = { preparo: "_inicio", ativo: "_meio", recup: "_fim" };
    for (const travar of ["varredura", "salto", "martelada", "arco", "combo"]) {
      const m = novo(travar), linhas = gravar(m, 60 * 12);
      const fases = new Map<string, any[]>();
      for (const l of linhas) if (l.estado === "golpe" && !(l.fase === "recup" && l.punido)) {
        const k = l.id + ":" + l.fase; if (!fases.has(k)) fases.set(k, []); fases.get(k)!.push(l);
      }
      expect(fases.size).toBeGreaterThan(5);
      let completas = 0;
      for (const ls of fases.values()) {
        const p0 = ls[0].p;
        expect(p0.nome.endsWith(sufixo[ls[0].fase])).toBe(true);
        for (const l of ls) expect(l.p.nome).toBe(p0.nome); // uma animação só durante a fase
        expect(ls[0].p.progresso).toBe(0);
        for (let i = 1; i < ls.length; i++) expect(ls[i].p.progresso).toBeGreaterThan(ls[i - 1].p.progresso);
        // a fase inteira gravada: dura `segundos` e a animação chega até o último passo antes do fim
        if (ls !== [...fases.values()].at(-1)) {
          expect(ls.length).toBe(Math.round(p0.segundos * 60));
          expect(ls.at(-1).p.progresso).toBeCloseTo((ls.length - 1) / ls.length, 6);
          completas++;
        }
      }
      expect(completas).toBeGreaterThan(3);
    }
    // a duração da fase é a dos números: mudar o número muda a duração da animação
    const m = novo("varredura"); m.C.preparoVarredura = 0.9;
    const prep = gravar(m, 200).filter(l => l.fase === "preparo" && l.id === 1);
    expect(prep.length).toBe(54); expect(prep[0].p.segundos).toBeCloseTo(0.9, 6);
  });

  it("task-15 AC3: cada golpe usa as animações do mapeamento da ficha; fora de golpe, andar, sprint e cansado", () => {
    const m = novo("varredura"), b = m.getS().b;
    const nome = (golpe: string, fase: string) => {
      b.estado = "golpe"; b.punido = false; b.g = m.criarGolpe(golpe); b.g.fase = fase; b.g.recupReal = 30;
      return m.posturaDoChefe(b, 0).nome;
    };
    const esperado: Record<string, string> = { varredura: "varredura", martelo: "varredura", arco: "foice_alta", foice: "foice_alta", martelada: "martelada", salto: "pulo" };
    for (const [golpe, anim] of Object.entries(esperado)) {
      expect(nome(golpe, "preparo")).toBe(anim + "_inicio");
      expect(nome(golpe, "ativo")).toBe(anim + "_meio");
      expect(nome(golpe, "recup")).toBe(anim + "_fim");
    }
    // punido (pulou a varredura), atordoado (depois do R) e a janela para kitar: cansado
    nome("varredura", "recup"); b.punido = true; expect(m.posturaDoChefe(b, 0).nome).toBe("cansado");
    b.g = null;
    for (const [estado, anim] of [["atordoado", "cansado"], ["janela", "cansado"], ["sprint", "sprint"], ["perseguir", "andar"]]) {
      b.estado = estado; expect(m.posturaDoChefe(b, 0).nome).toBe(anim);
    }
  });

  it("task-15 AC3: a varredura e a foice alta vêm espelhadas no outro sentido, e a foice do modelo passa para o mesmo lado do golpe", () => {
    const m = novo("varredura"), s = m.getS(), b = s.b;
    for (const golpe of ["varredura", "martelo", "foice"]) for (const sentido of [-1, 1]) for (const theta of [0, Math.PI / 2, 2.5]) {
      s.j.x = b.x + Math.cos(theta) * 2; s.j.y = b.y + Math.sin(theta) * 2;
      b.estado = "golpe"; b.punido = false; b.g = m.criarGolpe(golpe, sentido); b.g.fase = "ativo";
      expect(m.direcaoDoChefe(b, s.j)).toBeCloseTo(theta, 6);
      const p1 = m.posturaDoChefe(b, 0); // progresso 0
      expect(p1.espelhar).toBe(sentido === 1);
      // a lâmina da simulação começa do lado -sentido da mira e gira no sentido `sentido`; a foice do modelo também.
      // O giro é somado em passos pequenos, porque a foice varre mais de meia volta.
      const angulos = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map(p => anguloDaFoice(p1.nome, p, p1.espelhar, theta));
      expect(Math.sign(normal(angulos[0] - theta))).toBe(-sentido);
      const giro = angulos.slice(1).reduce((soma, a, i) => soma + normal(a - angulos[i]), 0);
      expect(Math.sign(giro)).toBe(sentido);
      expect(Math.abs(giro)).toBeGreaterThan(Math.PI / 2);
    }
    // o arco (golpe antigo, em cone) não tem sentido: nunca espelha
    b.g = m.criarGolpe("arco"); b.g.fase = "ativo"; expect(m.posturaDoChefe(b, 0).espelhar).toBe(false);
  });

  it("task-15 AC4: o Ferreiro não troca a cor do corpo nem desenha área no chão, e não existe golem na rodada 3", () => {
    // o desenho 3D não mexe nas cores do modelo: só a cor do jogador muda
    expect(cenaJs).not.toMatch(/emissive/);
    const trocas = [...cenaJs.matchAll(/(\w+(?:\.\w+)*)\.color\.set\(/g)].map(x => x[1]);
    expect(new Set(trocas)).toEqual(new Set(["matJog"]));
    // nada desenhado no chão além da grade (sem círculo, anel ou área de golpe)
    expect(cenaJs).not.toMatch(/CircleGeometry|RingGeometry|areaNoChao|corDoCorpo/);
    expect(posturaJs).not.toMatch(/areaNoChao|corDoCorpo/);
    // sem golem: nem no desenho, nem como opção da página; a luta começa sempre com o Ferreiro
    expect(cenaJs).not.toMatch(/golem/i);
    expect(entradaJs).not.toMatch(/\["golem"/);
    expect(entradaJs).toContain('SW.chefe = "ferreiro"');
  });
});
