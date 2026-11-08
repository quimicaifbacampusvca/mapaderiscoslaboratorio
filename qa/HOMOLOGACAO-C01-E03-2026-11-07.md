# Homologação automatizada do Mapa de Riscos — C01/E03

**Data:** 7 de novembro de 2026  
**Projeto:** Mapa de Riscos do Laboratório  
**Branch:** \`fix/c01-e03-inventario-restricoes\`  
**Pull Request:** [#3](https://github.com/quimicaifbacampusvca/mapaderiscoslaboratorio/pull/3)  
**Commit funcional homologado:** \`b57c24a4f59367d3bf89babd51b7cf7f00f35ddf\`  
**Situação:** **testes automatizados aprovados**; homologação manual/H01–H10 integral ainda pendente. Sem merge para \`main\`.

## Método e ambiente

As aplicações foram executadas por servidor HTTP local no runner **Ubuntu do GitHub Actions**, com **Playwright 1.65.0** e navegadores **Chromium, Firefox e WebKit**, cada um em contexto temporário e isolado. Nenhum arquivo JSON, IndexedDB ou LocalStorage de usuários reais foi acessado.

- Desktop: **1440 × 900**.
- Mobile responsivo: **320 × 568** e **390 × 844** pixels. São viewports em navegador automatizado, **não** dispositivos físicos.
- Artefatos de inspeção: screenshots do relatório desktop e dos painéis móveis por navegador.
- O teste de carregamento offline por Service Worker foi executado especificamente no Chromium.
- Ferramentas de execução: \`tests/c01-e03-browser-smoke.mjs\` e \`.github/workflows/c01-e03-browser.yml\`.

**Execução de referência aprovada:** [GitHub Actions #42405039516](https://github.com/quimicaifbacampusvca/mapaderiscoslaboratorio/actions/runs/42405039516)

## Resultados verificáveis

| Navegador | Testes funcionais E2E concluídos | Resultado |
|---|---:|---|
| Chromium | 11 fluxos | Aprovado |
| Firefox | 10 fluxos | Aprovado |
| WebKit | 10 fluxos | Aprovado |
| **Total** | **31 verificações de fluxo** | **Aprovadas** |

Em paralelo, a suíte Node de sintaxe, contratos e regressões foi aprovada (**26 arquivos de teste**, incluindo o contrato específico C01/E03) em GitHub Actions.

### Fluxos cobertos na interface real

1. Abertura da Home, início de projeto e Canvas desktop.
2. Bloqueio de edição, tentativa de excluir/duplicar/rotacionar bloqueados, desbloqueio, duplicação, desfazer e refazer.
3. Ocultação de risco sem retirá-lo do inventário e do resumo.
4. Biblioteca real IndexedDB: armazenamento de revisão e recuperação dos dados armazenados.
5. Download de JSON com esquema \`version:4\`, checagem de objetos e flags.
6. Autosave no \`localStorage\` e recuperação do projeto após \`reload\`.
7. Verificação de saída obstruída e distinção visual entre indicador didático e laudo normativo.
8. Importação de JSON por seletor de arquivos: **Cancelar preserva dados**; **Confirmar restaura projeto**.
9. Chromium: Service Worker controla a página e a Home é recarregável sem rede.
10. Painéis móveis, paleta, abas Camadas/Propriedades/Relatório, fechamento por Escape, contador de camadas e ausência de overflow horizontal nas viewports de 320/390 pixels.
11. Capturas de tela das áreas verificadas.

### Evidências visuais no GitHub Actions

Abrir a [execução #42405039516](https://github.com/quimicaifbacampusvca/mapaderiscoslaboratorio/actions/runs/42405039516) e localizar, em **Artifacts**, os seguintes ZIPs (retenção configurada para 14 dias):

- \`navegador-chromium-evidencias\`
- \`navegador-firefox-evidencias\`
- \`navegador-webkit-evidencias\`

Cada pacote contém imagens do relatório desktop e dos painéis móveis de 320/390 pixels, sem dados pessoais.

## Incidentes encontrados e resolvidos

A primeira execução do teste móvel tentava ler \`innerText\` do contador de camadas com a aba Camadas oculta. Isso retornava string vazia e reprovava o *roteiro*, não o sistema. A suíte foi corrigida para ativar a aba antes da leitura e passou nos três navegadores.

Além desse ajuste nos testes, o escopo C01/E03 corrigiu os defeitos auditados: obstáculos ocultos, semântica de bloqueio, contagem de conformidade, falso positivo de colisão na bancada L e preservação da edição de conexões de portas bloqueadas. As correções foram cobertas por regressões e fluxos em browser.

## Limitações e pendências antes do merge

Esta execução **não** é uma certificação WCAG, NR-23 ou de segurança física e **não** conclui todos os cenários H01–H10 do roteiro de homologação mais amplo.

Ainda deverão ser verificados:

- Homologação **manual** das capturas e do layout em dispositivos Android/iOS reais, Safari no macOS/iOS, Firefox e leitores de tela.
- H01–H10 em suas combinações completas de temas, fonte até 200%, alto contraste, filtros de cor e diferentes condições de persistência.
- Testes sobre **cópias de projetos reais do usuário**, após backup JSON, especialmente projetos com muitas áreas e objetos.
- Funcionamento PWA instalado e recuperação offline nos dispositivos reais.
- Revisão de sinalização didática x norma aplicável à instalação real pelo responsável técnico.
- Correspondência entre ordem na árvore de camadas e ordem visual do Canvas; reordenação deliberada permanece fora do escopo deste PR.

**Critério de encaminhamento:** o PR #3 permanece em rascunho e o \`main\` deve permanecer inalterado até a revisão das evidências visuais, homologação manual pertinente e aprovação expressa da integração.

## Continuação — 8 de novembro de 2026: cenário H08 automatizado

Após a retomada do desenvolvimento, foi adicionada a suíte `tests/c01-e03-a11y-browser.mjs` e integrada ao workflow `.github/workflows/c01-e03-browser.yml`.

**Execução de referência:** [GitHub Actions #42445785268](https://github.com/quimicaifbacampusvca/mapaderiscoslaboratorio/actions/runs/42445785268), commit `dd882f500a39a7ad715d9e89a6d1c3ba21a90a23`, conclusão **success**.

| Navegador | 390 × 844 | 1440 × 900 |
|---|---|---|
| Chromium | H08 automatizado aprovado | H08 automatizado aprovado |
| Firefox | H08 automatizado aprovado | H08 automatizado aprovado |
| WebKit | H08 automatizado aprovado | H08 automatizado aprovado |

A suíte verifica operações reais na interface: modo claro/escuro, alto contraste, leitura simples, espaçamento, movimento reduzido, filtro de visão de cores, mudança de fonte entre 100%, 200% e 150%, persistência após reload, Escape e restituição do foco. Compara o estado de dados do editor antes e depois dos ajustes e rejeita rolagem horizontal global acima da tolerância estabelecida. Capturas são publicadas nos artefatos do Actions.

**Ressalva:** esta é a **cobertura automatizada parcial do H08**, não uma aprovação integral do H08 em todas as combinações da matriz. Permanecem pendentes a conferência perceptiva, tecnologias assistivas, dispositivos físicos, outros tamanhos de viewport, análise de contraste pixel a pixel e as combinações completas de H01–H10. O teste não pode atestar certificação WCAG ou segurança normativa.

O PR #3 continua em rascunho; sem integração ao `main`.
