# Relatório técnico — UIUX-0.8.3: Biblioteca local de projetos

**Base de referência:** commit `e710d8bdb20593a0b60ebaf18f185bd183a36ca1` — UIUX-0.8.2.

## Implementações

- Banco IndexedDB `mapa-riscos-library` v1, com três object stores: `projects`, `revisions` e `meta`.
- Migração idempotente dos autosaves legados, sob transação; preserva `mapa_riscos_autosave` e `mapa_riscos_previous_autosave` mesmo após importá-los.
- Cada novo mapa é armazenado em registro independente. Gravações assíncronas são enfileiradas por snapshot capturado antes do próximo projeto.
- Biblioteca acessível na Home, com listagem, abertura, renomeação em formulário, histórico de 10 revisões, recuperação e exclusão confirmada. A ação de guardar revisão fica disponível no editor.
- Formato JSON v4 de exportação não foi alterado, e o programa permanece sem login, sem servidores de dados e sem bibliotecas externas de runtime.
- Service worker atualizado para `uiux-0.8.3-v1`, com precache de `js/project-library.js` e `js/library-ui.js`. Em falha de atualização, mantém o cache anterior.
- Em falhas ou quotas do IndexedDB, o projeto atual segue no rascunho local; mensagens orientam exportar JSON. Avisos repetidos são suprimidos.

## Validações executadas

- **13/13 suítes Node** do frontend aprovadas, inclusive a suíte nova do IndexedDB com simulação fiel de transactions, store, cursor, index e migração, sem acionar backend antigo.
- **36/36 verificações Chromium** da biblioteca e suas interações, nos tamanhos 1440, 390 e 320 px, usando HTML/CSS/JS reais com IndexedDB e localStorage simulados devido ao bloqueio de origem do ambiente.
- **122/122 verificações Chromium** da UIUX-0.8.1 de Home/editor, em sete resoluções, sem exceções JS nos cenários testados.
- PWA: teste de cache, exclusão de caches antigos, rollback em falta de recurso e não interceptação de JSON/POST continua aprovado.

## Limites da homologação

**Não se declara homologação de persistência real entre reinicializações do navegador nem em Firefox/WebKit:** as políticas deste ambiente bloqueiam `localhost`, `file://` e endereços de ensaio. O teste IndexedDB foi simulado e deve ser repetido no GitHub Pages em contexto de origem seguro. Também não houve inspeção direta do site hospedado após a publicação.

## Teste manual pós-publicação (exigido antes da homologação definitiva)

1. Abrir o site online, criar mapa A, alterar dimensões, guardar revisão e voltar à Home.
2. Criar mapa B, editar outro valor e recarregar a aba. Conferir A e B na biblioteca.
3. Abrir A, recuperar uma revisão anterior, confirmar que B permanece intacto.
4. Limpar apenas o cache de arquivos do service worker; verificar que dados IndexedDB continuam. Não limpar os dados do site.
5. Desconectar a internet e recarregar o PWA já instalado; verificar biblioteca, editor e backup JSON.
6. Repetir em Firefox e Safari/WebKit onde disponíveis.

## Rollback

Reverter somente o commit UIUX-0.8.3 caso ocorram falhas. Não remover o IndexedDB nem limpar `localStorage`; o JSON v4 é compatível com a UIUX-0.8.2 anterior.
