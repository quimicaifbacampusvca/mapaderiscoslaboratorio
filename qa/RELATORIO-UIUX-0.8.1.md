# UIUX-0.8.1 — Identidade visual Alerta e Precisão

**Projeto:** Mapa de Riscos do Laboratório  
**Base homologada:** `be7eeec469c44327a5c27a333a03d2bb543577ca`  
**Escopo:** Home, wordmark, logotipo, ícone do aplicativo e estilos do editor desktop/mobile.

## Integração

- Ícone vetorial em `assets/svg/mrl-symbol.svg`, inspirado no Conceito 3: hexágono azul, planta de laboratório isométrica, células de risco e aviso âmbar.
- Ícone de aplicativo e favicon em `assets/svg/mrl-app-icon.svg`. **Não é manifesto PWA**: a instalação fica para versão posterior.
- Wordmark em HTML/CSS: “Mapa de Riscos” com ênfase azul e “do Laboratório” secundário; marcador gráfico de escala.
- Paleta do Conceito 3: grafite `#0F141A`, azul técnico `#38BDF8`, âmbar `#F59E0B`, verde `#22C55E`, cinza gelo `#E5EEF7`, apoio `#475569`.
- UI Home e editor estilizadas pela folha independente `css/identidade-alerta-precisao.css`. O conteúdo ilustrativo da Home é estático e rotulado como tal.
- Tipografia preferencial "Exo 2" com fallback Segoe UI/Arial; a fonte Exo 2 **não é embarcada** neste pacote, logo depende de estar instalada.

## Preservação funcional

A base de `js/mapa.js`, `metric-ruler.js`, `types.js`, `geometry.js` e `validation.js` foi mantida **byte a byte**. Não foram alterados os identificadores de ações, lógica geométrica, persistência local, históricos, formato JSON v4, importação/exportação, zoom ou cotas. Sem login e sem integração GAS habilitada.

## Testes locais

- **9/9** suítes Node voltadas ao frontend, incluindo JSON, cotas, modais, responsividade e acessibilidade.
- **122/122** verificações de interação no Chromium em 1440, 1024, 768, 414, 390, 360 e 320 px.
- Condições verificadas: carregamento e proporção do logo, wordmark, ações da Home, abertura de modelos, Escape, criação de projeto, dimensões 12 × 8 m, zoom, cotas, painéis mobile, ausência de exceções e de overflow horizontal.
- Capturas em `qa/home-1440.png`, `qa/home-390.png`, `qa/home-320.png`, `qa/editor-1440.png`, `qa/editor-390.png`, `qa/editor-320.png`.
- Limitações: a política do ambiente impede o navegador de abrir `http://localhost` e `file://`; os testes Chromium injetaram arquivos locais verdadeiros com localStorage simulado. Não houve teste de GitHub Pages, Firefox ou WebKit.

## Limites da versão

PWA, service worker, IndexedDB, novas sincronizações, edição do motor Canvas e mudança de formatos permanecem fora do escopo. Não afirmar homologação multiplataforma definitiva.

## Rollback

Para reverter, use o commit-base `be7eeec469c44327a5c27a333a03d2bb543577ca` como referência e reverta somente as alterações visuais dessa série. Não limpar `localStorage`: os projetos estão vinculados à origem do navegador, e uma limpeza seria destrutiva.
