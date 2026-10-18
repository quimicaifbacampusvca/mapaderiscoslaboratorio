# Mapa de Riscos do Laboratório — editor sem login

Ferramenta de criação de plantas e mapas de riscos 2D, com interface direta e sem cadastro.

## Como usar

1. Abra `index.html` pelo GitHub Pages ou por um servidor HTTP estático (`python3 -m http.server 5500`).
2. Escolha **Novo Projeto**, **Usar Modelo**, **Abrir Projeto** ou **Importar Modelo JSON**.
3. O progresso é salvo automaticamente **neste navegador**, usando `localStorage`. Para backup, transporte entre dispositivos ou compartilhamento, **exporte o projeto para JSON**.

## Alteração de arquitetura (remoção do login)

O frontend não solicita conta, e-mail ou senha. O módulo de login `js/auth.js` foi removido. Os arquivos de configuração e integração do GAS foram preservados no repositório para compatibilidade histórica, **mas não são carregados** pelo HTML nesta versão. O módulo GAS em `gas/` foi mantido **apenas como referência/legado** e não é invocado pelo site.

**Não há sincronização com Google Sheets/Drive, criação de salas remotas nem vínculo de JSON a professores nesta versão sem login.** Dados e contas preexistentes na planilha mestra/Drive **não foram alterados**. Para recuperar colaboração remota sem cadastro, será necessário projetar autorização por códigos de sala com chave privada de edição (e não liberar gravação anônima de todos os projetos).

## Testes

`node tests/no-login-smoke.mjs` valida que a interface está desprovida de login e não exige autenticação para abrir o editor. `node tests/core-smoke.mjs` cobre utilitários geométricos. Outros testes GAS no repositório pertencem ao backend legado, não ao fluxo atual.

## Licença

Ver `LICENSE`.

## Refinamento UIUX-0.2.0 — Projetos e prevenção de perda de dados

- **Novo Projeto**, modelos e importação de JSON validam os dados e confirmam a substituição quando existe trabalho a preservar.
- O diálogo oferece **Cancelar**, **Baixar JSON anterior** e **Substituir projeto**. Cancelar deixa o estado e o autosave intactos.
- A cópia recuperável mais recente é mantida localmente em `mapa_riscos_previous_autosave` e pode ser restaurada pela Home. **Há somente uma cópia anterior; não é um histórico ilimitado**. Limpar os dados do navegador remove ambas.
- O autosave atual continua em `mapa_riscos_autosave`. O botão superior **Baixar JSON** baixa o arquivo; não salva na nuvem.
- Um autosave inválido não é exibido como válido nem apagado silenciosamente. Em caso de armazenamento bloqueado/quota, o sistema avisa, preserva o trabalho em memória e recomenda baixar JSON.
- O botão antigo **Sair** foi retirado por não existir autenticação nesta versão.

Testes: `node tests/uiux-020-project-safety.mjs` e `python qa/uiux020-browser.py`. O teste de navegador usa uma página isolada com armazenamento simulado, não substituindo testes HTTP no GitHub Pages e nos motores Firefox/WebKit.

## UIUX-0.3.0 — Cotas e graduação adaptativa

No editor, ative **Cotas** para exibir as dimensões reais da área ativa e réguas métricas horizontal e vertical. As marcas começam em **1 m** e ganham subdivisões à medida que o zoom aumenta: 50, 20, 10, 5, 2 e **1 cm**. O limite máximo é 1200 pixels por metro (12 px/cm). Alterar o zoom não modifica objetos, paredes ou dimensões salvas.

Os traços de graduação são uma sobreposição visual no Canvas, não editável e não gravada no JSON. A exportação SVG preserva o conteúdo anterior, sem a régua. Mais detalhes e evidências em `qa/RELATORIO-UIUX-0.3.0.md`.

Para regressão local, execute `node tests/uiux-030-metric-ruler.mjs` e os testes existentes. A suíte Chromium requer Playwright Python e executável do Chromium; o relatório informa as limitações de browsers ainda não testados.

## Atualização UIUX-0.4.0 — componentes e diálogos

Os diálogos de confirmação, modelos, atalhos e relatório agora compartilham navegação por teclado, retorno de foco, gerenciamento de sobreposição e dimensionamento responsivo. Ações que exigem confirmação são bloqueadas se a janela estiver indisponível. Notificações aparecem também na Home e têm empilhamento limitado. A identidade visual, o Canvas, a geometria e o formato JSON foram preservados.

Ver `qa/RELATORIO-UIUX-0.4.0.md` e executar `node tests/uiux-040-dialogs.mjs`. Para regressão Chromium com Playwright: `python qa/uiux040-browser.py` (dependências: Python Playwright e Chromium disponível).

## UIUX-0.5.0 — Responsividade do editor

Nas larguras de **320 a 1100 px**, a barra superior mantém todas as ações de projeto acessíveis e os painéis de Ferramentas e Propriedades funcionam como drawers com botões explícitos de fechar, backdrop e retorno de foco. Em tablet estreito, isso libera espaço para o Canvas sem refazer a estrutura do editor. Em 320–540 px, a barra de ferramentas se distribui em duas linhas, mantendo seleção, movimentação, grade, snap, cotas e zoom inteiramente visíveis. As alturas dos drawers acompanham a altura real da barra superior.

Não houve alteração do motor Canvas, do formato JSON, do autosave nem do backend. Testes: `node tests/uiux-050-responsive.mjs` e `python qa/uiux050-browser.py`. Os testes do navegador foram executados no Chromium em modo isolado; Firefox, WebKit/Safari e implantação HTTP/GitHub Pages requerem homologação externa.

## UIUX-0.6.0 — Acessibilidade e feedback

O aviso introdutório sobre login e salvamento foi retirado da Home. A navegação do editor respeita atalhos essenciais do navegador: **Alt+Shift+L/P** direcionam para camadas e propriedades, e **Alt+Shift+D** duplica a seleção quando o Canvas está focado. O teclado não modifica o desenho quando o usuário está interagindo com botões ou formulários. Abas, alternâncias e notificações anunciam seus estados de forma mais consistente, com redução de animações conforme a preferência do sistema.

O **formato JSON v4 não mudou**. Para os testes e ressalvas, consulte `qa/RELATORIO-UIUX-0.6.0.md`. A reformulação visual e as estratégias PWA/offline estão em discussão futura na `UIUX-0.8.x`, sem implementação nesta rodada.


## UIUX-0.8.1 — Identidade Alerta e Precisão

O logotipo, wordmark, ícone e nova camada de estilo constam em `assets/svg/mrl-symbol.svg`, `assets/svg/mrl-app-icon.svg` e `css/identidade-alerta-precisao.css`. A Home e o editor ganharam a identidade escolhida. A lógica do editor e o formato JSON v4 não mudaram. Ver `qa/RELATORIO-UIUX-0.8.1.md`. O PWA e armazenamento offline aprimorado continuam pendentes.
