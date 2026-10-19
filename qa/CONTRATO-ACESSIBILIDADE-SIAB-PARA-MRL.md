# Contrato de acessibilidade do SIAB 1.0.0 — referência para MRL

**Fontes primárias consultadas:** `SIAB-1.0.0-standalone.html` e `Manual_Usuario_SIAB_1.0.0_entrega.docx`, versão 1.0.0. O histórico completo da conversa “Base para Simuladores” não foi retornado pela busca; este contrato é extraído do executável e do manual, não de uma transcrição suposta da conversa.

## Painel efetivo do SIAB

**Aparência:** Modo escuro (tema claro/escuro); Alto contraste; Tamanho do texto com A−/A+, saída em porcentagem e escala da interface de 80% a 200% em passos de 10%; Espaçamento de letras; Reduzir animações; Animação de abertura (“Ao abrir ou recarregar”); Leitura simples (“Texto maior e cores mais firmes”).

**Visão de cores:** Simular daltonismo — Nenhum, Protanopia, Deuteranopia, Tritanopia, Acromatopsia. Os filtros simulam diferenças de percepção e **não corrigem o daltonismo**. Informações relevantes acompanham cor com textos/símbolos.

**Som e toque:** Som do pH (“Tom mais agudo quanto maior o pH”) e Vibrar na viragem (“Em celulares compatíveis”). Esses dois recursos são específicos do SIAB e **não devem ser transferidos literalmente** ao mapa de riscos.

**Outros recursos:** VLibras opcional, necessita de internet; Restaurar padrões.

## Acesso e teclado

O painel abre pelo cabeçalho ou pelo Menu. O menu SIAB usa diálogo modal `showModal()`; a navegação direciona foco para o diálogo e fecha com Esc. Abrir Acessibilidade diretamente expande a seção correspondente e posiciona o foco no controle da seção. Tab e Shift+Tab percorrem controles; Enter ativa links; Enter/Espaço ativam botões e expansores; setas navegam por abas que suportam esse padrão; Esc fecha diálogos e painéis contextuais. Foco visível identifica o destino do próximo comando.

## Preferências e persistência

A API de acessibilidade do SIAB valida e aplica preferências de tema, leitura, visão de cores, contraste, escala de texto, espaçamento e movimento. Ela salva estado em `localStorage` e propaga preferências na URL. Caso o armazenamento falhe, o aplicativo continua funcionando; preferências específicas de áudio, vibração e VLibras têm seus próprios controles.

## Aplicação futura no Mapa de Riscos

Construir Acessibilidade como seção específica em Configurações (com atalho direto adequado). Reproduzir os comportamentos equivalentes de contraste, tema, 80%–200%, espaçamento, movimento, leitura e visão de cores, mas sem modificar a interpretação das categorias de risco, os símbolos, as medidas ou o JSON. Manter status acessíveis sem dependência exclusiva de cor, foco/teclado/áudio descritivo pertinente ao MRL e funcionamento offline. Se VLibras for adotado, indicar sua dependência de rede. Nenhuma opção descrita nesta seção está sendo declarada como já implementada no MRL.

## Homologação requerida

Exigir testes em 320/390/768/1024/1440 px, 150%/200% de fonte, alto contraste, navegação sem mouse, leitor de telas, preferência `prefers-reduced-motion`, modal e rolagem, persistência e privacidade, Chromium/Firefox/WebKit e PWA/offline. Falhas não devem impedir exportação JSON nem acesso ao editor.
