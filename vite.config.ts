import { defineConfig } from "vitest/config";

export default defineConfig({
  // O protótipo é aberto a partir da raiz do repositório; os arquivos em prototipos/ não fazem parte do jogo.
  test: {
    include: ["testes/**/*.test.ts"],
    environment: "node",
  },
});
