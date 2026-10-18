# Mapa de Riscos do Laboratório — editor sem login

Ferramenta de criação de plantas e mapas de riscos 2D, com interface direta e sem cadastro.

## Como usar

1. Abra `index.html` pelo GitHub Pages ou por um servidor HTTP estático (`python3 -m http.server 5500`).
2. Escolha **Novo Projeto**, **Usar Modelo**, **Abrir Projeto** ou **Importar Modelo JSON**.
3. O progresso é salvo automaticamente **neste navegador**, usando `localStorage`. Para backup, transporte entre dispositivos ou compartilhamento, **exporte o projeto para JSON**.

## Alteração de arquitetura (remoção do login)

O frontend não solicita conta, e-mail ou senha. O módulo de login `js/auth.js` foi removido. Os arquivos de configuração e integração do GAS foram preservados no repositório para compatibilidade histórica, **mas não são carregados** pelo HTML nesta versão. O módulo GAS em `gas/` foi mantido **apenas como referência/legado** e não é invocado pelo site.

**Não há sincronização com Google Sheets/Drive, criação de salas remotas nem vínculo de JSON a professores nesta versão sem login.** Dados e contas preexistentes na planilha mestra/Drive **não foram alterados**. Para recuperar colaboração remota sem cadastro, será necessário projetar autorização por códigos de sala com chave privada de edição (e não liberar gravação anônima de todos os projetos).

## Testes

`node tests/no-login-smoke.mjs` valida que a interface está desprovida de login e não exige autenticação para abrir o editor. `node tests/core-smoke.mjs` cobre utilitários geométricos. Outros testes GAS no repositório pertencem ao backend legado, não ao fluxo atual.

## Licença

Ver `LICENSE`.
