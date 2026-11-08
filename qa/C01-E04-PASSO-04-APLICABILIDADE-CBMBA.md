# C01/E04 — Passo 4: aplicabilidade das instruções técnicas do CBMBA

**Data da consulta:** 8 de novembro de 2026  
**Fonte primária:** [CBMBA — Segurança Contra Incêndio e Pânico](https://www.ba.gov.br/bombeiros/node/4005), atualizada em **26/10/2026**.  
**Estado:** pesquisa normativa documental concluída para o escopo desta rodada; **nenhum laudo, parecer de órgão público ou enquadramento definitivo da edificação**.  
**Regra de projeto:** todo limite extraído de instrução técnica exige identificação de versão, item, cenário de aplicação, dados necessários e validação antes de habilitar avaliação automática.

## 1. Enquadramento da instalação — indispensável antes dos parâmetros

A **Tabela 1 de ocupação do Decreto Estadual 16.302/2015** identifica **D-4** como laboratório (inclui laboratórios químicos e semelhantes) e **E-1** como escola em geral. Uma instituição de ensino pode abrigar espaços laboratoriais; **não se deve inferir automaticamente o enquadramento de todo um edifício pelo nome da sala**, nem aplicar somente D-4 ou somente E-1 sem examinar o projeto e o uso real.

**Achado determinante:** a **Tabela 6E, notas gerais, alínea c**, explicita que locais destinados a laboratórios devem ter proteção em função dos produtos utilizados. A alínea d remete aos riscos específicos de outras ITs. Portanto, o Mapa de Riscos não deve concluir o dimensionamento e a proteção de um laboratório educacional apenas pela presença de símbolos.

**Fonte:** [Decreto Estadual nº 16.302/2015 — PDF oficial](https://www.ba.gov.br/bombeiros/sites/site-cbmba/files/migracao_2024/arquivos/files/2025-09/decreto_estadual_16.302-2015_-_regulamento_de_seguranca_contra_incendio_e_panico.pdf), Tabela 1 (ocupações D-4, E-1) e Tabela 6E (notas gerais c e d).

**Dados necessários antes de criar regras por tipo de edificação:** classificação da ocupação e dos riscos específicos, atividade real por ambiente, pavimentos/altura, áreas construídas e de armazenamento, população estimada/permitida, acesso e saídas da edificação, características de materiais manipulados e documentação disponível do imóvel.

## 2. Matriz de aplicabilidade e possibilidades de automação

| Fonte oficial e item | Regra/contexto confirmado no texto | Dados que o MRL ainda não possui ou não valida | Encaminhamento autorizado |
|---|---|---|---|
| **IT 11/2016**, capa atualizada pela Portaria 067 CG-CBMBA/2019; itens **5.2, 5.3, 5.4 e 5.5** | Saída compreende acesso/corredores, portas e outros componentes; dimensionamento depende de ocupação e população. Item **5.4.2** usa 1,10 m para acessos/saídas em ocupações gerais, com exceções explícitas. | Enquadramento definitivo, população por pavimento, caminho contínuo até local seguro, larguras úteis e componentes reais, portas e sentido de abertura. | Manter **alerta geométrico** para interseção de sólido com a saída desenhada. Não aplicar 1,10 m como limite universal para toda porta do editor e não emitir aprovação de evacuação. |
| **IT 11/2016**, itens **5.5.1.1(b)** e **5.5.1.2** | Os acessos devem permanecer desobstruídos, inclusive de mobiliário e divisórias móveis. | Percurso real na edificação, obstáculos tridimensionais, mobiliário fora do desenho, inspeção in loco. | Priorizar mensagens de *obstrução geométrica observada*; objetos ocultos na camada continuam na análise. |
| **IT 20/2017**, itens **5.2, 5.3, 6.1 e 6.1.3** e anexos A–C | Sinalização de emergência usa símbolos, formas, cores, local de instalação e orientação ao longo da rota. Há condições para sinalização das portas e mudanças de direção. | Tipo de placa, altura/posição física, dimensões, fotoluminescência, campo visual e percurso completo. | Símbolo no Canvas serve para **inventário visual**, não para conferir posicionamento, distância máxima, instalação ou desempenho da sinalização. |
| **IT 21/2017**, itens **5.1.1–5.1.4**, **5.2.1.1–5.2.1.6** | Extintores exigem capacidade, classe de risco e distâncias máximas de caminhamento conforme tabela; devem estar adequadamente instalados, acessíveis e sinalizados. | Classe e capacidade real do extintor, classe de risco da ocupação, número por pavimento, distâncias reais e validade/condição. | `check-fire` apenas registra **presença de símbolo**, nunca adequação do sistema de extintores. |
| **IT 14/2026**, itens **1, 2, 4 e 5** e anexos | Determinação da **carga de incêndio específica** em função de atividade, ocupação ou método apropriado, com classificação de risco. | Inventário de materiais combustíveis, quantidades, ocupação, método escolhido e dados para cálculo. | **Não calcular carga de incêndio** pela cor/intensidade dos riscos desenhados. Manter como estudo futuro dependente de inventário material e documentação. |
| **IT 32/2021**, itens **2.1–2.4** | Produtos perigosos produzidos, manipulados ou armazenados acionam análise de aplicabilidade; item **2.4** prevê dispensa das exigências **desta IT** para edificações com até 750 m² de **armazenagem** conforme condição textual; **não é dispensa geral de segurança**. IT 25/28/29 podem prevalecer para riscos específicos. | Natureza/classificação dos produtos, formas de uso, área **de armazenagem**, atividade, enquadramento nas outras ITs. | Mostrar possibilidade de **revisão específica de produtos perigosos**, sem declarar uma instalação segura ou dispensada somente por área de sala, ícone químico ou 750 m². |
| **IT 42/2024**, itens **1 e 2** e anexos | Procedimentos administrativos de **Projeto Técnico Simplificado** para edificações elegíveis segundo risco e outras condições. | Regularização anterior, ocupação, risco, área, altura, atividade e tipo de procedimento aplicável. | Não criar botão ou pontuação de “AVCB automático”; somente referência de orientação ao responsável técnico. |
| **IT 04/2016** (símbolos gráficos); **IT 18/2017** (iluminação de emergência); **IT 16/2018** (plano de emergência) | Relevantes para documentação gráfica e rotas, conforme condições próprias. | Layout de iluminação, sinalização efetiva, brigada, instruções de evacuação, planta técnica completa. | **Backlog** de análise de aplicabilidade; não implementado como verificação no C01/E04. |

### Referências oficiais diretas

- [IT 11/2016 — Saídas de emergência](https://www.ba.gov.br/bombeiros/sites/site-cbmba/files/migracao_2024/arquivos/files/2025-09/it_11-2016_-_saidas_de_emergencia.pdf)
- [IT 20/2017 — Sinalização de emergência](https://www.ba.gov.br/bombeiros/sites/site-cbmba/files/migracao_2024/arquivos/files/2025-09/it_20-2017_-_sinalizacao_de_emergencia.pdf)
- [IT 21/2017 — Sistema de proteção por extintores](https://www.ba.gov.br/bombeiros/sites/site-cbmba/files/migracao_2024/arquivos/files/2025-09/it_21-2017_-_sistema_de_protecao_por_extintores_de_incendio.pdf)
- [IT 14/2026 — Carga de incêndio](https://www.ba.gov.br/bombeiros/sites/site-cbmba/files/migracao_2024/arquivos/files/2026-06/it_14_2026_-_carga_de_incendio_nas_edificacoes_e_areas_de_risco.pdf)
- [IT 32/2021 — Produtos perigosos](https://www.ba.gov.br/bombeiros/sites/site-cbmba/files/migracao_2024/arquivos/files/2025-09/it_32-2021_-_produtos_perigosos_em_edificacoes_e_areas_de_risco.pdf)
- [IT 42/2024 — Projeto Técnico Simplificado](https://www.ba.gov.br/bombeiros/sites/site-cbmba/files/migracao_2024/arquivos/files/2025-09/it_42-2024_-_projeto_tecnico_simplificado.pdf)
- [Decreto Estadual nº 16.302/2015 — Ocupações e exigências](https://www.ba.gov.br/bombeiros/sites/site-cbmba/files/migracao_2024/arquivos/files/2025-09/decreto_estadual_16.302-2015_-_regulamento_de_seguranca_contra_incendio_e_panico.pdf)

**Proveniência:** arquivos foram acessados a partir do índice oficial do CBMBA em 08/11/2026, não de repositórios de terceiros. Versões são as expostas pelo órgão nessa data, podendo ser atualizadas.

## 3. Decisões científicas e de interface

1. **Nunca equiparar presença do ícone à inspeção física.** `check-exit`, `check-fire` e `check-signaling` continuam apenas indicadores de preenchimento, mesmo quando o resultado for 10/10.
2. **Toda regra normativa futura exige contexto:** identificador da fonte, versão, item, ocupação, estado de aplicabilidade, dados faltantes, método de verificação e evidência de observação. A falta de um parâmetro não deve ser convertida em “aprovado”.
3. **Estabelecer três estados distintos de análise:** `representado no mapa` (dado de desenho), `alerta geométrico` (cálculo parcial) e `avaliação técnica pendente` (mundo físico). A interface não deve fornecer um selo normativo para qualquer desses estados.
4. **Exemplos de números NÃO implementados:** 1,10 m da IT 11, alturas/intervalos da IT 20, distâncias/capacidades da IT 21 e isenção condicionada da IT 32. Requerem ocupação, versão aplicável, elementos medidos e confirmação de interpretação técnica.
5. **Aplicabilidade por laboratório e edificação:** D-4 e E-1 são classes do regulamento, mas não classificações automáticas de uma planta desenhada. A nota do Decreto 16.302/2015 exige considerar os produtos usados nos laboratórios educacionais.
6. **Dados de ambiente x dados de edificação:** diferenciar o recorte da planta de um laboratório de um pavimento, da edificação completa e de sua população; não utilizar dimensões de sala como se fossem informações de todo o edifício.

## 4. Situação do motor no fim do passo 4

Nenhuma das instruções técnicas foi traduzida em validação legal automática neste passo. O motor continua com os alertas geométricos do C01/E03 e com os dez indicadores de preenchimento. A mudança deste encontro é de **pesquisa, referências e critérios para futura especificação**, mantendo `JSON v4`, o armazenamento local, a interface atual e a integridade dos projetos.

### Dependências para o passo 5 (encerramento C01/E04)

- Conferir o presente quadro com o contrato `qa/CONTRATO-C01-E04-REGRAS-NORMAS.md`.
- Validar o teste de integridade documental no Actions, preservar PR #6 em rascunho e dependente do PR #3.
- Registrar como **pendência técnica** a confirmação do enquadramento e da versão aplicável a cada projeto real, especialmente quanto a laboratórios educacionais e produtos perigosos.
- Marcar pesquisa documental como **concluída**, sem marcar homologação normativa ou vistoria presencial como concluídas.
