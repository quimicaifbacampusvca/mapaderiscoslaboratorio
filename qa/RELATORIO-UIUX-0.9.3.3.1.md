# UIUX-0.9.3.3.1 — Correção residual dos indicadores do Relatório

Base oficial: `a37e34a99f66c456bc550bf9b7c7c700e3ad8192` (UIUX-0.9.3.3).

## Defeito reproduzido

Embora as superfícies dos diálogos tenham sido adaptadas na UIUX-0.9.3.3, o Relatório de Conformidade conservava alguns textos com cores fixas incompatíveis com o fundo. No tema claro, números de `.report-stat b` apresentaram contraste de aproximadamente **1,05:1**. No tema escuro, indicadores verde e amarelo apresentaram respectivamente **1,61:1** e **1,54:1**.

## Correção

Aplicar pares de cor e fundo específicos para `.report-stat b`, `.report-score.ok` e `.report-score.pending`. Manter distinção semântica de conforme/pendente, sem afetar cores dos riscos, objetos no Canvas, geometrias, JSON v4 e IndexedDB. Cache atualizado para `uiux-0.9.3.3.1-report-contrast-v1`.

## Auditoria e reprodução

Com HTML/CSS reais e conteúdos dinâmicos representativos, executou-se em Chromium isolado a matriz de **384 estados**: quatro diálogos, viewports 320×568, 390×844, 768×800 e 1440×900, temas claro/escuro, alto contraste ligado/desligado, leitura simples ligada/desligada e texto 100%, 150% e 200%. Foram **5.280 verificações de contraste CSS**.

- Versão UIUX-0.9.3.3: **96 estados com falha**.
- Subcorreção: **384/384 estados aprovados**, nenhuma falha computada.
- Regressão local do frontend: 23 suítes Node aplicáveis aprovadas na cópia de trabalho (sem incluir testes GAS legados) e novo teste de contrato criado.
- Um script Python/Playwright reproduzível, capturas e JSON de resultados integram o ZIP complementar da auditoria.

## Limitações

Não foi possível acessar a origem hospedada no GitHub Pages ou o servidor local via Chromium neste ambiente, por restrição administrativa de navegação. O cálculo se baseia nos estilos do Chromium em renderização isolada; não constitui certificação WCAG, não mede o contraste percebido depois dos filtros de daltonismo e não substitui testes Firefox, WebKit ou leitor de telas.