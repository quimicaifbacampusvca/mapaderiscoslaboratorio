# Proposta de discussão — UIUX-0.8.x

**Projeto:** Mapa de Riscos do Laboratório  
**Status:** proposta preliminar; **não implementada**  
**Mudança de diretriz:** a abordagem conservadora permanece nas séries até UIUX-0.7.0. A UIUX-0.8.x poderá rever amplamente a identidade visual, desde que não comprometa o motor geométrico nem projetos existentes.

## 1. Visão para a série
Reavaliar integralmente identidade visual, comunicação gráfica e experiência de utilização, juntamente com estratégias práticas de instalação e funcionamento sem internet. A identidade deverá valorizar segurança laboratorial, representação técnica e clareza didática, sem reduzir contraste ou precisão do mapa.

## 2. Linhas de investigação

### A — Identidade visual e recursos gráficos
- Explorar duas ou três direções visuais documentadas antes de escolher uma (paleta, tipografia, iconografia, formas, superfícies, hierarquia e ilustrações).
- Inventariar marca, iconografia de riscos, equipamentos e sinalização; manter símbolos e significados científicos corretos e fontes documentadas.
- Estabelecer tokens de design, estilos de interação, componentes e aplicações em Home, workspace, modais, impressão e telas compactas.
- Produzir protótipos comparáveis antes de modificar o código e permitir avaliar percepção de risco, leitura técnica e acessibilidade.
- Distinguir efeitos visuais funcionais (feedback, foco, validação) de animação ornamental; respeitar `prefers-reduced-motion`.

### B — PWA instalável e offline-first
- Criar `manifest.webmanifest` com nome, ícones próprios em resoluções adequadas, `display=standalone`, `start_url` relativo e tema compatível.
- Implementar service worker registrado somente em origem segura (HTTPS ou localhost) e precache versionado dos arquivos estáticos (HTML, CSS, JS, SVG, fontes *aprovadas*).
- Política de atualizações com instalação atômica, versionamento de cache, controle de arquivos obsoletos e tratamento de recursos não disponíveis; jamais apresentar uma versão incompleta silenciosamente.
- Oferecer feedback explícito de instalação, disponibilidade offline e atualização, sem bloqueios ou caixas repetitivas.
- Testar a abertura offline **depois** do primeiro carregamento online, recarga, navegação e recuperação de trabalho; registrar limites do iOS/Safari e instalação em cada plataforma.
- O service worker **não** substitui o armazenamento dos projetos e **não** sincroniza automaticamente dispositivos.

### C — Continuidade dos projetos sem internet
- Preservar o contrato JSON v4 e abrir projetos existentes sem migração destrutiva.
- Auditar armazenamento (`localStorage` atual, autosave e única cópia anterior), quotas, modo privado, limpeza do navegador e falhas de gravação.
- Considerar IndexedDB para biblioteca local de múltiplos projetos e histórico limitado; antes da adoção, especificar estratégia transacional de migração e rollback dos dados existentes.
- Oferecer backup/restauração por JSON como caminho independente de conectividade, com tratamento de arquivos inválidos.
- Considerar exportação/importação de vários projetos **somente** após detalhar impacto, compatibilidade e teste de dados.

### D — Alternativas práticas ao PWA
- **Site estático offline:** distribuição ZIP contendo todos os assets locais, com servidor estático simples para uso em computador institucional.
- **Pacote portátil:** versão offline que abre localmente quando os recursos e políticas do navegador permitirem, sem presumir que service workers funcionem em `file://`.
- **Aplicativo desktop empacotado:** estudar somente se instalação sem servidor ou integração com arquivos locais for requisito institucional, ponderando manutenção e atualizações.
- **Ambiente escolar:** cenários sem internet, com rede local e com políticas restritivas de TI; planejar instruções de implantação e atualização sem perda dos dados.

## 3. Dependências e critérios de decisão
- Fechar previamente a UIUX-0.7.0, com linha de base de testes e backup verificável.
- Não substituir a arquitetura Canvas só para atender à identidade visual.
- Inventariar dependências externas e assegurar que os recursos necessários à construção e exportação estejam disponíveis offline.
- Validar Chromium, Firefox e WebKit/Safari onde houver suporte, além do PWA instalado quando a plataforma permitir.
- Não prometer armazenamento em nuvem ou colaboração ao público: continuam fora de escopo até uma arquitetura de autorização própria.
- Manter verificação de integridade do JSON e recursos de recuperação após atualização de service worker ou migração de dados.

## 4. Sequência sugerida para discussão (sem fixar implementação)
1. **0.8.0 — Diagnóstico visual e proposta de identidade** (direções, protótipos e critérios de escolha).
2. **0.8.1 — Design system e ativos visuais**, após aprovação das referências.
3. **0.8.2 — PWA e políticas de atualização/offline**, após testes de recursos e dados.
4. **0.8.3 — Persistência local e portabilidade**, caso a migração seja aprovada.
5. **0.8.4 — Distribuições alternativas e homologação offline**.

A subdivisão acima é uma hipótese de planejamento, não uma autorização para alterar o aplicativo. Antes de executar a série, consolidar escopo, arquitetura, matrizes de suporte e critérios de aprovação.
