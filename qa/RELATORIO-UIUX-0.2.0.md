# Relatório UIUX-0.2.0 — Home e proteção de projetos

**Referência:** `quimicaifbacampusvca/mapaderiscoslaboratorio` — base `7ac78976b6019a00d9c3df1e7af81c880e99e70b`.

## Alterações executadas

- Confirmação antes de ações que substituam dados de trabalho; três opções: cancelar, baixar JSON e substituir.
- Exportação de JSON com nomenclatura explícita; autosave local mantido sem login e sem nuvem.
- Uma cópia anterior recuperável no armazenamento local; restauração na Home; substituição abortada em falhas de persistência.
- Validação de estrutura JSON **antes** de alterar estado, incluindo arquivo legado (`room/objects`).
- Proteção contra autosave inválido e exceções de armazenamento bloqueado; sem apagar o projeto atual em erros.
- Exclusão do botão legado “Sair da conta”. Ajustes visuais leves de estado, foco e responsividade do aviso e confirmação.

## Testes

- Node: `core-smoke`, `frontend-integrity-smoke`, `no-login-smoke`, `ui-bindings-smoke`, `uiux-020-project-safety`.
- Chromium (HTML/CSS/JS reais, armazenamento simulado): 49 cenários automatizados em 320, 390, 768 e 1440 px, incluindo cancelamento, salvamento anterior, restauração, JSON válido/inválido, erro de armazenamento e console.
- Testes adicionais: aplicação/cancelamento de modelos e restauração do autosave em sessão simulada distinta.
- Firefox e WebKit: **não executados** (binários não disponíveis no ambiente). HTTP localhost: bloqueado pelo navegador da infraestrutura, portanto testes isolados não comprovam implantação real nem persistência nativa após reinicialização completa.

## Limites e pendências

- A recuperação é de **uma única cópia anterior**, não constitui biblioteca de projetos.
- Arquivos JSON não são sincronizados com Drive/Sheets nesta versão sem login.
- Malha métrica graduada é responsabilidade UIUX-0.3.0; correção de SVG e aperfeiçoamento visual global serão tratados nas séries seguintes.
- Homologação multiplataforma e verificação de GitHub Pages continuam previstas para UIUX-0.7.0.
