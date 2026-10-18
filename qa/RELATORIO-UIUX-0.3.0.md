# UIUX-0.3.0 — Sistema de medidas e malha métrica adaptativa

**Projeto:** Mapa de Riscos do Laboratório  
**Base do código:** branch `main`, commit `786849c6a6266318eef2f0e436fa823bcb3ca3b1` (UIUX-0.2.0)  
**Estratégia:** refinamento conservador; nenhuma mudança no formato JSON ou no backend.  

## Implementação

- O controle **Cotas** aciona/desativa uma camada visual de graduação independente da grade de edição e do snap.
- Dimensões reais do laboratório informadas no Canvas, com formatação `pt-BR` (`12,00 × 8,00 m`, por exemplo).
- Marcação estrutural de **1 m em 1 m**, com réguas horizontais e verticais alinhadas à geometria do laboratório.
- Subdivisões progressivas selecionadas por **distância em pixels por marca**, usando a ordem `1 m`, `50 cm`, `20 cm`, `10 cm`, `5 cm`, `2 cm`, `1 cm`.
- Histerese de 7% nas trocas de nível para evitar oscilações durante zoom contínuo.
- Novo limite de zoom **1200 px/m** (12 px/cm), por botões e rolagem, preservando dimensões reais.
- Régua horizontal posicionada fora da região coberta pela barra de ferramentas; indicador geral próximo ao canto inferior direito, sem sobrepor a barra.
- Renderização recortada ao viewport, inclusive da antiga grade de edição, para evitar percorrer laboratórios enormes em ampliações extremas.
- Contorno externo do laboratório limitado visualmente a 8 px de espessura, evitando cobrir conteúdo quando ampliado.
- Cotas de objetos selecionados mantidas. Nenhuma alteração nos modelos, no controle de projetos ou na exportação de SVG/JSON.

## Faixas de graduação por densidade de pixels

Os limiares são calculados em **pixels por intervalo**, não por número estático da porcentagem de zoom.

| Graduação | Separação mínima aproximada | Zoom para aparecimento, ao ampliar |
|---|---:|---:|
| 1 m | base | qualquer zoom |
| 50 cm | 45 px | ~97 px/m |
| 20 cm | 40 px | ~214 px/m |
| 10 cm | 34 px | ~364 px/m |
| 5 cm | 28 px | ~599 px/m |
| 2 cm | 17 px | ~910 px/m |
| 1 cm | 10 px | ~1070 px/m |

Ao reduzir o zoom, os níveis persistem por uma margem de 7%, desde que as marcas permaneçam distinguíveis. As mudanças não alteram a malha de encaixe de objetos.

## Arquivos alterados

- `js/metric-ruler.js` (novo) — seleção de nível, réguas, graduação principal, formatação e clipping.
- `js/mapa.js` — integração no `draw()`, limite de zoom e otimização da grade já existente.
- `index.html` — carregamento do módulo novo e `aria-pressed` inicial do botão Cotas.
- `tests/uiux-030-metric-ruler.mjs` — testes de unidade, histerese, alinhamento, limite de operações e contrato da interface.
- `qa/uiux030-browser.py` — cenários Chromium, medições 1 cm, importação/exportação e desempenho.
- `qa/RELATORIO-UIUX-0.3.0.md` — registro de implementação e QA.
- `README.md` — instruções atualizadas.

## Testes executados

1. **77/77** testes funcionais em Chromium, em largura 320, 360, 390, 414, 768, 1024 e 1440 px; incluem dimensão do laboratório, botão Cotas ligado/desligado, graduação inicial de 1 m, zoom de 1 cm, pan, ausência de exceções e preservação do modelo.
2. **1 cm medido em tela:** a 1150 px/m, 1 cm = **11,5 pixels**; a 1200 px/m, 1 cm = **12 pixels**.
3. **Zoom:** ambos os controles, clique e rolagem, alcançam a graduação centimétrica e respeitam o teto de 1200 px/m. `Enquadrar sala` retorna ao enquadramento.
4. **Importação:** laboratório de **18 × 9 m** corretamente reconhecido; JSON exportado mantém apenas o formato v4 existente, sem dados artificiais da régua; SVG continua exportável.
5. **Desempenho:** laboratório artificial de 10.000 × 10.000 m em zoom alto: 10 renderizações em Chromium, média observada **inferior a 100 ms** e pico **inferior a 250 ms** no ambiente isolado. Este é um ensaio técnico, não um benchmark de hardware real.
6. **Regressão UIUX-0.2.0:** **49/49** verificações e cenários adicionais de modelos/autosave reaplicados com o novo módulo.
7. **Testes Node:** `core-smoke.mjs`, `ui-bindings-smoke.mjs`, `frontend-integrity-smoke.mjs`, `no-login-smoke.mjs`, `uiux-020-project-safety.mjs`, `uiux-030-metric-ruler.mjs`.

## Evidências visuais

- `qa/uiux030-cotas-1cm-320px.png`
- `qa/uiux030-cotas-1cm-390px.png`
- `qa/uiux030-cotas-1cm-1440px.png`
- `qa/uiux030-browser-results.json`

## Limitações e homologação

- Os testes visuais usam **Chromium com carregamento isolado dos arquivos HTML/CSS/JS**, sem HTTP externo, porque o ambiente não permite abrir `localhost` no navegador. **Não equivalem** a um teste em produção GitHub Pages.
- **Firefox e WebKit/Safari não foram executados** por indisponibilidade de binários/downloads no ambiente. A homologação entre navegadores segue pendente.
- A camada de cotas permanece **somente no editor Canvas**; os arquivos SVG exportados seguem o contrato anterior, sem a nova régua. Isso está previsto na especificação e não altera coordenadas do JSON.
- A barra horizontal de ferramentas continua parcialmente fora da tela em mobile nas larguras pequenas. Essa inconsistência foi identificada na UIUX-0.1.0 e pertence à série **UIUX-0.5.0**, não a esta rodada.
- Planta retangular: a cota geral corresponde às dimensões reais de cada área retangular. Trechos de paredes irregulares continuam sem ferramenta de cotagem individual, fora do escopo desta versão.

**Situação:** implementação concluída e validada localmente em Chromium; homologação cruzada Firefox/WebKit e site hospedado pendente.
