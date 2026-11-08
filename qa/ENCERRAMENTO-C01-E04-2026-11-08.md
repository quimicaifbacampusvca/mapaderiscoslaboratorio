# C01/E04 — Relatório de encerramento técnico do encontro

**Data:** 08/11/2026  
**Escopo:** revisão das regras de segurança e das fontes normativas aplicáveis ao Mapa de Riscos do Laboratório.  
**Natureza do aceite:** **documental e de regressão do código**, não aceite da segurança física, conformidade jurídica da edificação ou certificação técnica.  
**PR de trabalho:** [#6](https://github.com/quimicaifbacampusvca/mapaderiscoslaboratorio/pull/6) — `audit/c01-e04-regras-fontes-normativas`, baseado no PR [#3](https://github.com/quimicaifbacampusvca/mapaderiscoslaboratorio/pull/3). Ambos permanecem **em rascunho**, não integrados ao `main`.

## 1. Critérios de aceite — verificação deste encontro

| Critério | Resultado documental | Evidência |
| --- | --- | --- |
| A01. Separar normas oficiais, heurísticas geométricas e indicadores didáticos | **Atendido** | `qa/CONTRATO-C01-E04-REGRAS-NORMAS.md`, seções 1, 3 e 4 |
| A02. Inventariar os dez indicadores sem confundir representação e adequação física | **Atendido** | Tabela completa dos dez critérios `check-*` no contrato C01/E04 |
| A03. Identificar itens e versões da NR-23 e instruções estaduais relevantes | **Atendido para o recorte de pesquisa**, sujeito a revisão de aplicabilidade | `qa/C01-E04-PASSO-04-APLICABILIDADE-CBMBA.md` |
| A04. Examinar a classificação dos laboratórios e situações de produtos perigosos | **Atendido como análise preliminar** | Decreto 16.302/2015 (D-4, E-1 e Tabela 6E); IT 32/2021 e suas condicionantes |
| A05. Corrigir mensagem de interface que ainda sugeria conformidade | **Atendido** | `js/mapa.js`: “Revise os indicadores didáticos de preenchimento...” |
| A06. Preservar JSON v4, geometria e dados; validar contratos C01/E03 e C01/E04 | **Atendido na regressão automatizada** | `tests/c01-e03-inventario-restricoes.mjs`, `tests/c01-e04-normas-didatica.mjs` e GitHub Actions |
| A07. Não introduzir dimensionamentos, isenções ou “aprovação” por mera presença de objeto | **Atendido no escopo do PR** | Revisão do diff do PR #6: documentação, teste, workflow e correção de redação, sem novos cálculos legais |
| A08. Preservar separação dos PRs e `main` até homologação explícita | **Atendido** | PR #6 em rascunho sobre o branch do PR #3; PR #3 em rascunho sobre `main` |

**Conclusão interna:** os objetivos **documentais e de engenharia** do C01/E04 foram alcançados. Os critérios acima não aprovam nenhum laboratório real e não substituem revisão por profissional competente.

## 2. Execuções e incidentes

- **Referência aprovada:** [GitHub Actions #42536552221](https://github.com/quimicaifbacampusvca/mapaderiscoslaboratorio/actions/runs/42536552221), commit `ea7c719d7c14aeb16fc7e124569b955042bf66fe`, conclusão `success`.
- **Execução complementar aprovada:** [#42536547757](https://github.com/quimicaifbacampusvca/mapaderiscoslaboratorio/actions/runs/42536547757), mesmo commit.
- **Falha anterior investigada:** [#42536523386](https://github.com/quimicaifbacampusvca/mapaderiscoslaboratorio/actions/runs/42536523386) falhou por ausência da menção documental ao item `5.2.1.5` da IT 21. A ressalva foi incluída na pesquisa do passo 4; a execução final foi aprovada. Não era uma falha comprovada de funcionamento do simulador.
- A suíte do C01/E04 verifica fontes, itens, linguagem pública e separação das heurísticas. As regressões existentes do C01/E03 também foram executadas.
- **Atenção:** verificações automáticas de texto e testes de lógica não comprovam exatidão jurídica de toda interpretação normativa nem substituem inspeção presencial.

## 3. Pendências não bloqueadoras do encerramento documental, mas bloqueadoras de qualquer parecer de segurança

| Código | Pendência | Condição para tratar |
| --- | --- | --- |
| PN01 | Classificação formal de ocupação e usos reais: laboratório D-4, escola E-1 e eventuais riscos específicos | Projeto do edifício, responsável técnico, características de ocupação, produto e uso |
| PN02 | Dimensionamento de acessos, lotação, portas, percursos e rotas completas | Dados de pavimentos e população, inspeção, versão vigente e itens aplicáveis da IT 11 |
| PN03 | Posicionamento, dimensionamento e desempenho de placas e iluminação de emergência | Levantamento físico e verificação por IT 20 e IT 18 |
| PN04 | Classes, quantidades, capacidades, localização e conservação de extintores | Inventário de equipamentos e avaliação técnica de aplicabilidade da IT 21 |
| PN05 | Produtos perigosos, carga de incêndio e exceções condicionadas | Inventário de substâncias, quantidades, áreas efetivas de armazenamento e estudo IT 14/IT 32 |
| PN06 | Homologação real de acessibilidade e responsividade do editor | Dispositivos físicos, leitor de tela, interações por toque, PWA instalado e avaliação visual |
| PN07 | Decisão sobre motor declarativo e versionado de regras, sem resultado normativo presumido | Nova especificação com fonte, versão, item, parâmetros, aplicabilidade, dados ausentes e evidências |
| PN08 | Aprovação formal e integração dos PRs #3 e #6 | Revisão final pelo responsável, testes aprovados, autorização de merge e ordem de integração |

Nenhuma dessas pendências deve ser marcada como “aprovada” porque o simulador mostra `10/10`. Esse número indica apenas **preenchimento didático**.

## 4. Registro de decisões

- O limiar heurístico de aproximação de saída `1,2 m`, a referência de dimensões `3 × 3 m` e a sobreposição de circulação `40%` **não serão apresentados como mínimos legais**.
- O item `5.2.1.5` da IT 21/2017 e o item `2.4` da IT 32/2021 **não serão generalizados** para toda sala ou laboratório.
- O dado `locked` representa bloqueio de **edição no software**, não se uma porta real está fisicamente trancada.
- A ausência de dados necessários a uma regra futura deverá gerar **não verificado / requer avaliação**, nunca resultado positivo por omissão.
- O PR #6 segue dependente do PR #3; a `main` não será alterada por este encerramento.

## 5. Transição para C01/E05

**Próximo encontro planejado:** C01/E05 — *Planejamento de dados 2D/3D e interfaces de módulo*, em **10/11/2026, das 19h às 20h30 (Bahia, UTC−03)**.

Insumos para a discussão de arquitetura:
1. Separar domínio dos objetos reais, representação 2D, cena 3D e dados de segurança. Não confundir propriedades visuais com medições.
2. Propor contratos de dados versionados com compatibilidade de importação/exportação JSON v4, sem migração destrutiva.
3. Planejar interfaces para camadas, objetos e propriedades; preservar redimensionamento e rotação dos objetos livres.
4. Avaliar como adicionar **metadados de regras normativas** de forma opcional, fora do motor de desenho e sem interpretar ausência de evidência como aprovação.
5. Definir testes de paridade 2D↔3D, preservação dos dados, acessibilidade e responsividade, antes de implementar arquitetura nova.

## 6. Estado final

**C01/E04: encontro concluído quanto à auditoria documental, linguagem e regressões automatizadas.**  
**Homologação normativa e vistoria do laboratório: não realizadas.**  
**PR #6: rascunho, dependente do PR #3.**  
**Integração ao `main`: não realizada.**
