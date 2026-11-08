# C01/E04 — Revisão das regras de segurança e das fontes normativas

**Data de referência:** 08/11/2026  
**Projeto:** Mapa de Riscos do Laboratório  
**Situação:** auditoria normativa inicial concluída; interpretação técnica/avaliação presencial ainda pendentes.  
**Dependência:** `fix/c01-e03-inventario-restricoes` (PR #3 ainda em rascunho).  
**Diretriz:** não converter um alerta visual/geométrico em atestado de conformidade. Não modificar JSON v4 nem acrescentar limites legais sem fonte e contexto de aplicação.

## 1. Resultado principal

O sistema combina três famílias de informação que **não podem ser confundidas**:

1. **Normas oficiais:** exigências legais que dependem de atividade, ocupação, instalações e do responsável pela análise. O simulador pode remeter a uma fonte primária, mas não faz inspeção ou certificação.
2. **Alertas geométricos parciais:** detectam uma sobreposição num desenho 2D e ajudam a localizar objetos potencialmente obstrutivos, sem verificar rotas completas, largura útil real, portas, ocupação, desempenho ou manutenção.
3. **Indicadores de preenchimento didático:** presença de símbolos/objetos e critérios internos de prática. Não correspondem ao atendimento cumulativo da legislação.

**Decisão de nomenclatura:** sempre exibir `Revisão didática`, `indicadores didáticos` ou `10/10 itens representados`; não exibir uma conclusão genérica de `conformidade`, `segurança certificada` ou `laudo aprovado`.

## 2. Matriz de referências primárias consultadas

| Fonte | Trecho/contexto fundamentado | Aplicação permitida ao MRL | Limitação |
|---|---|---|---|
| NR-23, redação da Portaria MTP nº 2.769/2022 | Item **23.3.4.1**: aberturas, saídas e vias de passagem devem permanecer desobstruídas | Mostrar alerta de **interseção geométrica** entre objeto sólido e uma representação de passagem/saída | Não afirmar que o mapa sozinho prova desobstrução física, largura suficiente ou quantidade legal de saídas |
| NR-23, itens **23.3.1, 23.3.3 e 23.3.4** | Prevenção segue legislação estadual/normas aplicáveis; prevê saídas suficientes e sinalizadas | Associar checagem de saídas à necessidade de análise contextual do estabelecimento e do CBMBA | Quantidade, dimensionamento, sinalização real e evacuação **não são calculados** pelo presente motor |
| NR-5, **5.3.1(b)** | A CIPA registra percepção dos riscos por mapa **ou outra técnica/ferramenta apropriada**, sem ordem de preferência | Posicionar o MRL como auxílio à identificação e ao registro da percepção de riscos | Não alegar que uma determinada representação gráfica é o único formato legalmente exigido |
| NR-1, GRO/PGR | Identificação/avaliação e gestão de riscos ocupacionais é processo contínuo | Preparar futura integração com inventários e ações preventivas, mantendo rastreabilidade | O MRL não substitui PGR, inventário oficial, plano de ação nem avaliação por profissional competente |
| NR-26 | Cores, segurança, classificação e rotulagem dos produtos químicos em consonância com normas técnicas e SGH/GHS | Usar ícones e informação didática, distinguindo símbolo do mapa de sinalização real/rotulagem química | Uma bolinha/ícone de `chemical` **não verifica** classificação GHS, rotulagem, FDS nem controles adequados |
| CBMBA — portal de instruções técnicas | **IT 11/2016** saídas de emergência; **IT 20/2017** sinalização; **IT 21/2017** extintores; **IT 14/2026** carga de incêndio | Manter a fonte estadual como referência para projeto e vistoria conforme ocupação | Nenhum limite dimensional estadual deve ser codificado antes de verificar item, versão, ocupação e aplicabilidade; IT 14 listada com versão 2026 |

### URLs oficiais verificadas

- NR-23 (PDF oficial): https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/nr-23-atualizada-2022.pdf
- NR-5 (texto publicado no portal MTE): https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/nr-05-atualizada-2022.pdf
- NR-1 (portal de versões vigentes): https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-1
- NR-26 (portal de versões vigentes): https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/norma-regulamentadora-no-26-nr-26
- CBMBA — instruções técnicas e legislação: https://www.ba.gov.br/bombeiros/node/4005 (página atualizada em 26/10/2026).

## 3. Auditoria do motor atual

Arquivos inspecionados: `js/validation.js`, `js/geometry.js`, `js/mapa.js` e `index.html`.

### 3.1 Geometria e obstruções

| Regra no código | Estado | Classificação | Observação |
|---|---|---|---|
| `calculateDoorBlockRatio` + interseção com sólido | Implementada | Alerta geométrico apoiado por obrigação de desobstrução | O item 23.3.4.1 da NR-23 sustenta o **dever de desobstrução**, não certifica este algoritmo |
| Envelope de `1,2 m` ao redor de saída | Implementado | **Hipótese didática** | Sem equivalência normativa universal. Não converter em medição legal sem configuração do cenário |
| Sobreposição com circulação quando `ratio > 0.4` | Implementada | **Heurística interna** | A tolerância de 40% não é disposição da NR-23; serve apenas para sinalizar sobreposição |
| Objetos ocultos continuam na verificação | Corrigida em C01/E03 | Comportamento conservador do inventário | Ocultar camada gráfica não elimina obstáculo real |
| Interseção poligonal de bancada L e rotação | Corrigida em C01/E03 | Geometria didática melhorada | Não substitui medições presenciais e caracterização física do mobiliário |
| Bloqueio de objeto na interface (`locked`) | Implementado | Restrição de edição | Não corresponde a verificar se uma porta real está trancada |

### 3.2 Dez indicadores de preenchimento

| ID no sistema | O que **de fato** verifica | O que **não pode concluir** |
|---|---|---|
| `check-dim` | Planta tem dimensões declaradas >= 3×3 m | Área mínima legal, lotação ou conformidade da edificação |
| `check-exit` | Há saída/porta representada e sem problemas detectados no modelo atual | Saídas suficientes para lotação; rotas, sinalização ou desobstrução reais |
| `check-safety` | Há símbolo de chuveiro ou lava-olhos | Necessidade/adequação, localização, fluxo, funcionamento ou manutenção |
| `check-fire` | Há símbolo de extintor | Classe, agente extintor, número mínimo, localização e capacidade corretos |
| `check-electrical` | Risco elétrico foi assinalado | Inspeção e segurança da instalação elétrica |
| `check-chemical-bio` | Risco químico ou biológico foi assinalado | Avaliação, classificação e controle de todas as exposições |
| `check-ventilation` | Há símbolo de janela ou capela | Renovação de ar, taxa de exaustão ou eficiência da capela |
| `check-ergonomic` | Há bancada, bancada L ou pia | Ergonomia do posto e condições de trabalho |
| `check-signaling` | Há circulação desenhada e algum risco cadastrado | Sinalização de emergência, rotas e símbolos oficiais conforme IT 20 |
| `check-epi` | Campo de texto de EPI foi preenchido para um risco | EPI correto, CA válido, treinamento ou efetiva utilização |

**Conclusão:** `10/10` é **completude de um roteiro didático**, nunca aprovação normativa, e a mensagem deve deixar isso inequívoco. O botão de conclusão depende desses critérios didáticos; nenhuma alteração de motor foi autorizada por esta auditoria.

## 4. Achados e alterações aplicadas

**E04-01 — Mensagem ambígua:** o painel já dizia que não certifica conformidade, mas o stepper exibia `Revise os critérios de conformidade para concluir`. Corrigido para **`Revise os indicadores didáticos de preenchimento para concluir.`**

**E04-02 — Comentários de engenharia:** documentação interna descrevia `checks normativos` e relatório `de conformidade`. Corrigida a terminologia técnica no `js/mapa.js`, sem alterar identificadores persistidos, algoritmo de escore, APIs e JSON.

**E04-03 — Política de fontes:** manter rastreabilidade por norma/versão/item e separação entre normas federais, regulamentos estaduais e guias técnicos. As fontes são vinculadas ao presente contrato e permanecem sujeitas à atualização e à análise de aplicabilidade.

**E04-04 — Segurança científica:** a escala, o desenho da porta, o estado de camada e a presença de símbolos **não substituem** um levantamento físico ou validação de segurança por responsável técnico.

## 5. Próximas tarefas, sem antecipar a decisão de projeto

- **P1:** Planejar modelo declarativo e versionado das regras (ex.: `id`, `natureza: legal|geométrica|didática`, `fonte`, `versão`, `item`, `aplicabilidade`, `critério`, `limites`, `mensagem`, `evidência`). **Não começar a aprovar instalações automaticamente.**
- **P1:** Revisar rótulos restantes e retirar qualquer interpretação de `10/10` como segurança verificada.
- **P1:** Avaliar a documentação completa da IT 11/2016 e IT 20/2017 do CBMBA, com delimitação por tipo de ocupação, condição de porta, população e percurso.
- **P2:** Propor parametrização opcional de exigências *quando houver base verificável* e revisão específica por responsável técnico.
- **P2:** Futuros campos para evidências de vistoria, data, responsável, fonte/versão e resultado `não verificado` / `requer vistoria`. Diferenciar presença no desenho e verificação real.
- **P2:** Testes de regresão da linguagem pública, integridade JSON v4, geometria rotacionada e regras documentadas.

## 6. Critérios de aceite deste encontro

1. Contrato de origem e aplicabilidade documentado, sem inventar regras.
2. Os dez indicadores reconhecidos como **didáticos**, com limitações explícitas.
3. Removida a expressão enganosa `critérios de conformidade` da mensagem apresentada ao usuário.
4. Alertas de saídas continuam relevantes sem atribuir à NR-23 valores heurísticos (1,2 m, 40% ou 80%).
5. Testes automatizados de regressão no branch, preservando os testes C01/E03.
6. **Sem merge** no `main` ou no PR #3 antes da homologação expressa.
