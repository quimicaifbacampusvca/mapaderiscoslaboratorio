# UIUX-0.9.2.3 — Barra superior e instalação PWA nas Configurações

**Base:** commit `1b6905eddd4bd1fd51c27b68d7479ac19b03c7c6`.

## Problema e correção

Em desktop, a combinação de `display:block` para os agrupamentos de ação, rótulos longos e largura mínima dos itens causava quebra de grupos, sobreposição perceptível e ícones desalinhados. A nova folha de estilos impõe layout `flex` estável aos grupos, dimensões uniformes para ícones e botões, e hierarquia adaptativa por breakpoint. Textos secundários são ocultados/truncados progressivamente sem retirar o nome acessível dos botões.

A ação de instalar aplicativo (`pwaInstall`) e a atualização (`pwaUpdate`) foram mantidas com suas condições nativas e movidas para o painel Configurações. O menu está acessível pela Home e pelo editor. Não há mais a barra PWA flutuante sobre o mapa. O menu fecha com Escape, clique fora ou botão Fechar, e restaura o foco quando pertinente.

## Integridade

Sem alterações em `js/mapa.js`, geometria, dados JSON v4, projetos IndexedDB, autosave, regras de colisão, zoom ou desenhos da biblioteca. O service worker inclui `js/settings-menu.js` e atualiza o cache para `uiux-0.9.2-header-settings-v1`.

## Testes

- 19/19 suítes Node aplicáveis na cópia isolada de integração.
- Chromium isolado com HTML/CSS de produção em treze larguras e alturas: 320, 360, 390, 414, 768, 820, 1024, 1200, 1201, 1280, 1440, 1650 e 1920 px. Nenhum grupo principal se sobrepôs e nenhum cenário apresentou overflow horizontal.
- Abertura do painel no editor e na Home, Escape, foco e vínculo do botão PWA ao menu confirmados.
- Não validado no PWA instalado nem em Firefox/WebKit nesta rodada: exigem testes no dispositivo e/ou ambiente disponível.

## Próximos passos

Integrar os 15 desenhos restantes da biblioteca gráfica em etapa independente; verificar a distribuição do novo menu no GitHub Pages e o prompt real de instalação do navegador.
