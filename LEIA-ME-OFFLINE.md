# Mapa de Riscos do Laboratório — edição portátil offline (UIUX-0.9.0)

Esta distribuição contém os arquivos de execução locais da aplicação, sem necessidade de conexão com Google Apps Script, Google Sheets, CDN ou outros serviços para construir mapas, trabalhar com a biblioteca e exportar JSON.

## Como iniciar

**Windows:** extraia *todo* o ZIP, abra a pasta `portable` e execute `iniciar.cmd`. O iniciador utiliza Python 3, se instalado; caso contrário, tenta o servidor do próprio Windows (PowerShell/.NET). Se o Windows mostrar um aviso de segurança, inspecione o script antes de executá-lo; não é necessário conceder acesso à rede pública.

**Linux/macOS:** com Python 3 instalado, abra a pasta extraída e execute `sh portable/iniciar.sh` (ou `python3 portable/servidor.py`).

**Endereço de uso:** `http://127.0.0.1:8765/`. O servidor funciona exclusivamente no próprio computador (interface de loopback), sem exposição à rede escolar. Ao fechar o terminal, o servidor é encerrado; ao executar de novo, ele poderá reabrir a aplicação.

O programa funciona mesmo sem conexão à internet, pois todos os recursos do editor estão no ZIP. Não use `file://` como caminho recomendado: as políticas de scripts, IndexedDB e PWA variam entre navegadores. **O ZIP por si só não executa um servidor: é necessário usar um dos iniciadores.** A alternativa com Python exige Python 3 instalado; a alternativa com PowerShell depende dos componentes padrão do Windows e ainda precisa de testes nesse sistema operacional.

## Como manter os projetos

- A biblioteca IndexedDB e o autosave do `localStorage` pertencem **ao navegador e à origem**, não à pasta ZIP. Reinstalar a aplicação em outra pasta usando exatamente `http://127.0.0.1:8765/` tende a reutilizar os mesmos dados no mesmo perfil do navegador.
- **Não mude a porta nem troque `127.0.0.1` por `localhost`:** esses endereços são origens diferentes, e a biblioteca de projetos pode parecer vazia.
- **A versão do GitHub Pages e a edição portátil não compartilham automaticamente os projetos.** Para transferir um projeto, abra-o na origem antiga, use **Baixar JSON**, depois **Abrir** o JSON na origem nova. Confira o mapa antes de descartar o arquivo exportado.
- Limpar os dados do site, trocar de perfil, usar navegação privada ou reinstalar o navegador pode remover os projetos. **Mantenha cópias JSON fora do navegador.** O PWA e o cache não substituem backups dos trabalhos.
- A biblioteca suporta várias entradas e até dez revisões por projeto, mas não é um sistema de sincronização entre máquinas.

## Atualização de versão

1. Em qualquer versão antiga com projetos importantes, exporte ao menos os arquivos JSON necessários.
2. Feche o servidor anterior (Ctrl+C) e extraia o ZIP atualizado em outra pasta.
3. Abra com o mesmo navegador e o mesmo endereço `127.0.0.1:8765`.
4. Se surgir o botão de atualização do PWA, aceite-o após concluir ou exportar o trabalho atual. O novo service worker deve cachear a nova versão completa antes de ativá-la.
5. Confirme que a Home abre, que os seus projetos aparecem e que é possível exportar um JSON. Não apague os dados do site como forma de atualizar.

## Limites conhecidos

- Sem contas, sem sincronização com nuvem e sem servidor institucional central.
- A instalação PWA é opcional; não é exigida para iniciar o ZIP pelo servidor local.
- O modo portátil Windows sem Python é oferecido com launcher PowerShell; é necessário homologar o comportamento dele em Windows real, assim como Firefox e WebKit/Safari.
- O modo offline foi conferido por testes de arquivos, servidor HTTP local e simulação da camada de cache. A instalação/recarga offline real do navegador permanece pendente devido à política do ambiente de testes.
- Um computador que nunca recebeu o ZIP nem carregou o PWA anteriormente precisa de acesso prévio ao pacote, por mídia removível ou transferência local.

## Arquivos principais

- `index.html`: página inicial e editor.
- `sw.js`: shell offline/cache versionado.
- `manifest.webmanifest` e `assets/icons/`: instalação como PWA.
- `portable/servidor.py`: servidor local com biblioteca padrão Python.
- `portable/iniciar.cmd`: inicialização Windows e fallback PowerShell.
- `portable/iniciar.sh`: inicialização Linux/macOS.
- `CHECKSUMS-SHA256.txt`: verificação dos arquivos da edição portátil.
