// task-14: confere a ficha do Ferreiro (design_draft.md#Ficha do modelo do Ferreiro) contra o .glb gerado
// pelo script do Blender. O CI só tem Node, então o teste lê o arquivo exportado, não o Blender.
import { beforeAll, describe, expect, it } from "vitest";
import {
  AnimationClip,
  AnimationMixer,
  Box3,
  Object3D,
  SkinnedMesh,
  Vector3,
  type Group,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// O projeto não tem @types/node; o módulo é carregado de forma dinâmica e tipado à mão.
interface ModuloFs {
  readFileSync(caminho: URL): Uint8Array;
  existsSync(caminho: URL): boolean;
}
const fs = (await import(/* @vite-ignore */ "node:" + "fs")) as ModuloFs;

const URL_GLB = new URL("../src/apresentacao/arte/ferreiro.glb", import.meta.url);
const URL_SCRIPT = new URL("../prototipos/ferreiro-3d/rascunho_ferreiro.py", import.meta.url);

const NOMES_ANIMACOES = [
  "varredura_inicio", "varredura_meio", "varredura_fim",
  "martelada_inicio", "martelada_meio", "martelada_fim",
  "pulo_inicio", "pulo_meio", "pulo_fim",
  "foice_alta_inicio", "foice_alta_meio", "foice_alta_fim",
  "andar", "sprint", "cansado",
];
const INICIOS = ["varredura_inicio", "martelada_inicio", "pulo_inicio", "foice_alta_inicio"] as const;

const bytes = fs.readFileSync(URL_GLB);
const buffer = new ArrayBuffer(bytes.byteLength);
new Uint8Array(buffer).set(bytes);

let raiz: Group;
let clipes: AnimationClip[];
let jsonGlb: { skins?: { joints: number[] }[]; nodes: { name?: string }[]; meshes?: { name?: string }[] };

beforeAll(async () => {
  // JSON do GLB: 12 bytes de cabeçalho, depois o primeiro bloco (JSON).
  const vista = new DataView(buffer);
  const tamJson = vista.getUint32(12, true);
  jsonGlb = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, tamJson)));
  const gltf = await new GLTFLoader().parseAsync(buffer, "");
  raiz = gltf.scene;
  clipes = gltf.animations;
  raiz.updateMatrixWorld(true);
});

function osso(nome: string): Object3D {
  const o = raiz.getObjectByName(nome);
  if (!o) throw new Error(`osso ${nome} não encontrado`);
  return o;
}

function clipe(nome: string): AnimationClip {
  const c = clipes.find((x) => x.name === nome);
  if (!c) throw new Error(`animação ${nome} não encontrada`);
  return c;
}

/** Mundo do osso (glTF: Y para cima, +Z é a frente do Blender). */
function posMundo(nome: string): Vector3 {
  return osso(nome).getWorldPosition(new Vector3());
}

/** Posa o esqueleto no último quadro do clipe e devolve a posição das pontas das armas. */
function pontasNoFim(nomeClipe: string): { foice: Vector3; martelo: Vector3 } {
  poseDeRepouso();
  const mixer = new AnimationMixer(raiz);
  const c = clipe(nomeClipe);
  const acao = mixer.clipAction(c);
  acao.play();
  mixer.setTime(c.duration - 1e-4); // no tempo exato o laço volta ao quadro 0
  raiz.updateMatrixWorld(true);
  const r = { foice: posMundo("ponta_foice"), martelo: posMundo("ponta_martelo") };
  mixer.stopAllAction();
  mixer.uncacheClip(c);
  return r;
}

/** Volta ao bind pose (sem animação) para medir o corpo. */
function poseDeRepouso(): void {
  raiz.traverse((o) => {
    if (o instanceof SkinnedMesh) o.skeleton.pose();
  });
  raiz.updateMatrixWorld(true);
}

