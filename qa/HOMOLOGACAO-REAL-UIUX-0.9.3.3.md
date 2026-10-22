# Homologação real de temas e acessibilidade — UIUX-0.9.3.3.1

**Versão de referência:** `b7aab5325f4c7b1c253a7bd00bef2cb37f307967` (branch `main`).  
**Status:** roteiro de verificação; **não homologado no navegador hospedado**.

## Pré-condições

1. Abrir `https://quimicaifbacampusvca.github.io/mapaderiscoslaboratorio/` no perfil que já possui projetos, **sem limpar armazenamento local**.
2. Exportar um backup JSON antes de qualquer ação que substitua o projeto.
3. Verificar a atualização do PWA em Configurações e recarregar apenas quando permitido pela interface.
4. Identificar navegador, versão, sistema operacional, viewport, escala de fonte e versão do cache para cada ocorrência.

## Cenários obrigatórios (repetir claro/escuro, contraste normal/alto e leitura simples ligada/desligada)

| ID | Cenário com conteúdo real | O que verificar |
| --- | --- | --- |
| H01 | Home com autosave e data/hora | Metadados legíveis; etiquetas com texto contrastante e sem corte |
| H02 | Home com cópia anterior | Aviso e botão de restauração legíveis; foco visível |
| H03 | Biblioteca com ao menos dois projetos | Cartões, datas, revisões, ações e confirmação de exclusão |
| H04 | Modelos de Laboratório aberto | Superfícies coerentes com tema; títulos, legendas e botões de cada cartão |
| H05 | Confirmação “Preservar o projeto anterior” | Texto, ações secundárias, ação destrutiva, foco, Escape |
| H06 | Editor com pelo menos 8 objetos e 4 riscos | Árvore de camadas, metadados, contador, resumo, seleção, bloqueio |
| H07 | Relatório de conformidade | Totais, status verde/amarelo, itens conformes/pendentes, cartão e rodapé |
| H08 | Configurações > Acessibilidade | Controles operáveis por teclado, restauração e persistência |
| H09 | Diálogo de importação e feedback | Legibilidade de mensagens, erros, nome de arquivo e fechamento |
| H10 | Seletor de tipo de área | Menu de opções, destaque, item selecionado, setas, Tab, Enter e Escape |

## Matriz mínima

- Viewports: 320×568, 390×844, 768×1024, 1024×768 e 1440×900.
- Texto: 100%, 150% e 200%.
- Temas: claro e escuro.
- Alto contraste: desativado e ativado.
- Leitura simples: desativada e ativada.
- Visão de cores: padrão, protanopia, deuteranopia, tritanopia e acromatopsia.
- Navegadores: Chromium/Edge, Firefox e Safari/WebKit, quando disponíveis.
- PWA: janela instalada, janela normal, primeira abertura online e recarga offline.

**Critério visual:** os rótulos e estados permanecem legíveis e semanticamente distinguíveis sem depender apenas de cor. Para texto normal, buscar contraste computado de pelo menos 4,5:1 e para texto grande 3:1; estados de foco precisam permanecer evidentes. Simulações de daltonismo não comprovam a experiência de todos os usuários.

**Critério funcional:** nenhum ajuste visual altera coordenadas, escala métrica, objetos, dados JSON v4, autosave ou biblioteca IndexedDB. Modal deve prender foco, aceitar Escape quando cabível, devolver foco à origem e não esconder ações por trás de sobreposições.

## Registro de falhas

Guardar: `ID do cenário | navegador | viewport | tema | contraste | leitura | fonte | filtro | versão/cache | esperado | observado | captura | gravidade`.

Gravidade:
- **Bloqueante:** ação inacessível, perda de dados, diálogo impossível de fechar, texto crucial ilegível.
- **Alta:** estado selecionado/risco sem diferenciação, foco perdido, informação importante cortada.
- **Média:** contraste insuficiente em metadado, desalinhamento, rolagem excessiva.
- **Baixa:** detalhe cosmético sem impacto funcional.

## Situação da validação automatizada anterior

Os relatórios `RELATORIO-UIUX-0.9.3.3.md` e `RELATORIO-UIUX-0.9.3.3.1.md` registram simulações em Chromium isolado, incluindo 384 estados na última rodada. Esses resultados **não substituem** a homologação ao vivo no GitHub Pages, testes completos de leitor de telas, Firefox/WebKit ou validação perceptiva depois de filtros de visão de cores.

**Decisão:** somente marcar a série de acessibilidade como homologada após execução e registro dos casos acima. Não apagar os projetos para realizar os testes.
