# Relatório técnico — UIUX-0.5.0

**Projeto:** Mapa de Riscos do Laboratório  
**Série:** UIUX-0.5.0 — Responsividade e estabilidade do workspace  
**Base:** `5620a6f6332cfd7b0888305a4794ea19400b39ac` (`main`)  
**Abordagem:** refinamento conservador, sem mudança geométrica ou de formato JSON.

## Problemas reproduzidos

1. Em 320 px, os comandos **Snap**, **Cotas** e **Zoom** estavam fora da área inicialmente visível da barra de ferramentas (overflow interno).
2. Em aproximadamente 1024 px, a barra superior tinha largura de conteúdo maior do que o espaço disponível.
3. Em 820 px, os painéis fixos de 280 e 320 px deixavam somente cerca de **220 px de Canvas**.
4. Ao navegar para a Home, a classe de abertura do painel móvel poderia permanecer ativa; a transferência de foco não aguardava a visibilidade do drawer.
5. A altura fixa de 50 px para o deslocamento dos drawers era inadequada quando a barra superior passava a ter duas linhas.

## Correções

- Normalização responsiva da barra superior, com um grupo identificado de ações de projeto e ícones acessíveis por `aria-label`.
- Reorganização da toolbar em linhas, sem scroll horizontal escondendo ferramentas.
- Painéis recolhíveis em telas até 1100 px; em desktop amplo, o arranjo de três colunas permanece.
- Drawer que abre com foco no botão de fechar; Escape, botão e backdrop devolvem foco ao controle de origem.
- Drawers inativos ficam `inert` no mobile/tablet, sem interferir na navegação por teclado.
- Retorno à Home e mudança de tablet para desktop desativam backdrop e drawers.
- Altura dos drawers calculada a partir da barra real; uso de `100dvh` e orientação horizontal/altura reduzida.
- Objetos, seleção, dimensões, coordenadas, cotas e zoom permanecem inalterados ao redimensionar.

## Resultados

| Teste | Resultado |
|---|---|
| 11 cenários de viewport, incluindo 320 × 420 e 600 × 360 | Executados |
| Chromium — responsividade/interações/resize | **245/245 aprovados** |
| Chromium — UIUX-0.4.0, diálogos | **167/167 aprovados** |
| Chromium — UIUX-0.3.0, medidas | **77/77 aprovados** |
| Chromium — UIUX-0.2.0, projetos | **49/49 aprovados** |
| Testes Node do frontend (séries anteriores) | **7/7 aprovados** |
| Novo teste Node UIUX-0.5.0 | **1/1 aprovado** |
| Firefox e WebKit/Safari | **Não executados: motores indisponíveis** |
| Site hospedado no GitHub Pages | **Não verificado nesta rodada** |

As capturas reais do Chromium e os resultados do Playwright ficam na pasta de QA do pacote ZIP. Os testes usam o HTML, CSS e JavaScript da versão, mas carregados em página isolada e com localStorage simulado; **não são equivalentes a uma homologação do site publicado**. As verificações não provam suporte integral a teclado virtual nativo em aparelhos físicos.

## Arquivos modificados

- `index.html`: marcação do agrupador de ações superiores.
- `css/mapa.css`: breakpoints, painéis, altura dinâmica e distribuição de comandos.
- `js/mapa.js`: comportamento de painel, retorno de foco e limpeza de estado na Home/resize.
- `README.md`: documentação da versão.
- `tests/uiux-050-responsive.mjs`: invariantes estáticos de responsividade.
- `qa/uiux050-browser.py` e relatório: testes e evidências.

## Restrições preservadas

Sem mudança no Canvas 2D, dimensões reais, lógica de seleção, movimentação, encaixe, camadas, importação/exportação JSON, modelos ou infraestrutura GAS. Não foram incluídas novas funcionalidades.
