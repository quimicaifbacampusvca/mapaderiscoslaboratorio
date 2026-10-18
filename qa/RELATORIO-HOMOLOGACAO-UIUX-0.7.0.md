# UIUX-0.7.0 — Homologação integrada e congelamento condicional

**Programa:** Mapa de Riscos do Laboratório  
**Data:** 18/10/2026  
**Base auditada:** GitHub `main` — `b9153524e914b022ffc5b5bde9182b178416e7ad` (UIUX-0.6.0).  
**Natureza:** verificação integrada, correção de regressão e documentação; **sem funcionalidades novas**.

## 1. Verificação de origem

Os arquivos locais `README.md`, `index.html`, `css/mapa.css`, `js/mapa.js`, `js/metric-ruler.js`, `qa/uiux060-browser.py` e `qa/RELATORIO-UIUX-0.6.0.md` foram comparados por SHA de blob Git com os arquivos do repositório. Todos correspondiam ao commit-base antes da alteração.

## 2. Defeito corrigido

**UIUX-070-001 — Card Novo Projeto instável em 320 px, severidade alta (P1).**

**Reprodução:** iniciar um projeto, modificar o nome, aguardar o autosave, voltar à Home, clicar em Novo Projeto, cancelar a confirmação e tentar clicar novamente. No Chromium, o botão pode ficar em deslocamento contínuo de posição causado pela transformação CSS no hover/foco, e o clique automático termina por instabilidade do elemento.

**Correção:** em telas de até 540 px, remover somente o `transform` do hover/foco de `.home-card`, preservando borda, fundo, sombra e foco visível. Nenhuma outra tela, dado ou componente foi reestruturado.

**Reteste:** `qa/uiux020-browser.py` passou de 42/43 no primeiro ensaio (falha 320 px) para **49/49** depois da correção. A bateria `qa/uiux070-browser.py` confirmou o mesmo fluxo em 320, 360, 390, 414, 768, 1024 e 1440 px.

## 3. Matriz de regressão

| Conjunto | Resultado | Motor/ambiente |
|---|---:|---|
| Node frontend: core, integridade, sem login, bindings, UIUX-0.2 a 0.7 | **10/10 suítes aprovadas** | Node 22 |
| UIUX-0.2.0: Novo Projeto, confirmação, backup, JSON, restauração | **49/49** | Chromium / Playwright isolado |
| UIUX-0.2.0 extras: modelos e continuação após reload | **aprovados** | Chromium / Playwright isolado |
| UIUX-0.3.0: cotas, 1 m a 1 cm, invariância geométrica, zoom, JSON/SVG | **77/77** | Chromium / Playwright isolado |
| UIUX-0.4.0: modais, foco, confirmação segura | **167/167** | Chromium / Playwright isolado |
| UIUX-0.5.0: painéis e responsividade | **245/245** | Chromium / Playwright isolado |
| UIUX-0.6.0: teclado, foco, notificações e aviso removido | **86/86** | Chromium / Playwright isolado |
| UIUX-0.7.0: integração, regressão 320 px, medidas, JSON, teclado | **103/103** | Chromium / Playwright isolado |
| Firefox | **não executado** | binário Playwright ausente; instalações anteriores bloquearam downloads |
| WebKit/Safari | **não executado** | binário Playwright ausente; instalações anteriores bloquearam downloads |
| Navegação HTTP em servidor local | **bloqueada pelo ambiente** | `net::ERR_BLOCKED_BY_ADMINISTRATOR`, embora HTTP responda 200 |
| GitHub Pages em navegador | **não verificado** | mesma política de bloqueio de navegação; ausência de aprovação de publicação hospedada |

A soma de verificações dos seis roteiros Chromium aprovados é **727/727** (49+77+167+245+86+103). As contagens são verificações automatizadas, **não** equivalem a 727 testes independentes ou cobertura completa de requisitos.

## 4. Escopo preservado

- Sem login: não restaurar formulários nem o aviso removido na UIUX-0.6.0.
- Geometria e Canvas 2D: sem alterações.
- Medidas reais: 1 m inicial, graduação detalhada de 1 cm a zoom compatível.
- JSON de projeto e legado, exportação SVG, autosave e restauração: sem alterações de esquema.
- Backend GAS, Google Sheets e Google Drive: não acessados ou modificados.
- Identidade e estrutura de navegação: mantidas, sem antecipar a UIUX-0.8.x.

## 5. Limitações e falhas residuais

1. **Homologação entre navegadores pendente:** Firefox e WebKit/Safari devem executar a mesma matriz, com evidências.
2. **Homologação HTTP/publicada pendente:** testar GitHub Pages real, carregamento de recursos, cache, storage e downloads sob HTTPS.
3. **Suíte antiga de autenticação/GAS:** alguns testes referenciam `gas/Code.gs`, não presente na branch sem login. Esses testes legados não fazem parte da aprovação do frontend atual; precisam ser arquivados ou ajustados futuramente.
4. **Acessibilidade do Canvas:** não há certificação de desenho completo por leitor de tela; assunto exige uma avaliação especializada fora desta série.
5. **PWA e uso offline:** reservados para UIUX-0.8.x; não implementados nesta etapa.

## 6. Portões de homologação

- **Aprovados dentro do escopo executável:** compilação/sintaxe dos testes, fluxos críticos, compatibilidade local de JSON, medidas, modal/teclado, responsividade Chromium e ausência de regressão detectada.
- **Pendentes:** compatibilidade Firefox, WebKit/Safari, HTTP real e GitHub Pages.

**Decisão técnica:** **homologação local condicional**, não homologação multiplataforma definitiva. Manter a referência da UIUX-0.7.0 estável e não anunciar conclusão multiplataforma até os portões externos serem executados.

## 7. Publicação e rollback

**Commit-base para rollback:** `b9153524e914b022ffc5b5bde9182b178416e7ad`.  
**Branch:** `main`.  
**Alteração funcional prevista:** apenas `css/mapa.css`, além de documentação e testes QA.

Para reverter, restaurar o commit-base usando novo commit de reversão, **sem `git reset --hard` ou force-push** em branch compartilhada. Antes de reverter, salvar qualquer trabalho não exportado e verificar se surgiram commits posteriores. A alteração não afeta arquivos JSON, logo rollback do frontend não exige migração de dados.