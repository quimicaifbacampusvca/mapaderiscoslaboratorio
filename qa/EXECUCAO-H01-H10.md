# Rodada 1 — homologação de navegador real (H01–H10)

## Escopo e integridade

- Alvo: Mapa de Riscos do Laboratório, série UIUX-0.9.3.3.1, sem alteração funcional.
- Referência: qa/HOMOLOGACAO-REAL-UIUX-0.9.3.3.md.
- Os testes usam contextos efêmeros por cenário. Nunca utilizar o perfil habitual do usuário, nem limpar IndexedDB/localStorage do seu navegador.
- Os dados semeados possuem nomes e IDs QA; não representam projetos verdadeiros.
- **Resultados de CI não representam por si só homologação WCAG, leitor de tela ou PWA instalado.**

## Execução automática

O workflow .github/workflows/homologacao-real.yml roda nos pull requests e pushes para main que alterem os arquivos relevantes.

1. Instala Node e Playwright com Chromium, Firefox e WebKit.
2. Serve os arquivos da revisão com HTTP local na porta 4173.
3. Executa: npx playwright test --config=tests/playwright.homologacao.config.mjs.
4. Preserva como artefatos JUnit, relatório HTML, capturas, traces e vídeos de falhas por 30 dias.
5. Reprova o job caso um teste falhe. Uma falha não pode ser renomeada como aprovação.

Para executar explicitamente **contra o GitHub Pages hospedado**, após publicar os arquivos desejados, abra GitHub → Actions → “Homologação real MRL (H01-H10)” → Run workflow → destino=publicado. O alvo alternativo é local, sobre um checkout da revisão.

## Níveis de evidência

- Automático (H01–H10): clique, foco, acesso aos diálogos, validação de dados, exibição de indicadores e parte do contraste.
- Amostragem (M01): abertura das configurações em cinco dimensões; não substitui verificação detalhada de responsividade de cada fluxo.
- Manual assistido: foco via Tab/Shift+Tab, NVDA no Firefox/Edge, VoiceOver no Safari, filtros de visão de cores e ampliação.
- PWA: instalar no dispositivo, comparar ícone e identidade, atualizar com cache anterior, recarregar offline e verificar o JSON exportado.
- Geometria: comparar arquivos JSON v4 e coordenadas antes/depois de alterações visuais.

## Registro por ocorrência

ID | commit SHA | URL efetiva | browser/versão | SO | viewport | tema | contraste | leitura | zoom de texto | filtro | resultado esperado | observado | evidência | prioridade | status de reteste

Critérios: P0 e P1 bloqueiam homologação, assim como violações das condições obrigatórias de aceitação. P2/P3 devem ser registradas e avaliadas pelo impacto real, nunca omitidas.

## Gate 1.0.0

Exigir aprovação automática reprodutível nos três motores, avaliação humana de acessibilidade, verificação da versão publicada, integridade do editor, dados e PWA e registro de eventuais limitações. O merge de um PR de testes **não** declara a acessibilidade aprovada.
