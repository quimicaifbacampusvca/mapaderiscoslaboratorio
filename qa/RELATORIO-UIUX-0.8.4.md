# UIUX-0.8.4 — Distribuição portátil e homologação offline

**Projeto:** Mapa de Riscos do Laboratório  
**Base exata:** commit `6f5681df77cf8a5bf2174a1521601240373692e2` (UIUX-0.8.3)  
**Tipo:** distribuição e testes, sem alteração da lógica, dos dados ou das regras do editor.

## 1. Entregáveis

- ZIP compacto portátil com **37 arquivos**: somente recursos requeridos pelo shell offline, iniciadores locais, instruções e checksums SHA-256.
- Servidor HTTP local de biblioteca padrão Python 3, escutando **somente em 127.0.0.1:8765**, sem APIs de gravação nem listagem de diretórios.
- Iniciador `iniciar.cmd` para Windows com preferência por Python 3 e alternativa PowerShell/.NET sem download de biblioteca; essa alternativa ainda requer teste em Windows real.
- Iniciador `iniciar.sh` para Linux/macOS usando Python 3 local.
- Verificador de empacotamento, checksum, disponibilidade dos recursos HTTP, métodos HTTP, conteúdo e acesso indevido a arquivos internos.
- Orientação de atualização, utilização offline e migração entre o endereço do GitHub Pages e a origem portátil por arquivos JSON.

## 2. Preservação

- `js/mapa.js`, `js/project-library.js`, `js/library-ui.js`, `sw.js`, `manifest.webmanifest`, JSON v4 e arquivos CSS/ativos **inalterados em relação ao commit de referência**.
- Nenhuma migração, limpeza de armazenamento, alteração nas chaves de `localStorage`, IndexedDB ou autosave.
- Não incluir `js/config.js`, `js/room-gas.js`, testes de backend, relatórios internos nem arquivos pessoais no pacote portátil: não são recursos usados pela página.
- A distribuição **não copia os projetos**: estes permanecem no armazenamento do navegador usado em cada origem. Os backups JSON são a transferência segura entre origens e computadores.

## 3. Ensaios executados neste ambiente

- `python3 tools/montar-portatil.py`: pacote de 37 arquivos, ZIP íntegro, com SHA-256 por recurso.
- `python3 tools/validar-portatil.py`: verificou os **36 checksums**, **31 recursos HTTP** correspondentes byte a byte ao ZIP, cabeçalhos e rejeição de 6 requisições não permitidas. Servidor testado em porta efêmera apenas na suíte; o produto usa porta fixa 8765.
- `node tests/uiux-084-portable.mjs`: contrato de ativos, escopo local e distribuição, incluindo ausência de dependências CDN declaradas na Home/CSS.
- Suítes Node anteriores: **13/13 aprovadas**, incluindo teste simulado do service worker com instalação íntegra, cache offline, atualização controlada e rollback, além de IndexedDB simulado.
- Integridade do pacote e isolamento: o ZIP não inclui arquivos de usuários nem referências ao GAS e não expõe arquivos de configuração/diretórios pelo servidor HTTP distribuído.

## 4. Limitações e pendências de homologação real

**Homologação offline multiplataforma permanece condicional.** A política administrativa do Chromium deste ambiente bloqueou `http://127.0.0.1` com `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Por isso não foi possível comprovar neste ambiente: carregamento real pelo navegador no servidor local, instalação real do PWA, recarga de PWA sem rede, IndexedDB persistido após encerrar o navegador. Firefox e WebKit/Safari não puderam ser testados aqui. O fallback PowerShell não pôde ser executado em Windows real neste ambiente Linux.

O sucesso dos testes HTTP via Python e dos contratos de service worker não substitui esses ensaios de navegador.

## 5. Matriz de homologação a completar em máquinas reais

| Cenário | Esperado | Estado |
|---|---|---|
| Abrir no servidor local sem internet | Home, editor e imagens carregam | Pendente em navegador real |
| Linux/macOS com Python 3 | Inicia em 127.0.0.1:8765 | Servidor Python homologado via HTTP local; interface browser pendente |
| Windows Python 3 / fallback PowerShell | Iniciador abre servidor e navegador | Pendente em Windows |
| PWA instalado offline (HTTPS/localhost) | Reinicia sem conexão após instalação completa | Simulado; teste real pendente |
| Biblioteca IndexedDB | Dois mapas persistem entre reinicializações | Simulado; teste real pendente |
| Troca de origem GitHub Pages → local | Requer exportar/importar JSON, sem falsa sincronização | Documentado; teste humano pendente |
| Firefox e Safari/WebKit | Recursos e armazenamento funcionais | Pendente |
| Atualização sem perda | Dados anteriores permanecem com mesma origem/porta | Contrato testado; navegador real pendente |

## 6. Procedimento manual de aceitação

1. Em computador com ou sem internet, extrair o ZIP portátil inteiro em pasta nova.
2. Iniciar pelo `portable/iniciar.cmd` (Windows) ou `sh portable/iniciar.sh` (Linux/macOS) e confirmar `http://127.0.0.1:8765/`.
3. Desabilitar acesso à internet, abrir Home, criar um mapa e editar riscos/cotas.
4. Criar mapa A e mapa B, guardar uma revisão no A; fechar navegador/servidor, reabrir o mesmo endereço e conferir A, B e histórico.
5. Exportar A como JSON, remover acesso à rede e reimportar o arquivo; conferir equivalência das dimensões e símbolos.
6. Se estiver atualizando, exportar backups antes; extrair outra versão, encerrar a anterior e usar o **mesmo host e porta**.
7. Repetir em Chromium, Firefox e WebKit/Safari quando suportado, incluindo orientação mobile quando aplicável.

## 7. Rollback

Reverter somente scripts, instruções e arquivos de distribuição se surgirem falhas. Os recursos da aplicação anterior continuam iguais; não apagar IndexedDB, `localStorage` nem caches por tentativa de reparo sem antes exportar os projetos.
