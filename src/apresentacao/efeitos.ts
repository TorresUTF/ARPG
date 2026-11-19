// Respostas visuais aos eventos da simulação. Só enfeitam: nunca mudam as regras.
// Os tempos daqui são do desenho (segundos de tela), não números de jogo.
import type { EstiloAvanco, Evento, MotivoAvanco, NomeGolpe } from "../simulacao/eventos";
import type { Vetor } from "../simulacao/vetor";

interface NumeroFlutuante {
  texto: string;
  pos: Vetor;
  idade: number;
  cor: string;
}

export interface GolpeVisto {
  golpe: NomeGolpe;
  pos: Vetor;
  direcao: Vetor;
  /** Segundos restantes do clarão. */
  t: number;
}

/** Nome e explicação de cada estilo do avanço do golem, como aparecem na tela. */
export const TEXTO_ESTILO: Record<EstiloAvanco, { nome: string; porque: string }> = {
  pressao: { nome: "Pressão", porque: "você foge muito: avança assim que pode" },
  paciente: { nome: "Paciente", porque: "você escapa com o E: segura o avanço até seu E entrar em recarga" },
  garantir: { nome: "Garantir o golpe", porque: "você troca golpes de perto: espera você ficar preso num ataque" },
};

/** Por que o golem avançou agora. */
export const TEXTO_MOTIVO: Record<MotivoAvanco, string> = {
  pressao: "Avanço: pronto, mantém a pressão",
  eEmRecarga: "Avanço: seu E está em recarga",
  preso: "Avanço: você ficou preso no ataque",
  cansou: "Avanço: cansou de esperar",
};

export const DURACAO = {
  numero: 0.7,
  clarao: 0.12,
  golpe: 0.3,
  explosao: 0.35,
  area: 0.3,
  dor: 0.3,
  aparo: 0.4,
  aviso: 3,
  chefe: 2.5,
  troca: 0.35,
};

export class Efeitos {
  numeros: NumeroFlutuante[] = [];
  /** Clarão branco de cada inimigo atingido (segundos restantes). */
  clarao = new Map<number, number>();
  /** Golpe do chefe que acabou de acontecer: a área pisca no chão e o golem se amassa. */
  golpes = new Map<number, GolpeVisto>();
  /** Explosão da marca (segundos restantes), por inimigo. */
  explosoes = new Map<number, { pos: Vetor; t: number }>();
  /** Áreas da horda que acabaram de explodir. */
  areas: { pos: Vetor; t: number }[] = [];
  dor = 0;
  aparo = 0;
  /** O jogador disparou neste quadro (coice da besta). */
  disparou = false;
  /** Texto curto no topo da tela do mapa. */
  aviso = "";
  avisoT = 0;
  /** Texto curto sobre o chefe na luta (motivo do avanço, troca de estilo). */
  chefe = "";
  chefeT = 0;
  /** Escurece e clareia na troca entre mapa e luta. */
  troca = 0;

  constructor(private readonly nomeDoLugar: (id: string) => string) {}

  limpar(): void {
    this.numeros = [];
    this.clarao.clear();
    this.golpes.clear();
    this.explosoes.clear();
    this.areas = [];
    this.dor = this.aparo = 0;
    this.chefeT = 0;
  }

  receber(eventos: Evento[]): void {
    for (const e of eventos) {
      switch (e.tipo) {
        case "acertou":
          this.clarao.set(e.alvo, DURACAO.clarao);
          this.numeros.push({ texto: String(e.dano), pos: { ...e.pos }, idade: 0, cor: "#ffd166" });
          break;
        case "golpe":
          this.golpes.set(e.inimigo, { golpe: e.golpe, pos: e.pos, direcao: e.direcao, t: DURACAO.golpe });
          break;
        case "marcaExplodiu":
          this.explosoes.set(e.alvo, { pos: e.pos, t: DURACAO.explosao });
          break;
        case "areaExplodiu":
          this.areas.push({ pos: e.pos, t: DURACAO.area });
          break;
        case "jogadorAtingido":
          this.dor = DURACAO.dor;
          break;
        case "aparou":
          this.aparo = DURACAO.aparo;
          this.numeros.push({ texto: "aparou!", pos: { x: e.pos.x, y: e.pos.y - 1 }, idade: -0.1, cor: "#9be7ff" });
          break;
        case "avancoGolem":
          this.chefe = TEXTO_MOTIVO[e.motivo];
          this.chefeT = DURACAO.chefe;
          break;
        case "estiloGolem":
          this.chefe = `O chefe mudou para ${TEXTO_ESTILO[e.estilo].nome}`;
          this.chefeT = DURACAO.chefe;
          break;
        case "disparou":
          this.disparou = true;
          break;
        case "entrouNaLuta":
          this.limpar();
          this.troca = DURACAO.troca;
          break;
        case "voltouAoMapa":
          this.troca = DURACAO.troca;
          if (e.resultado === "venceu") this.avisar(`${this.nomeDoLugar(e.lugar)}: vencido`);
          break;
        case "bauAberto":
          this.avisar("Baú aberto");
          break;
        case "descansou":
          this.avisar(e.aoMorrer ? "Você voltou à última fogueira" : "Descansou: vida e poções cheias, emboscadas de volta");
          break;
        case "pocaoNoMapa":
          this.avisar("Poção usada");
          break;
      }
    }
  }

  private avisar(texto: string): void {
    this.aviso = texto;
    this.avisoT = DURACAO.aviso;
  }

  /** Avança os efeitos pelo tempo real da tela, que pode ser diferente do passo da simulação. */
  atualizar(segundos: number): void {
    for (const n of this.numeros) n.idade += segundos;
    this.numeros = this.numeros.filter((n) => n.idade < DURACAO.numero);
    for (const [id, t] of this.clarao) {
      if (t - segundos <= 0) this.clarao.delete(id);
      else this.clarao.set(id, t - segundos);
    }
    for (const [id, g] of this.golpes) if ((g.t -= segundos) <= 0) this.golpes.delete(id);
    for (const [id, x] of this.explosoes) if ((x.t -= segundos) <= 0) this.explosoes.delete(id);
    for (const a of this.areas) a.t -= segundos;
    this.areas = this.areas.filter((a) => a.t > 0);
    this.dor = Math.max(0, this.dor - segundos);
    this.aparo = Math.max(0, this.aparo - segundos);
    this.avisoT = Math.max(0, this.avisoT - segundos);
    this.chefeT = Math.max(0, this.chefeT - segundos);
    this.troca = Math.max(0, this.troca - segundos);
  }

  /** Lê e apaga o sinal de disparo (vale para um quadro só). */
  pegarDisparo(): boolean {
    const d = this.disparou;
    this.disparou = false;
    return d;
  }

  progresso(n: NumeroFlutuante): number {
    return Math.max(0, n.idade) / DURACAO.numero;
  }
}
