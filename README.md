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


## UIUX-0.8.1.1 — Medições mais discretas

Redução da intensidade das réguas, rótulos, linhas métricas e badge de dimensões sem retirar os intervalos de 1 m a 1 cm. A malha de 10 cm também foi suavizada, sem alterar as coordenadas dos objetos ou o JSON v4. Consulte `qa/RELATORIO-UIUX-0.8.1.1.md` e execute `node tests/uiux-0811-discreet-metrics.mjs`.


## UIUX-0.8.2 — PWA instalável e uso offline

O Mapa de Riscos possui manifesto (`manifest.webmanifest`), ícones PNG 192/512 (incluindo máscaras para Android), ícone Apple Touch e service worker (`sw.js`) de cache local **versionado e atômico**. Tudo é relativo à raiz do projeto e também funciona quando publicado em um subcaminho como `/mapaderiscoslaboratorio/`.

**Primeira instalação:** abrir a página online por HTTPS (GitHub Pages) ou localhost, aguardar o carregamento completo e então, no navegador compatível, usar o comando de instalar o aplicativo. Em iPhone/iPad, usar o menu de compartilhamento do Safari e a opção de adicionar à Tela de Início (quando disponível). O botão **Instalar aplicativo** aparece apenas em navegadores que fornecem a opção `beforeinstallprompt`; a ausência do botão não implica ausência do PWA.

**Uso offline:** depois que a instalação do service worker concluir com sucesso, a Home, o editor e os assets estáticos essenciais podem ser recarregados sem conexão. O botão de instalação não é necessário para usar o cache offline. Em `file://`, o editor continua abrindo como página estática quando permitido, **mas o PWA não funciona**; para a primeira instalação é necessário HTTPS/localhost.

**Atualizações:** uma nova versão do service worker deve alterar `CACHE_NAME` e listar todos os arquivos obrigatórios em `SHELL_PATHS`. O download ocorre antes da troca; se um arquivo falhar, o SW anterior continua ativo. Quando uma atualização estiver pronta, o aplicativo oferece o botão **Atualização disponível · Atualizar**; não reinicializa o editor automaticamente. O usuário deve exportar em JSON qualquer trabalho importante antes da troca de versão.

**Dados dos projetos:** o service worker não acessa `localStorage`, não grava nem sincroniza JSONs, e não interfere no GAS. O autosave local e uma cópia anterior continuam no navegador, sob as mesmas chaves anteriores. Para proteção contra limpeza do navegador, mudança de dispositivo ou modo privado, continue usando **Baixar JSON**. Biblioteca de projetos e IndexedDB pertencem à etapa posterior, não a esta série.

Ver `qa/RELATORIO-UIUX-0.8.2.md`. Testes automatizados: `node tests/uiux-082-pwa.mjs`, `python qa/uiux082-http-assets.py`, além das suítes existentes. Para testes manuais reais de service worker no GitHub Pages, consulte a matriz de homologação do relatório.


## UIUX-0.8.3 — Biblioteca local de projetos (IndexedDB)

A Home inclui **Abrir biblioteca**. Os projetos do editor agora recebem um identificador interno **exclusivo do IndexedDB** e são salvos em registros separados, preservando o `localStorage` atual como rascunho e cópia de segurança adicional. O editor também dispõe da ação **Revisão** para guardar um ponto de recuperação explícito. A biblioteca permite abrir, renomear, recuperar revisão e excluir projetos não ativos mediante confirmação em duas etapas. O histórico mantém **no máximo 10 revisões por mapa**.

Na primeira inicialização, o programa **copia** o autosave e a cópia anterior válidos para o IndexedDB, sem apagar suas chaves originais. A migração usa marcador transacional para não duplicar importações. O formato JSON v4 permanece intacto; arquivos legados com `room/objects` são aceitos na migração.

**Limitações:** biblioteca local, sem conta, nuvem ou sincronização entre dispositivos; limpar os dados do site também pode apagar IndexedDB. Exportar JSON continua sendo o caminho portável para backups. O service worker 0.8.3 inclui os dois novos scripts e instala o cache completo antes da atualização. Abertura online inicial, instalação e modo offline hospedado precisam de conferência real no GitHub Pages.

Testes: `node tests/uiux-083-library.mjs` e `python qa/uiux083-browser.py` (modo Chromium isolado com API IndexedDB simulada). Veja `qa/RELATORIO-UIUX-0.8.3.md`.

## UIUX-0.8.4 — Distribuição portátil para uso offline

