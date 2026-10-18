# Mapa de Riscos do Laboratório

Editor web de mapas de risco com gestão de salas por professor, visualização por estudante e backend no Google Apps Script + Google Sheets.

## Uso e publicação

O frontend está em `index.html`, `js/`, `css/` e `assets/`. O backend está em `gas/Code.gs`. Para funcionar entre dispositivos, **é necessário publicar o Apps Script** e configurar sua URL `/exec` em `js/config.js`. O código do GitHub Pages por si só não implanta o GAS.

O login desta versão é realizado com **e-mail e senha**, e as sessões são verificadas no servidor. O perfil de professor exige promoção administrativa com `promoteConfiguredProfessor()` no editor Apps Script, após confirmação de identidade. O cadastro público permite apenas contas de estudante. Para atualizar o GAS sem perder dados da planilha, consulte **`gas/SETUP.md`** antes de executar `setupMasterSpreadsheet()`.

Para executar localmente o frontend:

```bash
python3 -m http.server 5500
```

Abra `http://localhost:5500`. O frontend requer URL pública do GAS com implantação ativa para cadastro/login. O uso em modo `file://` pode causar bloqueios de segurança e carregamento.

## Dados e colaboração

O professor cria uma sala, recebe um código de seis caracteres e pode salvar o mapa. O estudante entra por código e vê o projeto em modo leitura. O backend valida autenticação e propriedade da sala em ações protegidas. Para estudantes, o frontend consulta atualizações de projeto periodicamente (10 segundos); **não há WebSocket ativo** nem edição simultânea distribuída. O cliente envia o estado do projeto em JSON e ele não é cifrado. Não armazene dados confidenciais neste formato.

Projetos pequenos ficam no Sheets, com uma cópia no Drive quando disponível; projetos maiores dependem do Drive. Antes de atualizar a implantação, faça backup da planilha e da versão do Apps Script. O histórico `projetos` existente é preservado; novas gravações atualizam o registro mais recente de cada sala para evitar milhares de linhas de autosave.

A recuperação de senha envia um link com expiração de uma hora usando `MailApp`. Configure `FRONTEND_URL` em Script Properties e o escopo `script.send_mail` no manifest. Alterar a senha invalida a sessão anterior.

## Testes

Na pasta raiz, execute:

```bash
for t in tests/*.mjs; do node "$t"; done
```

`tests/gas-integration.mjs` simula Apps Script/Sheets/Drive e exercita cadastro, migração não destrutiva, papéis, sessão, salas, gravação, leitura e recuperação de senha. Esses testes não substituem um teste no GAS publicado.

## Licença

Consulte `LICENSE`.
