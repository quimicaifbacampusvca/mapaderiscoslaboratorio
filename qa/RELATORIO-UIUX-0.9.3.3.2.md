# UIUX-0.9.3.3.2 — contenção do painel de acessibilidade a 200%

## Defeito documentado

A suíte C04 da homologação H01–H10 identificou no site publicado, em viewport 320×568 e escala de texto 200%, transbordamento horizontal de conteúdo do painel Configurações > Acessibilidade. O botão “Restaurar padrões de acessibilidade” excedeu a largura de 320 px; a extremidade direita foi calculada entre aproximadamente 426,6 e 437,6 px nos três motores de navegador.

Evidência: execução GitHub Actions 39718764341, teste C04, capturas e rastros de Chromium, Firefox e WebKit.

## Correção restrita

- CSS de acessibilidade: faixa interna grid com minmax(0,1fr) e limites máximos de largura.
- Controles de acessibilidade: quebra de linha e redução de min-content para não extrapolar o painel.
- Service worker: versão de cache alterada para uiux-0.9.3.3.2-mobile-a11y-v1, exigida para distribuir o CSS atualizado inclusive aos PWAs existentes.
- Contratos estáticos de testes atualizados para o cache novo.

O Canvas, as cores científicas dos riscos, as coordenadas, o formato JSON v4, localStorage e IndexedDB não foram alterados.

## Evidência pós-correção

Na branch qa/homologacao-real-h01-h10, o teste C04 passou em Chromium, Firefox e WebKit. Na execução local da suíte completa, 47 de 48 verificações foram aprovadas (GitHub Actions 39719536001). A única falha foi P01 — navegação offline do WebKit no executor Linux, que lançou erro interno do navegador; o mesmo cenário passou em Chromium e Firefox. Não há evidência suficiente para declarar falha do aplicativo ou aprovação no Safari nativo.

O site hospedado continuou com o CSS antigo durante a execução do PR de QA e, por isso, reprovou C04 nos três motores. A validação da publicação corrigida deverá ser repetida após a integração da correção na main.

## Portões remanescentes

- Atualização do PWA instalado e verificação de cache CSS novo.
- Nova execução H01–H10/C01–C04 no GitHub Pages atualizado.
- P01 em Safari/WebKit nativo ou ambiente adequado.
- Leitores de telas e avaliação perceptiva manual.

**Situação:** correção validada em branch; a acessibilidade e a versão 1.0.0 não estão definitivamente homologadas.