O pacote `Mapa-de-Riscos-Portatil-Offline-UIUX-0.8.4.zip` contém o shell estático local com checksums e iniciadores para uso em computadores escolares, sem chamada ao backend. Windows: `portable/iniciar.cmd` (Python 3 instalado, ou fallback PowerShell); Linux/macOS: `sh portable/iniciar.sh` com Python 3. Endereço padrão **`http://127.0.0.1:8765/`**, sempre fixo para preservar o acesso à biblioteca local entre sessões do mesmo navegador. Para transferência do GitHub Pages ou entre computadores, **exporte e importe arquivos JSON**; dados em diferentes origens não sincronizam automaticamente. A versão portátil ainda requer homologação real de Windows, Firefox, WebKit e PWA instalado.

Os scripts de geração e verificação ficam em `tools/montar-portatil.py` e `tools/validar-portatil.py`. Instruções completas: `LEIA-ME-OFFLINE.md`; relatório técnico: `qa/RELATORIO-UIUX-0.8.4.md`.


## UIUX-0.9.0 — Estabilização de dados e entrega offline

O IndexedDB agora recebe as tentativas de salvamento, inclusive quando o autosave no `localStorage` falha por quota ou bloqueio. O botão **Revisão** tenta salvar no IndexedDB independentemente da disponibilidade do `localStorage`; o programa ainda avisa da falha do autosave principal e recomenda o backup JSON. A substituição de projetos mantém sua política de proteção contra perda de dados, e o **JSON v4 permanece inalterado**.

O cache do PWA foi atualizado para `uiux-0.9.0-v1` para que os navegadores recebam os dois scripts corrigidos. A edição portátil 0.9.0 mantém a origem fixa `http://127.0.0.1:8765/` para acesso contínuo à biblioteca no mesmo computador/navegador.

Para reproduzir a QA: `node tests/uiux-090-storage-fallback.mjs` e `python qa/uiux090-browser.py` (Chromium com IndexedDB simulado). Testes de browser reais no GitHub Pages, Firefox e WebKit, além da persistência nativa do IndexedDB e PWA instalado, **ainda são pendências da homologação 1.0.0**. Ver `qa/RELATORIO-UIUX-0.9.0.md`.


## UIUX-0.9.1.1 — Home sem rolagem nas dimensões usuais

A interface inicial passou a se adaptar à altura da janela. No celular, as quatro ações usam grade 2 × 2, com acesso à biblioteca sempre visível e ilustração decorativa omitida em tela compacta. Estados com rascunho e cópia recuperável são condensados sem retirar seus botões. A rolagem permanece disponível se o tamanho da fonte aumentar ou houver avisos extraordinários.

## UIUX-0.9.1.2 — Identidade isolada do PWA no desktop

Manifesto com `id: /mapaderiscoslaboratorio/`, marca MRL específica, `start_url` e `scope` restritos à aplicação; cache offline versionado. O servidor portátil agora serve a aplicação em `http://127.0.0.1:8765/mapaderiscoslaboratorio/`, sem expor o PWA na raiz do servidor. A porta 8765 e a origem dos projetos existentes foram preservadas; não limpar dados do site. A instalação com o identificador antigo `./` pode continuar listada no sistema e deve ser removida apenas após backup, sem exclusão dos dados do navegador. A instalação real em Edge/Chrome no computador do usuário ainda requer verificação.

## UIUX-0.9.2 — Biblioteca gráfica: etapa 1 (Parede e Porta)

O editor apresenta paredes com hachura ortogonal discreta e portas com folha, dobradiça e arco de abertura. O mesmo desenho técnico é gerado no Canvas e na exportação SVG pelo módulo local `js/architectural-glyphs.js`. Os arcos de portas externas recebem margem no arquivo SVG para que não sejam cortados. As miniaturas Parede e Porta no painel Estrutura acompanham a nova representação.

Esta etapa altera **somente o desenho dos tipos `wall` e `door`**: dimensões físicas, posição, rotação, seleção, snap, colisões, undo/redo, formato JSON v4, IndexedDB e autosave permanecem compatíveis. O manifesto PWA continua identificado por `/mapaderiscoslaboratorio/`; o novo módulo entrou no cache versionado. Outras peças ainda aguardam integração.

QA: `node tests/uiux-092-architecture.mjs`; ver `qa/RELATORIO-UIUX-0.9.2-ETAPA-1.md`. Firefox/WebKit, GitHub Pages e instalação PWA real permanecem pendentes de homologação externa.


## UIUX-0.9.2 — Etapa 2: seis elementos laboratoriais

Novos desenhos de bancada, bancada L, pia, capela, extintor e risco químico, com plano vetorial compartilhado entre Canvas e SVG exportado e miniaturas correspondentes. Preservados JSON v4, geometria, seleção, PWA e IndexedDB. Detalhes em `qa/RELATORIO-UIUX-0.9.2-ETAPA-2.md`.
