# UIUX-0.8.1.1 — Refinamento discreto das cotas e da grade

**Projeto:** Mapa de Riscos do Laboratório  
**Base:** `3591f217c5598596e56ed4d37d3401c1d4aa053d` (UIUX-0.8.1)  
**Natureza:** correção visual pontual; nenhuma alteração de dados, funções de edição ou geometria.

## Ajustes realizados

- Faixa da régua: 24 px → **18 px**, com preenchimento translúcido.
- Referências de 1 m: traços de 17 px → **8 px**; subdivisões de 11/6 px → **5/3 px**.
- Numeração das réguas: de negrito 10 px para **500/9 px**, com cor e contraste reduzidos.
- Linhas métricas principais do Canvas: opacidade 0,19 → **0,075**; continuam ancoradas nas medidas reais.
- Grade tradicional de 10 cm: opacidade de aproximadamente 0,19 → **0,094** (somente visualização).
- Indicador inferior das dimensões: tipografia **500/10 px**, altura **24 px**, fundo e borda mais discretos.
- Não alterar etapas de graduação: **1 m, 50 cm, 20 cm, 10 cm, 5 cm, 2 cm e 1 cm**.
- Zoom máximo, formato JSON v4, desenho, objetos e posição da câmera foram preservados.

## Arquivos de código afetados

- `js/metric-ruler.js`: estilo das réguas e indicador métrico.
- `js/mapa.js`: somente espessura/opacidade da malha tradicional.
- `tests/uiux-0811-discreet-metrics.mjs`: regressão dedicada.

## Testes executados

- **11/11** testes Node do frontend (incluindo a nova suíte de cotas discretas; testes de autenticação legados não contam).
- **122/122** verificações UIUX-0.8.1 no Chromium (7 larguras: 320, 360, 390, 414, 768, 1024 e 1440 px).
- **77/77** verificações específicas da graduação métrica no Chromium, incluindo 1 cm/11,5 px, deslocamento da câmera, desativação das cotas, exportação JSON e SVG.
- Comparação de captura do editor 1440 px em região vazia do mapa: o desvio padrão de cor no trecho da grade caiu aproximadamente de **9,11 para 5,40**, indicando menor dominância visual, sem alterar objetos ou dimensões.

**Limitações:** ensaios Chromium com HTML/CSS/JS reais injetados em página isolada devido às políticas do ambiente para HTTP; Firefox, WebKit e GitHub Pages não verificados nesta rodada. A comparação de imagem é uma métrica visual localizada, não certificação de contraste WCAG.

## Recuperação

Reverter apenas esta alteração caso haja problema visual; não limpar `localStorage`. O trabalho anterior permanece compatível com o JSON v4.
