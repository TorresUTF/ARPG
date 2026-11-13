import { describe, expect, it } from "vitest";
import { ROTULOS } from "../src/painel/rotulos";
import { dadosIniciais } from "../src/simulacao/dados";

describe("painel de ajuste", () => {
  it("tem um controle para cada número de dados/", () => {
    const dados = dadosIniciais() as unknown as Record<string, Record<string, unknown>>;
    const rotulos = ROTULOS as unknown as Record<string, { campos: Record<string, unknown> }>;
    for (const [grupo, valores] of Object.entries(dados)) {
      for (const [campo, valor] of Object.entries(valores)) {
        expect(typeof valor, `${grupo}.${campo} deveria ser número`).toBe("number");
        expect(rotulos[grupo]?.campos[campo], `${grupo}.${campo} não aparece no painel`).toBeDefined();
      }
    }
  });

  it("o valor inicial de cada número cabe na faixa do controle", () => {
    const dados = dadosIniciais() as unknown as Record<string, Record<string, number>>;
    for (const [grupo, { campos }] of Object.entries(ROTULOS)) {
      for (const [campo, r] of Object.entries(campos as Record<string, { min: number; max: number }>)) {
        const v = dados[grupo][campo];
        expect(v, `${grupo}.${campo}`).toBeGreaterThanOrEqual(r.min);
        expect(v, `${grupo}.${campo}`).toBeLessThanOrEqual(r.max);
      }
    }
  });
});