describe("task-14 rascunho do Ferreiro", () => {
  it("task-14 AC1: o script existe, limpa a cena antes de montar, e o glb tem esqueleto, raiz, corpo, foice e martelo", () => {
    expect(fs.existsSync(URL_SCRIPT)).toBe(true);
    const texto = new TextDecoder().decode(fs.readFileSync(URL_SCRIPT));
    expect(texto).toMatch(/def limpar_cena/);
    // limpar_cena() tem que ser chamada antes de montar_modelo().
    const iLimpa = texto.lastIndexOf("limpar_cena()");
    const iMonta = texto.lastIndexOf("montar_modelo()");
    expect(iLimpa).toBeGreaterThan(-1);
    expect(iMonta).toBeGreaterThan(iLimpa);

    expect(jsonGlb.skins?.length ?? 0).toBeGreaterThanOrEqual(1);
    const juntas = jsonGlb.skins!.flatMap((s) => s.joints.map((j) => jsonGlb.nodes[j].name));
    expect(juntas).toContain("raiz");
    const nomes = [
      ...jsonGlb.nodes.map((n) => n.name),
      ...(jsonGlb.meshes ?? []).map((m) => m.name),
    ];
    for (const n of ["corpo", "foice", "martelo"]) expect(nomes).toContain(n);
  });

  it("task-14 AC2: no bind pose o corpo tem 2,0 a 2,4 m, pés no chão, cabe em 0,9 m de raio, centrado e olha para +Z", () => {
    poseDeRepouso();
    const corpo = osso("corpo"); // pode ser um grupo de primitivas
    expect(corpo).toBeTruthy();
    // Caixa calculada nos vértices já deformados pelo esqueleto em repouso.
    const caixa = new Box3().setFromObject(corpo, true);
    const altura = caixa.max.y - caixa.min.y;
    expect(altura).toBeGreaterThanOrEqual(2.0);
    expect(altura).toBeLessThanOrEqual(2.4);
    expect(Math.abs(caixa.min.y)).toBeLessThanOrEqual(0.05);

    // Raio visto de cima: maior distância de um vértice até a origem em X/Z.
    const v = new Vector3();
    let raioMax = 0;
    corpo.traverse((m) => {
      if (!(m instanceof SkinnedMesh)) return;
      const n = m.geometry.getAttribute("position").count;
      for (let i = 0; i < n; i++) {
        m.getVertexPosition(i, v);
        v.applyMatrix4(m.matrixWorld);
        raioMax = Math.max(raioMax, Math.hypot(v.x, v.z));
      }
    });
    expect(raioMax).toBeLessThanOrEqual(0.9);
    const centro = caixa.getCenter(new Vector3());
    expect(Math.abs(centro.x)).toBeLessThanOrEqual(0.15);
    expect(Math.abs(centro.z)).toBeLessThanOrEqual(0.15);

    // Frente: a lâmina da foice se estende 0,7 m para a frente da base do cabo, e a cabeça (ou o corpo)
    // não pode estar mais para trás. Checagem robusta: a foice (mesh) tem mais massa em +Z do que a ponta_foice.
    const foice = osso("foice");
    const caixaFoice = new Box3().setFromObject(foice, true);
    const base = posMundo("ponta_foice");
    expect(caixaFoice.max.z - base.z).toBeGreaterThan(base.z - caixaFoice.min.z);
    // E a foice fica na direita do Ferreiro (Blender -X = glTF -X): D = -X.
    expect(caixaFoice.getCenter(new Vector3()).x).toBeLessThan(0);
    expect(caixa.getCenter(new Vector3()).x).toBeGreaterThan(caixaFoice.getCenter(new Vector3()).x);
  });

  it("task-14 AC3: exatamente as 15 animações, sem mover raiz nem o nó Ferreiro", () => {
    expect(clipes.map((c) => c.name).sort()).toEqual([...NOMES_ANIMACOES].sort());
    for (const c of clipes) {
      for (const t of c.tracks) {
        const [alvo, prop] = [t.name.slice(0, t.name.lastIndexOf(".")), t.name.slice(t.name.lastIndexOf(".") + 1)];
        if (alvo === "raiz" || alvo === "Ferreiro") {
          expect(prop, `${c.name}: ${t.name}`).not.toBe("position");
        }
      }
    }
    // Mesmo sem trilha de posição, a raiz não pode sair da origem (nem para cima, no pulo).
    for (const c of clipes) {
      const mixer = new AnimationMixer(raiz);
      mixer.clipAction(c).play();
      const passos = 12;
      for (let i = 0; i <= passos; i++) {
        mixer.setTime((c.duration * i) / passos);
        raiz.updateMatrixWorld(true);
        const p = posMundo("raiz");
        expect(Math.hypot(p.x, p.z), `${c.name} raiz x/z em ${i}`).toBeLessThanOrEqual(0.01);
        expect(Math.abs(p.y), `${c.name} raiz y em ${i}`).toBeLessThanOrEqual(0.01);
      }
      mixer.stopAllAction();
      mixer.uncacheClip(c);
    }
  });

  it("task-14 AC1: nenhum vértice das malhas fica sem osso (nada estica nas poses)", () => {
    let malhas = 0;
    raiz.traverse((m) => {
      if (!(m instanceof SkinnedMesh)) return;
      malhas++;
      const w = m.geometry.getAttribute("skinWeight");
      const j = m.geometry.getAttribute("skinIndex");
      const n = w.count;
      for (let i = 0; i < n; i++) {
        // Vértice sem grupo no Blender vira "neutral_bone" no glb e fica parado no ar enquanto o corpo se mexe.
        for (let k = 0; k < 4; k++) {
          if (w.getComponent(i, k) > 0) {
            const nome = m.skeleton.bones[j.getComponent(i, k)].name;
            expect(["raiz", "neutral_bone"], `${m.name} vértice ${i} preso a ${nome}`).not.toContain(nome);
          }
        }
        const soma = w.getX(i) + w.getY(i) + w.getZ(i) + w.getW(i);
        expect(soma, `${m.name} vértice ${i}`).toBeGreaterThan(0.99);
        expect(soma, `${m.name} vértice ${i}`).toBeLessThan(1.01);
      }
    });
    expect(malhas).toBeGreaterThanOrEqual(3); // corpo, foice e martelo
  });

  it("task-14 AC3: nas animações os pés ficam no chão (o ponto mais baixo do corpo fica entre -0,07 e 0,12 m)", () => {
    const corpo = osso("corpo");
    const v = new Vector3();
    for (const c of clipes) {
      const mixer = new AnimationMixer(raiz);
      mixer.clipAction(c).play();
      const passos = 12;
      for (let i = 0; i <= passos; i++) {
        mixer.setTime((c.duration * i) / passos);
        raiz.updateMatrixWorld(true);
        let minY = Infinity;
        corpo.traverse((m) => {
          if (!(m instanceof SkinnedMesh)) return;
          const n = m.geometry.getAttribute("position").count;
          for (let k = 0; k < n; k++) {
            m.getVertexPosition(k, v);
            v.applyMatrix4(m.matrixWorld);
            minY = Math.min(minY, v.y);
          }
        });
        expect(minY, `${c.name} em ${i}/${passos}`).toBeGreaterThanOrEqual(-0.07); // na passada a ponta do pé do bloco cava até ~6 cm (sem tornozelo)
        expect(minY, `${c.name} em ${i}/${passos}`).toBeLessThanOrEqual(0.12);
      }
      mixer.stopAllAction();
      mixer.uncacheClip(c);
    }
  });

  it("task-14 AC4: ferreiro.glb é um GLB válido (glTF, versão 2, tamanho certo) e carrega as 15 animações", () => {
    const vista = new DataView(buffer);
    expect(new TextDecoder().decode(new Uint8Array(buffer, 0, 4))).toBe("glTF");
    expect(vista.getUint32(4, true)).toBe(2);
    expect(vista.getUint32(8, true)).toBe(bytes.byteLength);
    expect(clipes).toHaveLength(15);
    for (const n of NOMES_ANIMACOES) expect(clipes.map((c) => c.name)).toContain(n);
  });

  // AC5 no fim é julgado pelo autor, olhando a vista de cima. Estes testes só pegam o óbvio:
  // as quatro poses _inicio têm que ser diferentes vistas de cima, e cada leitura básica tem que valer.
  it("task-14 AC5: as quatro poses _inicio se distinguem vistas de cima (pontas das armas a 0,5 m ou mais)", () => {
    const pontas = INICIOS.map((n) => pontasNoFim(n));
    const topo = (v: Vector3) => [v.x, v.z] as const;
    const dist = (a: Vector3, b: Vector3) => Math.hypot(topo(a)[0] - topo(b)[0], topo(a)[1] - topo(b)[1]);
    for (let i = 0; i < pontas.length; i++) {
      for (let j = i + 1; j < pontas.length; j++) {
        const maior = Math.max(dist(pontas[i].foice, pontas[j].foice), dist(pontas[i].martelo, pontas[j].martelo));
        expect(maior, `${INICIOS[i]} x ${INICIOS[j]}`).toBeGreaterThanOrEqual(0.5);
      }
    }
  });

  it("task-14 AC5: leituras de cada _inicio vistas de cima (varredura baixa à direita, martelada alta, pulo aberto, foice alta atrás)", () => {
    const vareduraP = pontasNoFim("varredura_inicio");
    // Direita do Ferreiro = glTF -X. Foice baixa (perto do chão) e para o lado direito.
    expect(vareduraP.foice.x).toBeLessThan(-0.8);
    expect(vareduraP.foice.y).toBeLessThan(0.6);

    const martelada = pontasNoFim("martelada_inicio");
    const cabeca = posMundo("cabeca");
    expect(martelada.martelo.y).toBeGreaterThan(cabeca.y);

    const pulo = pontasNoFim("pulo_inicio");
    // Foice na direita (-X), martelo na esquerda (+X), bem abertos.
    expect(pulo.foice.x).toBeLessThan(-1.0);
    expect(pulo.martelo.x).toBeGreaterThan(1.0);

    const alta = pontasNoFim("foice_alta_inicio");
    // Puxada para trás: -Z no glTF (frente do Blender é +Z).
    expect(alta.foice.z).toBeLessThan(-0.5);
  });
});
