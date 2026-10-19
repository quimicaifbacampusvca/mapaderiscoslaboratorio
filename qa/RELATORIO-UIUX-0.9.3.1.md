# UIUX-0.9.3.1 — Correção de tradução de cores nos modos de acessibilidade

**Origem:** branch main, após UIUX-0.9.3; referência visual: duas capturas do usuário no modo claro.

## Diagnóstico

A folha de acessibilidade trocava para cores de texto escuro em vários componentes, inclusive quando estes conservavam fundos escuros herdados da identidade original. Consequências: títulos ilegíveis na Home e biblioteca; campos de camadas, riscos e legendas com pouco contraste; cabeçalho misturado; subtítulos claros sobre claro. Uma regra de Leitura Simples também fixava texto quase branco independentemente do tema.

## Mudanças

- Tokens de superfícies e texto por tema claro/escuro, pares de contraste alto claros/escuros, estilos de leitura simples e foco.
- Componentes adaptados: Home, continuar projeto, biblioteca e cópia recuperável, 4 cartões iniciais, cabeçalho, painéis esquerdo/direito, árvore de camadas, resumo de riscos, dimensões, formulários, modais, acessibilidade e select personalizado.
- Evitada a aplicação generalizada de `!important` a todo `span`, preservando semântica de cores, ícones de risco e outros indicadores.
- Canvas e pictogramas de risco não recebem recoloração pelo tema. Visão de cores continua como simulação aproximada e não como ferramenta de correção.
- Folha `css/temas-contraste.css` carregada após `css/acessibilidade.css`.
- Cache PWA atualizado para `uiux-0.9.3.1-theme-contrast-v1`, incluindo a nova folha. JSON, IndexedDB e medidas não mudaram.

## Validação realizada

- 21/21 suítes Node aplicáveis de frontend na cópia de trabalho.
- 2.560 verificações de contraste computado no Chromium isolado: 4 resoluções (320, 390, 768, 1440 px), Home e editor, 2 temas, 2 modos de contraste, leitura simples ligada/desligada e 5 valores de simulação de visão de cores; zero amostras abaixo de 4,5:1 **nas combinações amostradas pelo CSS**.
- Esses cálculos não medem os pixels transformados por `backdrop-filter`, nem certificam todos os textos como WCAG AA; a simulação CVD não equivale à percepção de pessoas com deficiência de visão de cores.
- Ensaios de contrato de PWA/cache, regressão geométrica e arquivo JSON incluídos nas suítes aplicáveis.

## Homologação ainda pendente

Firefox, Safari/WebKit, leitor de telas, navegação no GitHub Pages publicado, atualização efetiva de PWA instalado e filtros CVD renderizados entre navegadores. Não declarar 1.0.0 homologada com base nesta auditoria isolada.

## Segurança e regressão

Sem alteração do motor `js/mapa.js`, geometria, dados locais, SVG exportado nem cache de projetos do usuário. Evitar apagar dados do navegador ao testar o PWA.
