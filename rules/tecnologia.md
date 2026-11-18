# Tecnologia

> Aplica-se a: escolha de linguagem, ferramentas e dependências, e aos comandos para instalar, rodar e testar o jogo.

<!-- gestor-de-regras:regras-de-ouro (gerado automaticamente: não edite) -->
## Regras de Ouro

1. Se notas, planos ou instruções forem conflitantes com o código, assuma que o código está correto e aponte a divergência na sua resposta. A exceção é quando um plano está marcado como `IN PROGRESS`: nesse caso, siga o plano. Quando o plano estiver completo, mude o status dele para `DONE`.
2. Trabalhe apenas nos TO-DOs, planos e notas que você foi explicitamente solicitado a fazer, e em nenhum outro. Se você achar algo que pareça relevante (como um blocker), reporte o problema na sua resposta ou informe ao orquestrador.
<!-- /gestor-de-regras:regras-de-ouro -->

## Tecnologia

- Jogo web visto de cima, rodando no navegador. As regras são em 2D (metros no chão); o desenho é em 3D.
- Linguagem: TypeScript.
- Desenho: three.js (biblioteca de desenho 3D, instalada pelo `npm install`, sem motor de jogo). Vida, recargas e textos são desenhados num Canvas 2D por cima da cena 3D.
- O three.js só pode ser usado em `src/apresentacao/`. A simulação não sabe que o desenho é 3D.
- Ferramentas: Vite para rodar o jogo com recarga automática, Vitest para os testes da simulação.
- Sem serviços pagos e sem dependências além das necessárias.

## Comandos

Precisa do Node.js instalado (versão 20.19 ou mais nova; na linha 22, a 22.12 ou mais nova). Na pasta do projeto:

- Instalar (uma vez, e de novo quando `package.json` mudar): `npm install`
- Rodar o jogo: `npm run jogar` e abrir o endereço que aparecer (normalmente http://localhost:5173)
- Rodar os testes: `npm run testar`
- Conferir tipos e testes juntos: `npm run verificar`
