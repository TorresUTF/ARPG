# Instruções do projeto

Jogo de ação visto de cima com chefes e controle de MOBA.
Antes de qualquer trabalho, leia `VISAO.md`: ele define o que o jogo é e o que não é.

## Sobre o autor

- Trabalha sozinho e não é programador experiente. Explique as mudanças em português claro, sem jargão desnecessário.
- Responda sempre em português.
- Faça apenas o que foi pedido. Ideias extras são bem-vindas como sugestão em uma linha, nunca implementadas por conta própria.

## Estrutura de pastas

- `VISAO.md`: pilares do jogo. Só o autor altera.
- `TESTES.md`: diário de testes do autor. Nunca escreva nem edite este arquivo. Leia-o para entender o que foi sentido nos testes.
- `dados/`: todos os números do jogo (dano, alcance, recargas, velocidades, tempos dos ataques do chefe).
- `design/`: um documento por sistema. Descreve estrutura e regras, nunca valores.
- `prototipos/`: código descartável, para descobrir se uma ideia diverte. Não precisa de qualidade nem de documento.

## As três trilhas de mudança

Classifique todo pedido em uma trilha antes de começar. Na dúvida, pergunte ao autor.

| Trilha | Quando | Processo |
|---|---|---|
| **Ajuste** | Mudar um número | Altere direto em `dados/`. Sem documento, sem revisão, sem plano. |
| **Comportamento** | Mudança pequena dentro de um sistema que já existe | Implemente direto. Ao final, atualize o documento do sistema em `design/` com uma linha. |
| **Estrutura** | Sistema novo, ou mudança que atravessa vários sistemas | Primeiro um protótipo em `prototipos/`. Só depois de o autor testar e aprovar, processo EGM completo. |

Não use o processo EGM para as trilhas de Ajuste e Comportamento.

## Regras de arquitetura

1. **Simulação separada do desenho.** O código em `src/simulacao/` contém as regras do jogo e não conhece tela, som nem entrada do usuário. Ele deve poder rodar em testes automáticos, sem navegador.
2. **Passo de tempo fixo.** A simulação avança 60 vezes por segundo, sempre com o mesmo intervalo, independente da taxa de quadros do desenho.
3. **Unidades do mundo.** A simulação usa metros e segundos, nunca pixels. A conversão para a tela acontece só em `src/apresentacao/`.
4. **Toda ação tem três fases: preparo, ativo e recuperação.** Vale para as habilidades do personagem e para os ataques do chefe. O preparo do chefe é o aviso do golpe e sempre precisa ser visível.
5. **Ações descritas em dados.** Nenhum número de jogo fica escrito no código. Habilidades e ataques do chefe são entradas em `dados/` com a duração das fases, o alcance e os efeitos.
6. **Controle convertido em intenções.** `src/controle/` transforma mouse e teclado em comandos ("mover para este ponto", "usar Q nesta direção"). A simulação só recebe comandos.
7. **Eventos para a parte sensorial.** A simulação emite eventos ("acertou", "aparou", "postura quebrada") e `src/apresentacao/` responde com efeitos visuais e som. Efeitos nunca alteram as regras.
8. **Painel de ajuste.** `src/painel/` permite alterar os valores de `dados/` com o jogo rodando. Todo valor novo em `dados/` deve aparecer no painel.

Arte não é prioridade: formas geométricas até o autor dizer o contrário.

```
src/
├── simulacao/     regras: movimento, ações, postura, chefe
├── controle/      mouse e teclado viram intenções
├── apresentacao/  desenho, som e efeitos
└── painel/        ajuste dos números com o jogo rodando
```

## Ao terminar qualquer mudança

Diga, em poucas linhas:

1. o que mudou;
2. como rodar o jogo;
3. o que o autor deve testar jogando para avaliar a mudança.

## Tecnologia

- Jogo web em 2D, visto de cima, rodando no navegador.
- Linguagem: TypeScript.
- Desenho: Canvas 2D do próprio navegador, sem motor de jogo.
- Ferramentas: Vite para rodar o jogo com recarga automática, Vitest para os testes da simulação.
- Sem serviços pagos e sem dependências além das necessárias.
- O visual pode migrar para 3D no futuro trocando apenas `src/apresentacao/`. Não antecipe isso no código.

## Comandos

Precisa do Node.js instalado (versão 20 ou mais nova). Na pasta do projeto:

- Instalar (uma vez, e de novo quando `package.json` mudar): `npm install`
- Rodar o jogo: `npm run jogar` e abrir o endereço que aparecer (normalmente http://localhost:5173)
- Rodar os testes: `npm run testar`
- Conferir tipos e testes juntos: `npm run verificar`
