# UIUX-0.9.0 — Estabilização pré-1.0.0

**Projeto:** Mapa de Riscos do Laboratório  
**Base:** commit `073536745942f6f8da989e06547257777eb8c3e9` (UIUX-0.8.4)  
**Natureza:** correção de confiabilidade, sem funcionalidades novas.

## 1. Defeito confirmado e correção

O autosave em `js/mapa.js` só emitia o evento para a biblioteca IndexedDB quando a gravação de `localStorage` tinha sucesso. Isso impedia aproveitar o IndexedDB, mesmo quando disponível, após um erro de quota ou bloqueio do armazenamento principal. A ação **Revisão** também retornava sem gravar se `runtime.persist()` falhasse.

Agora **ambos os caminhos tentam salvar no IndexedDB independentemente da falha em `localStorage`**. O evento inclui `localSaved` para registrar explicitamente o sucesso ou a falha local. O snapshot é capturado uma única vez para os dois destinos. A revisão é confirmada ao usuário somente após a transação do IndexedDB terminar. A falha do autosave principal permanece visível e a exportação JSON segue recomendada.

**Limite:** a substituição por outro projeto mantém o mecanismo conservador que protege o rascunho anterior e recusa a substituição quando não consegue preservar o backup; esta rodada não altera esse contrato.

## 2. PWA e edição portátil

- Novo nome de cache: `mapa-riscos-shell-uiux-0.9.0-v1` (versão anterior pode permanecer ativa até a confirmação do usuário e instalação completa).
- Novo ZIP portátil com os mesmos recursos essenciais, hashes SHA-256 e servidor local restrito a `127.0.0.1`.
- O armazenamento é específico da origem; importar/exportar JSON continua obrigatório ao transferir entre GitHub Pages e edição portátil.
- Nenhuma limpeza de cache, IndexedDB ou `localStorage` foi introduzida.

## 3. Testes executados

- **15/15 suítes Node do frontend**, incluindo novo teste de queda do `localStorage` com persistência alternativa; **testes de autenticação/GAS legados não se aplicam ao frontend atual**.
- **21/21 verificações de fallback no Chromium** em 1440, 390 e 320 px, com IndexedDB simulado: gravação direta, revisão, timer e comunicação de erro.
- **122/122** verificações da interface/identidade e **36/36** da biblioteca (Chromium isolado, IndexedDB simulado).
- Regressão histórica Chromium: **49/49** proteção de projetos, **77/77** cotas, **167/167** modais, **245/245** responsividade, **86/86** acessibilidade.
- A suíte visual UIUX-0.7.0 antiga não concluiu dentro do limite deste ambiente; **inconclusiva**, não incluída na aprovação.
- Distribuição portátil verificada por checksum e arquivos HTTP locais (valores detalhados registrados no log da rodada).

**Ambiente e ressalvas:** Chromium real com scripts carregados em documento isolado e APIs de armazenamento simuladas devido ao bloqueio administrativo de navegação para HTTP e `file://`. A execução de IndexedDB nativo entre reinicializações, instalação PWA real, GitHub Pages, Firefox e WebKit **não foram homologadas**. Não declarar a versão 1.0.0 sem esses ensaios.

## 4. Critérios de rollback

O commit anterior (`073536745942f6f8da989e06547257777eb8c3e9`) é a referência estável. Em caso de problema, reverter somente os scripts alterados e a documentação; **não apagar caches, IndexedDB, arquivos JSON nem dados do navegador**. Antes de testar migrações ou limpar armazenamento, exportar todos os mapas relevantes.

## 5. Próxima rodada

UIUX-0.9.1 deve concentrar-se exclusivamente em defeitos comprovados durante verificação real do GitHub Pages ou testes cruzados de navegador, sem acrescentar funcionalidades.
