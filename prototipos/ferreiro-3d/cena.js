// Desenho em 3D (three.js) da luta da rodada 2. Só lê o estado `s` da simulação e as funções de postura.js.
// Metros da simulação: x vai para a direita e y para baixo da tela. No 3D: x = x, z = y, e a altura é o eixo y.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const tela3d = document.getElementById("tela3d");
const renderizador = new THREE.WebGLRenderer({ canvas: tela3d, antialias: true });
renderizador.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderizador.setSize(960, 640, false);
renderizador.shadowMap.enabled = true;
renderizador.shadowMap.type = THREE.PCFSoftShadowMap;

const cena = new THREE.Scene();
cena.background = new THREE.Color("#11141b");
const camera = new THREE.PerspectiveCamera(30, 960 / 640, 1, 300);

// ===== Câmera alta, em perspectiva, parada mostrando a arena inteira (como a luta do jogo) =====
const GRAU = Math.PI / 180;
export function posicionarCamera(inclinacaoGraus) {
  const incl = inclinacaoGraus * GRAU, foco = new THREE.Vector3(LARG / 2, 0, ALT / 2 + 0.7);
  const cantos = [[0, 0, 0], [LARG, 0, 0], [0, 0, ALT], [LARG, 0, ALT], [0, 2.8, 0], [LARG, 2.8, 0]].map(p => new THREE.Vector3(...p));
  let dist = 90;
  for (let d = 15; d < 90; d += 0.25) {
    camera.position.set(foco.x, Math.sin(incl) * d, foco.z + Math.cos(incl) * d);
    camera.lookAt(foco); camera.updateMatrixWorld();
    if (cantos.every(c => { const v = c.clone().project(camera); return Math.abs(v.x) <= 0.97 && Math.abs(v.y) <= 0.97; })) { dist = d; break; }
  }
  camera.position.set(foco.x, Math.sin(incl) * dist, foco.z + Math.cos(incl) * dist);
  camera.lookAt(foco); camera.updateMatrixWorld();
}

// ===== Luz e chão =====
cena.add(new THREE.HemisphereLight("#c9d4ff", "#2a2118", 1.1));
const sol = new THREE.DirectionalLight("#fff3e0", 2.2);
sol.position.set(LARG / 2 - 4, 20, ALT / 2 - 6); sol.target.position.set(LARG / 2, 0, ALT / 2);
sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 50 });
cena.add(sol, sol.target);

const chao = new THREE.Mesh(new THREE.PlaneGeometry(LARG, ALT), new THREE.MeshStandardMaterial({ color: "#232836", roughness: 1 }));
chao.rotation.x = -Math.PI / 2; chao.position.set(LARG / 2, 0, ALT / 2); chao.receiveShadow = true;
cena.add(chao);
{ // grade de 1 m e borda da arena (só referência de distância; não é aviso)
  const p = [];
  for (let x = 0; x <= LARG; x++) p.push(x, 0.01, 0, x, 0.01, ALT);
  for (let y = 0; y <= ALT; y++) p.push(0, 0.01, y, LARG, 0.01, y);
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  cena.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: "#2e3446" })));
}

