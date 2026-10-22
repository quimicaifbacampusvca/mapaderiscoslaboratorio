# Homologação individual C04 e P01 — rodada 22/10/2026

## Evidências e escopo

- Branch: qa/homologacao-real-h01-h10; commit d437df41c96ba608eba13f52097d15f46df0f096.
- Workflow: .github/workflows/qa-individual-c04-p01.yml.
- Execução: https://github.com/quimicaifbacampusvca/mapaderiscoslaboratorio/actions/runs/39720963334
- Artefatos individuais: https://github.com/quimicaifbacampusvca/mapaderiscoslaboratorio/actions/runs/39720963334/artifacts/12400939011
- Correção C04: PR #2, branch fix/uiux-0.9.3.3.2-a11y-mobile; main ainda não foi alterada.

## Casos executados um por vez

Cada linha corresponde a uma invocação separada do Playwright, sem repetição automática, com relatório, logs e capturas separados.

| Ordem | Cenário | Ambiente | Navegador | Resultado |
|---:|---|---|---|---|
| 1 | C04 | branch corrigida | Chromium | aprovado |
| 2 | C04 | branch corrigida | Firefox | aprovado |
| 3 | C04 | branch corrigida | WebKit | aprovado |
| 4 | C04 | site publicado | Chromium | falhou — CSS antigo |
| 5 | C04 | site publicado | Firefox | falhou — CSS antigo |
| 6 | C04 | site publicado | WebKit | falhou — CSS antigo |
| 7 | P01 | branch corrigida | Chromium | aprovado |
| 8 | P01 | branch corrigida | Firefox | aprovado |
| 9 | P01 | branch corrigida | WebKit | erro interno da automação; inconclusivo |
| 10 | P01 | site publicado | Chromium | aprovado |
| 11 | P01 | site publicado | Firefox | aprovado |
| 12 | P01 | site publicado | WebKit | erro interno da automação; inconclusivo |

## Diagnóstico

C04: em telas de 320 px e texto a 200%, o botão Restaurar padrões ultrapassa a área útil no site publicado. O CSS atualizado da branch aprova os três motores. A publicação de UIUX-0.9.3.3.2 e a invalidação do cache PWA ainda são necessárias.

P01: a recarga offline com preservação do projeto é aprovada em Chromium e Firefox nos dois ambientes. Em WebKit, o método Playwright browserContext.setOffline(true) provoca WebKit encountered an internal error. Há relato independente do mesmo problema em https://github.com/microsoft/playwright/issues/42775, aberto em setembro de 2026. Isso não atesta aprovação do PWA em Safari nativo.

## Resultado técnico e gate

12 execuções: 7 aprovações, 3 falhas do C04 no site antigo, e 2 erros de automação WebKit do P01. A quantidade de cinco falhas no workflow inclui os dois erros de automação; não deve ser confundida com cinco defeitos do aplicativo.

Pendente: integrar PR #2, revalidar C04 no site já atualizado; verificar P01 em Safari nativo com rede realmente desligada e leitor de telas; não declarar homologação 1.0.0 antecipadamente.

Todos os projetos usados são sintéticos, em contextos isolados. Não houve acesso ao armazenamento real dos usuários.
