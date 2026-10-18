# UIUX-0.8.2 — Relatório técnico: PWA e cache offline

**Projeto:** Mapa de Riscos do Laboratório  
**Base:** commit `36cbcf299316685640e425ba29f44346bd576c6a` (UIUX-0.8.1.1)  
**Status:** implementação pronta, testes automatizados locais aprovados; homologação de instalação e execução sem rede em dispositivo real pendente.

## Entregas

1. `manifest.webmanifest`: nome, URL inicial e scope relativos, `display:standalone`, paleta institucional e ícones locais.
2. `assets/icons/`: versões PNG 180, 192, 512 e maskable 192/512, convertidas da marca vetorial oficial.
3. `sw.js`: precache atômico de todos os assets indispensáveis; somente recursos GET estáticos e navegação para a Home; exclusão de caches de versões anteriores após ativação bem-sucedida. Não intercepta URLs externas ou JSON de projetos.
4. `js/pwa.js`: registro condicionado a HTTPS/localhost, atualização verificada a cada 15 min (quando a página está visível/online), atualização explícita com confirmação por botão e instalação apenas quando o navegador oferece um prompt.
5. Feedback de conexão offline discreto (sem texto fixo na Home).
6. Nenhuma modificação em `js/mapa.js`, `js/metric-ruler.js`, fontes de dados, backend ou formato JSON v4.

## Contrato de segurança e continuidade

- Precaches com `cache.addAll` falham se faltar qualquer arquivo. A tentativa incompleta é descartada, mantendo a versão previamente instalada disponível.
- Em atualizações, o SW não chama `skipWaiting` automaticamente; a escolha de ativar nova versão é do usuário.
- Cache de arquivos não é armazenamento de dados pessoais. `localStorage` com `mapa_riscos_autosave` e `mapa_riscos_previous_autosave` permanece intacto.
- Arquivos JSON importados, URLs externas, chamadas ao GAS e demais requisições não listadas estão fora da interceptação.
- Para instalar PWA, não abrir via `file://`: usar uma origem segura. GitHub Pages deve servir todos os arquivos do commit antes da nova instalação ser promovida; deploy parcial pode falhar e o SW anterior permanece ativo.
- A aplicação não afirma que dados em `localStorage` sejam à prova de limpeza do navegador; exportação JSON permanece necessária.

## Testes realizados

- **12/12 suítes Node** do frontend aprovadas (incluindo teste novo com máquina simulada de service worker).
- **122/122 verificações de interface** da UIUX-0.8.1 repetidas no Chromium em ambiente isolado; largura de 320 a 1440 px, editor, cotas, zoom, modelos e painéis.
- **Teste de cache com simulação Node**: instalação bem-sucedida, falha de instalação, preservação do cache anterior, navegação e assets servidos sem rede, escopo de subdiretório do GitHub Pages, restrição de requisições, atualização exclusivamente com mensagem explícita, limpeza seletiva de caches.
- **Teste HTTP de assets estáticos**: os caminhos relativos são resolvidos dentro de `/mapaderiscoslaboratorio/` e o servidor entrega manifesto, SW e recursos precacheados.

**Limitação decisiva:** o Chromium deste ambiente bloqueia conexões `localhost` com `ERR_BLOCKED_BY_ADMINISTRATOR`. Não foi possível observar uma instalação real do service worker ou acionar o modo offline via DevTools neste ambiente. Firefox, WebKit/Safari, instalação Android e iOS também não foram ensaiados. Essas são pendências abertas de homologação, não resultados aprovados.

## Matriz manual obrigatória antes de homologação definitiva

1. Abrir o site no GitHub Pages por HTTPS sem SW antigo; aguardar instalação, verificar `Application → Service Workers` e que Cache Storage contém todos os assets.
2. Em Chrome desktop e Android, instalar o PWA (quando permitido) e abrir o aplicativo em standalone.
3. Desligar a rede e **recarregar** o app instalado e a URL original; confirmar Home, Novo Projeto, editor, Cotas, símbolo de risco, zoom, Baixar JSON e importação de JSON existente.
4. Alterar o SW numa versão seguinte, publicar pacote íntegro e verificar que aparece **Atualização disponível · Atualizar**, sem interromper a edição antes de clicar.
5. Simular publicação incompleta (asset removido no cenário de testes); verificar que o SW antigo permanece utilizável sem conexão.
6. Guardar um projeto em autosave, atualizar o PWA e verificar que as chaves locais e o JSON v4 permanecem íntegros.
7. Testar Safari macOS/iOS, Firefox desktop e mobile em plataformas suportadas: PWA installable varia por navegador; offline deve ser verificado quando SW suportado.
8. Verificar comportamento em modo privado, armazenamento bloqueado/quota, redes escolares restritas e com limpeza de dados.

## Publicação e reversão

Publique todos os arquivos juntos em um único commit para GitHub Pages, com o service worker na **raiz** da publicação. Se houver falha grave, volte o commit e publique um novo service worker com nome de cache distinto para atualizar instalações que já foram ativadas. **Não limpe dados do site**, pois isso também removerá os projetos salvos em `localStorage`.
