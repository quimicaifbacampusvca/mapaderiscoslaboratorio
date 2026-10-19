# UIUX-0.9.3.2 — Contraste em componentes dinâmicos e auditoria ampliada

Base: `2d656f6bc5064f987f9a57c7b1f40adfb0de994d`.

## Causa e correção

Na Home com autosave, as etiquetas `#recentList .recent-chip` apresentavam fundo escuro combinado a texto escuro herdado do modo claro. Contraste observado: 1,05:1 (claro) e 1,42:1 (claro com alto contraste). A legenda técnica `01 / ÁREA DE SIMULAÇÃO` também tinha contraste insuficiente, 1,77:1 no modo claro. A correção estabelece pares coerentes de cores de texto e superfícies para etiquetas de autosave, contador de objetos, campos com unidades, feedback de medidas, legenda técnica e marca do cabeçalho.

## Matriz de teste ampliada (Chromium isolado)

- **22/22** suítes Node aplicáveis.
- **1.616 nós de texto** inspecionados em **32 estados**: 2 temas × 2 opções de contraste × 2 opções de leitura simples × Home/editor/biblioteca/configurações. Resultado pós-correção: **zero violações** no cálculo de contraste CSS para texto visível, usando limites de 4,5:1 ou 3:1 para texto grande.
- **300 combinações responsivas**, com larguras 320, 390, 768, 1024 e 1440 px; temas claro e escuro; contraste normal e alto; texto 100%, 150% e 200%; e cinco modos de visão de cores. Foram **2.400 verificações** de posição dos oito acessos principais da Home, sem transbordamento horizontal.
- Capturas comparativas Home/editor nos dois temas, com autosave e lista de objetos simulados.

## Limites

Os testes renderizaram HTML/CSS reais com conteúdo de teste no Chromium em página isolada, devido ao bloqueio de navegação HTTP no ambiente. O cálculo usa CSS antes da filtragem visual e não certifica contraste percebido após os filtros de daltonismo. Testes completos de leitor de telas, Firefox, WebKit, instalação PWA e GitHub Pages continuam pendentes.

A correção não modifica `js/mapa.js`, dados do projeto, JSON v4, IndexedDB, Canvas, geometria ou cores semânticas dos riscos. O cache PWA foi versionado para `uiux-0.9.3.2-visibility-v1`.

## Scripts reproduzíveis

`node tests/uiux-0932-dynamic-contrast.mjs`. Os scripts `uiux0932-deep-audit.py` e `uiux0932-responsive-audit.py`, os resultados JSON e as capturas estão incluídos no pacote de auditoria distribuído junto à rodada.