// ===== Jogador e tiros (formas simples, como na rodada 2) =====
const jogador = new THREE.Group();
const matJog = new THREE.MeshStandardMaterial({ color: "#4da3ff", transparent: true });
const corpoJog = new THREE.Mesh(new THREE.CylinderGeometry(RAIO_J, RAIO_J, 1.3, 20), matJog);
corpoJog.position.y = 0.65; corpoJog.castShadow = true;
const narizJog = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.5), new THREE.MeshStandardMaterial({ color: "#cfe6ff" }));
narizJog.position.set(0, 1.0, RAIO_J); // aponta para +z do grupo
const anelAparo = new THREE.Mesh(new THREE.TorusGeometry(RAIO_J + 0.3, 0.05, 8, 32), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
anelAparo.rotation.x = Math.PI / 2; anelAparo.position.y = 0.7;
jogador.add(corpoJog, narizJog, anelAparo);
cena.add(jogador);

const geoTiro = new THREE.SphereGeometry(1, 12, 8);
const matTiro = { aa: new THREE.MeshBasicMaterial({ color: "#ffe27a" }), q: new THREE.MeshBasicMaterial({ color: "#ffe27a" }), w: new THREE.MeshBasicMaterial({ color: "#c77dff" }) };
const tiros = [];

// ===== O chefe =====
// `chefe` anda e gira pela arena; `espelho` vira o modelo do avesso no eixo x quando o golpe vem do outro lado.
const chefe = new THREE.Group(), espelho = new THREE.Group();
chefe.add(espelho); cena.add(chefe);
let ferreiro = null, mixer = null, acoes = {}, acaoAtual = null, nomeAtual = "";
let erroModelo = null;

// golem de comparação: cilindro que troca de cor, com o círculo no chão (rodada 2)
const matGolem = new THREE.MeshStandardMaterial({ color: "#8a8f9c" });
const golem = new THREE.Mesh(new THREE.CylinderGeometry(RAIO_B, RAIO_B, 1.8, 24), matGolem);
golem.position.y = 0.9; golem.castShadow = true;
chefe.add(golem);
const area = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
area.rotation.x = -Math.PI / 2; area.position.y = 0.02; cena.add(area);

export const carregado = new GLTFLoader().loadAsync(new URL("../../src/apresentacao/arte/ferreiro.glb", import.meta.url).href).then(gltf => {
  ferreiro = gltf.scene;
  ferreiro.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  espelho.add(ferreiro);
  mixer = new THREE.AnimationMixer(ferreiro);
  for (const clipe of gltf.animations) acoes[clipe.name] = mixer.clipAction(clipe);
  const faltando = ["varredura", "martelada", "pulo", "foice_alta"].flatMap(n => ["_inicio", "_meio", "_fim"].map(f => n + f))
    .concat(["andar", "sprint", "cansado"]).filter(n => !acoes[n]);
  if (faltando.length) erroModelo = "ferreiro.glb sem as animações: " + faltando.join(", ");
}).catch(e => { erroModelo = "Não consegui abrir src/apresentacao/arte/ferreiro.glb (" + (e && e.message || e) + "). Rode pelo npm run jogar."; });
export const problemaDoModelo = () => erroModelo;

/** Põe o Ferreiro na pose certa. Nos golpes, a animação é posta no ponto da fase: dura exatamente o tempo da fase. */
function posar(fracao) {
  if (!mixer) return;
  const p = posturaDoChefe(s.b, fracao), acao = acoes[p.nome];
  if (!acao) return;
  if (p.nome !== nomeAtual) {
    if (acaoAtual) acaoAtual.stop();
    acao.reset(); acao.setLoop(THREE.LoopRepeat, Infinity); acao.play();
    acaoAtual = acao; nomeAtual = p.nome;
  }
  const dur = acao.getClip().duration;
  // repetidas (andar, sprint, cansado) seguem o relógio da simulação; o andar acelera com o ímpeto
  const ritmo = p.nome === "andar" ? (C.velChefe + s.b.impeto) / 4.5 : 1;
  acao.time = p.repete ? (s.passo * DT * ritmo) % dur : Math.min(p.progresso, 0.999) * dur;
  espelho.scale.x = p.espelhar ? -1 : 1;
  mixer.update(0);
}

// ===== Mouse: do ponto da tela ao ponto no chão =====
const raio = new THREE.Raycaster(), planoChao = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ponto = new THREE.Vector3();
/** (nx, ny) de 0 a 1 dentro da arena desenhada -> metros no chão. */
export function noChao(nx, ny) {
  raio.setFromCamera(new THREE.Vector2(nx * 2 - 1, 1 - ny * 2), camera);
  if (!raio.ray.intersectPlane(planoChao, ponto)) return { x: LARG / 2, y: ALT / 2 };
  return { x: ponto.x, y: ponto.z };
}
/** Metros (x, altura, y) -> pixels na tela de 960 x 640 (para o HUD). */
export function naTela(x, h, y) {
  const v = new THREE.Vector3(x, h, y).project(camera);
  return { x: (v.x + 1) / 2 * 960, y: (1 - v.y) / 2 * 640 };
}

const rumo = ang => Math.PI / 2 - ang; // ângulo no chão -> giro do modelo (o modelo olha para +z)
export function desenhar3d(fracao) {
  const j = s.j, b = s.b, a = j.acao;
  // jogador
  const pulando = a && a.tipo === "f" && a.fase === "ativo", rolando = a && a.tipo === "d" && a.fase === "ativo";
  const prot = a && a.fase === "ativo" && (a.tipo === "d" ? a.t < passos(C.invencivelD) : a.tipo === "f");
  jogador.position.set(j.x, pulando ? 0.5 : 0, j.y);
  jogador.rotation.y = rumo(Math.atan2(j.diry, j.dirx));
  matJog.color.set(j.flash > 0 ? "#ffffff" : prot ? "#9fd2ff" : "#4da3ff");
  matJog.opacity = rolando ? 0.55 : 1;
  anelAparo.visible = j.aparoFlash > 0 || !!(a && a.tipo === "r" && a.fase === "ativo");
  // tiros
  while (tiros.length < s.tiros.length) { const m = new THREE.Mesh(geoTiro, matTiro.aa); cena.add(m); tiros.push(m); }
  tiros.forEach((m, i) => {
    const t = s.tiros[i]; m.visible = !!t; if (!t) return;
    const r = t.tipo === "aa" ? 0.15 : t.raio;
    m.material = matTiro[t.tipo]; m.scale.setScalar(r); m.position.set(t.x, 1, t.y);
  });
  // chefe
  const ehGolem = SW.chefe === "golem";
  chefe.position.set(b.x, b.voo * 2.2, b.y);
  chefe.rotation.y = rumo(direcaoDoChefe(b, j));
  golem.visible = ehGolem || !ferreiro;
  espelho.visible = !ehGolem && !!ferreiro;
  matGolem.color.set(corDoCorpo(b) || "#a8573a");
  if (!ehGolem) posar(fracao);
  const ar = areaNoChao(b);
  area.visible = !!ar;
  if (ar) { area.position.set(ar.x, 0.02, ar.y); area.scale.setScalar(ar.raio); area.material.color.set(ar.cor); area.material.opacity = ar.opacidade; }
  renderizador.render(cena, camera);
}
