// O que o golem percebe do jogador e como decide usar o avanço (dash).
// Design: design/inimigos.md#Chefe que reage ao jogador. Veio do protótipo prototipos/chefe-dash/.
import type { TipoAcao } from "./acao";
import { sortear } from "./aleatorio";
import type { EstiloAvanco, MotivoAvanco, NomeGolpe } from "./eventos";
import type { CerebroGolem, Inimigo, Mundo } from "./luta";
import { DT, emPassos } from "./tempo";
import { distancia, type Vetor } from "./vetor";

const ESTILOS: EstiloAvanco[] = ["pressao", "paciente", "garantir"];

export function novoCerebro(mundo: Mundo, posJogador: Vetor): CerebroGolem {
  return {
    estilo: "pressao",
    passosNoEstilo: 0,
    perfil: { fuga: 0, esquivaE: 0, agressao: 0 },
    recargaAvanco: emPassos(mundo.dados.avancoGolem.recargaInicial),
    segurando: 0,
    jogadorAntes: { ...posJogador },
    velocidadeJogador: { x: 0, y: 0 },
    motivo: null,
    pesos: { circulo: mundo.dados.pesosGolem.inicial, saturno: mundo.dados.pesosGolem.inicial, linha: mundo.dados.pesosGolem.inicial },
    preferido: null,
  };
}

const GOLPES: NomeGolpe[] = ["circulo", "saturno", "linha"];

/** O golpe acertou (sobe o peso) ou o jogador escapou ou aparou (desce). Avisa quando o golpe preferido muda. */
export function anotarGolpe(mundo: Mundo, b: Inimigo, c: CerebroGolem, golpe: NomeGolpe, acertou: boolean): void {
  const p = mundo.dados.pesosGolem;
  const novo = c.pesos[golpe] + (acertou ? p.ganhoAoAcertar : -p.perdaAoEscapar);
  c.pesos[golpe] = Math.min(p.maximo, Math.max(p.minimo, novo));
  const maior = Math.max(...GOLPES.map((g) => c.pesos[g]));
  const topo = GOLPES.filter((g) => c.pesos[g] === maior);
  const preferido = topo.length === 1 ? topo[0] : null;
  if (preferido !== c.preferido) {
    c.preferido = preferido;
    if (preferido) mundo.eventos.push({ tipo: "golpePreferido", inimigo: b.id, golpe: preferido });
  }
}

/** Sorteia um dos golpes que servem agora, com chance proporcional ao peso (semente da luta). */
export function sortearGolpe(mundo: Mundo, c: CerebroGolem, servem: NomeGolpe[]): NomeGolpe {
  if (servem.length === 1) return servem[0];
  const total = servem.reduce((s, g) => s + c.pesos[g], 0);
  let r = sortear(mundo.aleatorio) * total;
  for (const g of servem) {
    r -= c.pesos[g];
    if (r < 0) return g;
  }
  return servem[servem.length - 1];
}

/** O golem está ameaçando: avisando um golpe, avançando, ou com o jogador quase no alcance do círculo. */
function ameacando(mundo: Mundo, b: Inimigo): boolean {
  const a = b.acao;
  if (a && (a.fase === "preparo" || (a.tipo === "avancoGolem" && a.fase === "ativo"))) return true;
  const { golpeCirculo, estilosGolem } = mundo.dados;
  return distancia(mundo.jogador.pos, b.pos) < golpeCirculo.raio + estilosGolem.distanciaAmeaca;
}

/** O jogador começou uma ação: o golem anota esquivas com E e ataques de perto. */
export function anotarAcaoDoJogador(mundo: Mundo, tipo: TipoAcao): void {
  const { golpeCirculo, estilosGolem } = mundo.dados;
  for (const b of mundo.inimigos) {
    const c = b.cerebro;
    if (!c || b.vida <= 0) continue;
    if (tipo === "e") {
      if (ameacando(mundo, b)) c.perfil.esquivaE += 1;
    } else if (tipo === "ataqueBasico" || tipo === "q" || tipo === "w") {
      if (distancia(mundo.jogador.pos, b.pos) < golpeCirculo.raio + estilosGolem.distanciaAgressao) c.perfil.agressao += 1;
    }
  }
}

