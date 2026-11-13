// Painel de ajuste: altera os números de dados/ com o jogo rodando.
// As mudanças valem só nesta aba do navegador. Para guardar um valor, copie-o para o arquivo em dados/.
import { dadosIniciais, type Dados } from "../simulacao/dados";
import { ROTULOS, type Rotulo } from "./rotulos";

export function montarPainel(raiz: HTMLElement, dados: Dados, aoMudarAlgoDeRecomeco: () => void): void {
  raiz.replaceChildren();
  const iniciais = dadosIniciais();
  const atualizadores: (() => void)[] = [];

  for (const grupo of Object.keys(ROTULOS) as (keyof Dados)[]) {
    const { titulo, campos } = ROTULOS[grupo];
    const h = document.createElement("h2");
    h.textContent = titulo;
    raiz.append(h);
    for (const [campo, rotulo] of Object.entries(campos) as [string, Rotulo][]) {
      const valores = dados[grupo] as unknown as Record<string, number>;
      const padrao = (iniciais[grupo] as unknown as Record<string, number>)[campo];
      const linha = document.createElement("div");
      linha.className = "ajuste";
      const id = `ajuste-${grupo}-${campo}`;
      const label = document.createElement("label");
      label.htmlFor = id;
      const nome = document.createElement("span");
      nome.textContent = rotulo.nome + (rotulo.aoRecomecar ? " ↻" : "");
      const valor = document.createElement("span");
      label.append(nome, valor);
      const entrada = document.createElement("input");
      entrada.type = "range";
      entrada.id = id;
      entrada.min = String(rotulo.min);
      entrada.max = String(rotulo.max);
      entrada.step = String(rotulo.passo);
      const mostrar = () => {
        entrada.value = String(valores[campo]);
        valor.textContent = String(valores[campo]) + (valores[campo] !== padrao ? `  (era ${padrao})` : "");
      };
      entrada.addEventListener("input", () => {
        valores[campo] = Number(entrada.value);
        mostrar();
        if (rotulo.aoRecomecar) aoMudarAlgoDeRecomeco();
      });
      mostrar();
      atualizadores.push(mostrar);
      linha.append(label, entrada);
      raiz.append(linha);
    }
  }

  const voltar = document.createElement("button");
  voltar.type = "button";
  voltar.textContent = "Voltar aos valores iniciais";
  voltar.addEventListener("click", () => {
    for (const grupo of Object.keys(iniciais) as (keyof Dados)[]) Object.assign(dados[grupo], iniciais[grupo]);
    atualizadores.forEach((f) => f());
    aoMudarAlgoDeRecomeco();
  });
  raiz.append(voltar);
}
