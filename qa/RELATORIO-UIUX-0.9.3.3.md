# UIUX-0.9.3.3 — Homologação cromática contextual dos diálogos

Base: `eca32d71829057bce6fb355abd45656e2f515b51` (UIUX-0.9.3.2).

## Diagnóstico

A auditoria da UIUX-0.9.3.2 verificava o contraste dos textos, mas não verificava a correspondência entre a superfície usada por um diálogo e o tema ativo. Três diálogos — **Modelos de Laboratório**, **Preservar o projeto anterior** e **Relatório de Conformidade** — continuavam usando cores fixas do tema escuro quando a interface estava clara. Essa falha pode persistir mesmo com textos legíveis.

O novo contrato compara a cor calculada de cada superfície com seus tokens de tema `--mrl-ui-card` e `--mrl-ui-surface`; não basta apenas obter contraste acima de 4,5:1.

## Correção

- Atualizado `css/temas-contraste.css` com pares de fundo/texto específicos para cartões, cabeçalhos, corpos, rodapés, cartões de modelos, estatísticas, linhas do relatório e botões de diálogos.
- Garantido foco visível nos controles interativos e manutenção do destaque destrutivo com texto branco contrastante.
- Manter intactos os pictogramas e cores semânticas dos riscos, o Canvas, os dados de projetos, o IndexedDB, o formato JSON v4 e a geometria.
- Cache PWA atualizado para `uiux-0.9.3.3-dialog-theme-v1`.

## Testes efetuados

- **23/23** suítes Node de frontend aplicáveis aprovadas.
- **56 cenários contextuais** no Chromium isolado, com sete estados: Home com autosave, editor com camadas, Modelos, Confirmação, Relatório, Biblioteca e Configurações; temas claro/escuro, alto contraste ligado/desligado e leitura simples ligada/desligada.
- **1.856 verificações de contraste textual**, nenhuma falha calculada.
- **72 verificações de paridade de superfície** nos diálogos: antes da correção, **72 inconsistências**; depois, **zero**.
- **240 verificações geométricas de layout** em 320 × 568, 390 × 844, 768 × 1024, 1024 × 768 e 1440 × 900 px, com fontes em 100%, 150% e 200%: nenhum transbordamento horizontal detectado.

## Limitações e pendências

O Chromium do ambiente bloqueia navegação direta tanto ao GitHub Pages quanto ao servidor local por política administrativa. Por isso, a página foi renderizada em uma origem de teste isolada com HTML/CSS reais e conteúdo dinâmico representativo; a matriz não constitui validação do site ao vivo, do PWA instalado, de Firefox ou de Safari/WebKit. O contrato de paridade e os cálculos de contraste não substituem inspeção por leitores de tela ou conformidade WCAG completa.

Os testes e as capturas estão incluídos no ZIP de auditoria, com o script `qa/uiux0933-modal-matrix.py`. `tests/uiux-0933-dialog-theme.mjs` é o teste de regressão que valida a presença das regras e a atualização do PWA.
