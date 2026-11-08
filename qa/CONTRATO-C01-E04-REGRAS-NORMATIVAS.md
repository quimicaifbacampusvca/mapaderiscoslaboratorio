# C01/E04 — revisão de regras de segurança e referências normativas

**Sessão:** 08/11/2026, 15h–19h (America/Bahia), encontro 4/70 do planejamento.
**Dependência:** PR #3 (C01/E03) em rascunho. Esta branch parte do C01/E03; **não** possui integração com `main`.
**Natureza:** revisão didática e de interface; não constitui laudo, vistoria ou certificação.

## Decisão de transposição didática

| Tipo | O que é permitido afirmar | O que não é permitido afirmar |
|---|---|---|
| Regra normativa confirmada | NR-23, 23.3.4.1: aberturas, saídas e passagens mantidas desobstruídas | Tolerância universal de obstrução de 80% ou aprovação apenas por mapa 2D |
| Verificação geométrica | Interseção de objetos representados com portas, saídas e zonas do desenho | Conformidade real da rota de fuga sem ocupação, população, rota e vistoria |
| Heurística didática | Envelope virtual de 1,2 m, limiar de 40% da zona e 3 × 3 m como referências de interface | Tratar qualquer desses valores como mínimo geral e obrigatório por lei |
| Registro documental | Campo de EPI preenchido e existência do símbolo de equipamento | Atestar seleção correta de EPI, extintor, ventilação ou sinalização |

## Alterações implementadas

- `js/mapa.js`: o stepper considera inventário físico independentemente de ocultação; mensagens de conformidade substituídas por preenchimento didático, preservando funções e IDs para compatibilidade.
- `index.html`: EPI passa a ser um *registro sujeito à avaliação da atividade*, não uma recomendação automática da NR-6; checklist não atesta adequação do EPI.
- `js/types.js`: placeholders dos riscos não prescrevem EPIs por categoria; no risco de radiação, não confundem dosímetro com EPI protetivo.
- `js/validation.js`: o alerta de circulação declara expressamente que o gatilho de 40% é didático, não uma tolerância normativa universal.
- `tests/c01-e04-normative-contract.mjs`: contratos de texto, geometria, regra de saída e ocultação do stepper.
- `.github/workflows/c01-e04-validation.yml`: regressões Node e reexecução do smoke test com Chromium, Firefox e WebKit em branch de desenvolvimento.

## Fontes oficiais consultadas em 08/11/2026

- [MTE — NR-23 (última modificação 2022)](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/norma-regulamentadora-no-23-nr-23) — desobstrução e legislação estadual.
- [MTE — NR-6 (última modificação informada 2025)](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/norma-regulamentadora-no-6-nr-6) — avaliação de riscos, atividade e seleção de EPI.
- [MTE — NR-5](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/norma-regulamentadora-no-5-nr-5) — mapa ou outra técnica apropriada para percepção de riscos.
- [CBMBA — instruções técnicas (atualização 26/10/2026)](https://www.ba.gov.br/bombeiros/node/4005) — verificar IT 11/2016, 18/2017, 20/2017 e 21/2017 conforme a edificação.

## Critérios de aceite (E04-T01 a T10)

1. **T01/T02:** obstáculos ocultos e pequenas interseções físicas com saídas são detectados, sem tolerância legal arbitrária.
2. **T03:** envelope de aproximação 1,2 m é alerta didático, sem aprovação ou reprovação legal geral.
3. **T04:** sobreposição de circulação >40% explicita a natureza didática. O limiar ainda não é validador normativo.
4. **T05:** uma área inferior a 3 × 3 m não é rotulada como ilegal.
5. **T06:** 10/10 jamais é identificado como aprovação legal ou vistoria.
6. **T07:** esconder objetos não elimina seus riscos físicos nem regride etapas de preenchimento.
7. **T08:** campo de EPI orienta avaliação contextual e não gera prescrição automática.
8. **T09:** dimensões normativas reais ficam sem avaliação até informar requisitos do ambiente e legislação estadual.
9. **T10:** `version:4`, histórico, IndexedDB, PWA, importação/exportação e flags `hidden`/`locked` continuam sujeitos às suítes E03.

## Pendências deliberadas

- O limiar de circulação de 40% continua apenas como **gatilho de alerta didático**, não avalia a rota real. Qualquer alteração da heurística exige discussão pedagógica e regressão geométrica.
- O preenchimento livre do campo EPI não estabelece adequação ou Certificado de Aprovação.
- Homologação manual com cópia de projetos reais após backup, Android/iOS físicos, Safari, leitores de tela, dispositivos PWA instalados e matriz H01–H10 integral ainda é exigida antes do merge.
- Nenhum merge automático. Dependência de revisão da branch E03 e aprovação expressa da integração.