/** Notas de 0 a 1 de cada estilo, a partir do que o golem percebeu. */
export function notasDosEstilos(mundo: Mundo, c: CerebroGolem): Record<EstiloAvanco, number> {
  const e = mundo.dados.estilosGolem;
  return {
    pressao: c.perfil.fuga,
    paciente: Math.min(1, c.perfil.esquivaE / e.esquivasNotaCheia),
    garantir: Math.min(1, c.perfil.agressao / e.agressoesNotaCheia),
  };
}

/** A cada passo: mede a velocidade do jogador, anota a fuga e esquece aos poucos. */
export function atualizarPerfil(mundo: Mundo, b: Inimigo, c: CerebroGolem): void {
  const j = mundo.jogador;
  const e = mundo.dados.estilosGolem;
  const v = { x: (j.pos.x - c.jogadorAntes.x) / DT, y: (j.pos.y - c.jogadorAntes.y) / DT };
  c.velocidadeJogador = v;
  c.jogadorAntes = { ...j.pos };
  const d = distancia(j.pos, b.pos) || 0.001;
  // Fuga: parte do tempo em que o jogador anda (sem estar numa ação) para longe do golem.
  const afastando = ((j.pos.x - b.pos.x) * v.x + (j.pos.y - b.pos.y) * v.y) / d;
  const amostra = !j.acao && afastando > mundo.dados.personagem.velocidade * e.fugaVelocidade ? 1 : 0;
  const m = e.memoria;
  c.perfil.fuga += ((amostra - c.perfil.fuga) * DT) / (e.esquecerFuga * m);
  c.perfil.esquivaE *= Math.exp(-DT / (e.esquecerEsquivaE * m));
  c.perfil.agressao *= Math.exp(-DT / (e.esquecerAgressao * m));
}

/** Troca de estilo só se o novo for claramente melhor e o atual já durou o tempo mínimo. */
export function escolherEstilo(mundo: Mundo, b: Inimigo, c: CerebroGolem): void {
  const e = mundo.dados.estilosGolem;
  c.passosNoEstilo += 1;
  const n = notasDosEstilos(mundo, c);
  let melhor = c.estilo;
  for (const k of ESTILOS) if (n[k] > n[melhor]) melhor = k;
  if (melhor !== c.estilo && n[melhor] > n[c.estilo] + e.margemTroca && n[melhor] > e.notaMinima && c.passosNoEstilo >= emPassos(e.tempoMinimo)) {
    c.estilo = melhor;
    c.passosNoEstilo = 0;
    mundo.eventos.push({ tipo: "estiloGolem", inimigo: b.id, estilo: melhor });
  }
}

/** Decide se usa o avanço agora (já pronto). Devolve o motivo, ou null para segurar. */
export function decidirAvanco(mundo: Mundo, b: Inimigo, c: CerebroGolem): MotivoAvanco | null {
  const { avancoGolem: A, golpeCirculo } = mundo.dados;
  const j = mundo.jogador;
  const d = distancia(j.pos, b.pos);
  // O jogador já está no alcance do círculo: não precisa do avanço.
  if (d <= golpeCirculo.raio * A.naoUsarAte + A.folgaNaoUsar) return null;
  const alcance = A.distancia + golpeCirculo.raio * A.alcanceCirculo;
  // Tempo entre decidir o avanço e o círculo emendado acertar.
  const tempoAteGolpe = A.preparo + Math.min(A.distancia, d) / A.velocidade + A.recuperacao + A.preparoCirculoEmendado;
  const eFora = j.recargas.e * DT > tempoAteGolpe * A.fatorEFora;
  // Preso: começou um ataque ou a poção e ainda não saiu do preparo.
  const preso = j.acao !== null && j.acao.tipo !== "e" && j.acao.tipo !== "r" && j.acao.fase !== "recuperacao";
  const cansou = c.segurando * DT >= A.seguraMax && d > A.pressaoAPartirDe;
  switch (c.estilo) {
    case "pressao":
      return d > A.pressaoAPartirDe ? "pressao" : null;
    case "paciente":
      if (eFora && d <= alcance) return "eEmRecarga";
      return cansou ? "cansou" : null;
    case "garantir":
      if (preso && d <= alcance) return "preso";
      return cansou ? "cansou" : null;
  }
}
