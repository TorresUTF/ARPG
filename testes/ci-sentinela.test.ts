import { describe, expect, it } from "vitest";

// Teste temporário do PR de teste da proteção de branch (Fase 5). Não deve ir para a main.
describe("ci-sentinela", () => {
  it("falha de propósito para provar que a CI bloqueia o merge", () => {
    expect(1 + 1).toBe(3);
  });
});
