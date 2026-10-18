# UIUX-0.4.0 — Relatório de implementação e validação

**Programa:** Mapa de Riscos do Laboratório  
**Série:** UIUX-0.4.0 — Componentes, diálogos e controles globais  
**Base:** commit `83abf151afb860dfc2188c597ea1553aadddd137` da branch `main`  
**Abordagem:** refinamento conservador, sem alteração do modelo científico, do Canvas, do JSON ou do GAS.

## Alterações

1. **Confirmação fail-closed:** diálogo ausente ou desconectado do DOM bloqueia a execução. Um segundo pedido de confirmação não substitui silenciosamente o primeiro.
2. **Diálogos uniformizados:** confirmação, modelos, atalhos e relatório compartilham os critérios de abertura, fechamento, Escape, contenção de Tab/Shift+Tab, retorno de foco e impedimento de interação com a tela ao fundo.
3. **Sobreposição:** confirmação sobre seleção de modelos mantém o seletor montado/inativo, devolvendo o foco corretamente ao encerramento.
4. **Janelas adaptáveis:** dimensões máximas limitadas ao viewport, cabeçalho preservado e conteúdo com rolagem vertical interna, inclusive em telas estreitas.
5. **Estados de controles:** alinhamento de bordas, raio, áreas de toque em modais, hover, active, foco e disabled; sem introduzir paleta nova.
6. **Notificações:** movidas para o nível global para aparecer na Home e enquanto o editor estiver inerte; limite de três mensagens, duração definida e status acessível para sucesso/erro.
7. **Movimento:** animação/modal reduzida segundo `prefers-reduced-motion`.

## Resultados observados

| Suíte | Resultado | Ambiente |
|---|---:|---|
| `tests/uiux-040-dialogs.mjs` | Aprovada | Node.js |
| Outros seis testes Node de frontend | Aprovados | Node.js |
| `qa/uiux040-browser.py` | **167/167** | Chromium, HTML/CSS/JS isolados |
| `qa/uiux030-browser.py` | **77/77** | Chromium, regressão da malha métrica |
| `qa/uiux020-browser.py` | **49/49** | Chromium, regressão de projetos |
| `qa/uiux020-browser-extra.py` | Aprovado | Chromium, modelos e recuperação |

Larguras testadas: 320, 360, 390, 414, 768, 1024 e 1440 px. Incluem os quatro diálogos, foco e teclado, confirmação aninhada, erro por modal desconectado, tentativas sucessivas de confirmação e notificações. Capturas de 320, 390 e 1440 px acompanham o ZIP da versão.

## Restrições e pendências

- Os ensaios de Chromium usam `page.set_content` + scripts originais injetados e simulação de `localStorage`; não substituem ensaio HTTP em GitHub Pages.
- Firefox e WebKit/Safari não foram executados: navegadores não disponíveis no ambiente de testes.
- O cabeçalho e os comandos parcialmente cortados em viewport estreita permanecem destinados à **UIUX-0.5.0**. Não serão tratados na 0.4.0 para evitar ultrapassar o escopo.
- O repositório conserva alguns estilos de login legados não carregados, sem remoção neste ciclo. Arquivos históricos de integração GAS permanecem intactos.
- Não foram realizadas mudanças no Google Sheets, Google Drive ou GAS.

## Arquivos produtivos alterados

- `js/mapa.js`
- `css/mapa.css`

## Critério de conclusão

A série está aprovada nos testes locais listados. A homologação multiplataforma e o ambiente hospedado continuam sujeitos à UIUX-0.7.0, sem alegação de cobertura em Firefox ou WebKit.
