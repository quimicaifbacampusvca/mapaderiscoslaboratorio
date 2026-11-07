# C01/E03 — contrato operacional e correções propostas

**Data:** 2026-11-07  
**Base auditada:** `8fa42e4e131e0cfd1f8ef9785782b6d6c40dbeed`  
**Branch de desenvolvimento:** `fix/c01-e03-inventario-restricoes`  
**Escopo:** catálogo de objetos, camadas, regras de segurança e integridade dos indicadores.  
**Integração:** não integrar ao `main` sem revisão e regressões.

## Decisões de implementação

1. **Visibilidade é apresentação:** `hidden` apenas controla desenho/seleção no Canvas; não elimina objetos do inventário físico ou dos alertas geométricos e resumos de risco. Ações de mostrar/ocultar continuam reversíveis.
2. **Bloqueio é proteção contra edição:** `locked` impede alteração de posição, dimensão, rotação, exclusão, duplicação e alteração de pertencimento a grupo, inclusive por lote; liberar bloqueio e alterar visibilidade são permitidos. Excluir uma área completa é uma operação de projeto separada, sujeita à confirmação existente.
3. **Alertas são graduados:** a interseção física de uma saída com objetos sólidos é problema geométrico; a área didática de 1,2 m é uma advertência de referência, sem pretensão de corresponder a valor legal universal. Não se usa o antigo limiar arbitrário de 80% como se fosse a NR-23.
4. **O placar de 10 itens é um auxílio didático, não laudo:** comprova a presença de representações na planta e uma verificação geométrica automatizada limitada. Não atesta conformidade legal, desempenho do equipamento, rotas completas de saída ou inspeção presencial.
5. **Persistência:** modelo `version:4`, `areas`, `objetos`, IDs, `groupId`, `hidden`, `locked`, autosave, IndexedDB, histórico e exportação permanecem compatíveis. Não há migração nem alteração na estrutura JSON.

## Mudanças no branch

- `js/validation.js`: objetos ocultos continuam na análise, avisos de saída deixam de usar 80% como critério legal, referência explícita ao item 23.3.4.1 da NR-23 para passagens desobstruídas; zona de 1,2 m indicada como didática.
- `js/geometry.js`: cálculo de área com rotação e decomposição da bancada L; suporte por área realmente coberta; aproximação de saídas usa interseção com objetos rotacionados e ocultos; projeção da largura da porta vertical considera o eixo longo.
- `js/mapa.js`: `.valid` consultado corretamente no check de saída; riscos ocultos permanecem no resumo e nos dez checks; presença do risco de incêndio não substitui presença de extintor; proteção contra exclusão/duplicação/agrupamento de itens bloqueados; rotação por slider com histórico e autosave.
- `index.html`: linguagem visual substitui afirmações normativas indevidas por verificação didática; adiciona aviso de que não constitui certificação.
- `sw.js` e testes de contrato de cache: atualização atômica `c01-e03-security-v1`, sem alterar dados do usuário nem disparar substituição automática.
- `tests/c01-e03-inventario-restricoes.mjs`: cenários negativos de ocultação, saídas, portas verticais, interseção girada, apoio sobre bancada L e contratos estáticos.
- `.github/workflows/c01-e03-validation.yml`: verificação de sintaxe e execução de suítes Node na branch e PR.

## Escopo *não concluído* nesta mudança

- A árvore continua agrupando objetos visualmente: não foram introduzidos z-index persistentes, reordenação por drag-and-drop ou nova semântica de empilhamento. Demanda de UX separada (A09).
- A geometria é bidimensional e o envelope didático de aproximação permanece aproximado, sem pretender validar legislação de dimensionamento de rotas.
- O valor `10/10` permanece um indicador de **preenchimento**; não deve ser utilizado para aprovar segurança real.
- Os cenários de regressão E2E com projetos reais, importação/exportação JSON, PWA instalado, testes H01–H10, navegador Firefox/WebKit e tecnologias assistivas ainda exigem execução e evidências.
- Qualquer especificação de segurança aplicável deve considerar o tipo de ocupação, legislação estadual vigente e normas técnicas oficiais por profissional habilitado.

## Testes e aceitação

| ID | Caso | Critério |
|---|---|---|
| T01 | Bancada oculta obstruindo porta | Continua inválida e presente no inventário |
| T02 | Ausência de obstáculo na porta | Não acusa obstrução |
| T03 | Porta vertical | Razão de obstrução utiliza o eixo útil |
| T04 | Mesmos retângulos a 45° | Área de interseção equivale à área original |
| T05 | Item apoiado sobre bancada L girada | Aceito somente se integralmente apoiado |
| T06 | Exclusão, duplicação e agrupamento de bloqueados | Rejeitados até desbloqueio |
| T07 | Rotação por controle | Histórico e salvamento atualizados |
| T08 | Status da saída | Consulta `.valid`, não truthiness do objeto |
| T09 | JSON e biblioteca | Reabrir/importar/exportar sem perda de campos |
| T10 | PWA e browsers | Atualizar cache explicitamente sem regressões |

**Limite de evidência:** a revisão local de lógica JavaScript isolada não substitui a execução integral de Actions e a homologação interativa em Chromium/Firefox/WebKit. O branch permanece sujeito a aprovação antes do merge.

## Bases normativas consultadas

- [NR-23, texto da Portaria MTP 2.769/2022](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/nr-23-atualizada-2022.pdf), em especial itens 23.3.1 e 23.3.4.1.
- [CBMBA — Segurança Contra Incêndio e Pânico](https://www.ba.gov.br/bombeiros/node/4005), incluindo IT 11/2016 sobre saídas de emergência e outras instruções técnicas aplicáveis.
