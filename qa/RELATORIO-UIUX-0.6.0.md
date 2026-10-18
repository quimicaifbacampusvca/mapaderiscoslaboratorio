# UIUX-0.6.0 — Acessibilidade, feedback e microinterações

**Origem verificada:** `main` — `356c6b73b9591e6a5c11d4319281690fd63af0ca`.

## Intervenções
- Remoção do aviso explicativo de login/autosave da página inicial, sem substituí-lo por outro banner.
- Preservação dos comandos de navegador `Ctrl+L`, `Ctrl+P`, `Ctrl+D` e `Ctrl+F`.
- Atalhos específicos não conflitantes: `Alt+Shift+L` (camadas), `Alt+Shift+P` (propriedades) e `Alt+Shift+D` (duplicação, com foco no Canvas), além de `?` para ajuda.
- Ações geométricas de teclado restritas ao foco no Canvas. Campos, botões e menus não recebem comandos destrutivos acidentalmente.
- Em dispositivos até 1100 px, os atalhos de camadas/propriedades abrem o drawer do painel lateral antes de transferir o foco.
- Abas com `aria-controls`, `aria-labelledby`, seleção e roving `tabindex`; setas Home/End alteram a aba com foco.
- Ferramentas de seleção, pan, grade e snap expõem `aria-pressed`, assim como o controle de cotas existente.
- Deduplicação de notificações iguais simultâneas, `aria-atomic` individual e papéis `alert`/`status` apropriados. Preservado limite de três toasts.
- Melhorias explícitas de foco e respeito a `prefers-reduced-motion` para elementos de navegação sem alterar o Canvas.

## Limites
Não houve login, PWA ou redesenho. Nenhuma alteração no formato JSON, na geometria e no serviço GAS. Há lacunas de acessibilidade inerentes à manipulação gráfica Canvas que exigirão projeto específico caso se queira acessibilidade plena de desenho por tecnologias assistivas.

## Verificação
- `node` para os nove testes relacionados ao frontend: todos aprovados.
- `python qa/uiux060-browser.py`: **86/86 verificações** Chromium, tamanhos 320, 390, 768, 1100 e 1440 px, sem erros JavaScript.
- `python qa/uiux030-browser.py`: **77/77 verificações** da malha métrica (regressão).
- `python qa/uiux050-browser.py`: **245/245 verificações** da responsividade (regressão).
- Firefox e WebKit/Safari: **não executados** neste ambiente; não considerar homologados.
- Testes de Chromium realizados por carregamento isolado de HTML/CSS/JS, e não diretamente em GitHub Pages; teste HTTP hospedado permanece pendente.

## Evolução planejada
A proposta `qa/PLANEJAMENTO-UIUX-0.8.x-IDENTIDADE-PWA-OFFLINE.md` é **apenas de discussão**, sem implementação de PWA ou recursos offline novos nesta série.
