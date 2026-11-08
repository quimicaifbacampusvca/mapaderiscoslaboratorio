# C01/E03 — restauração de redimensionamento no próprio Canvas

**Escopo:** preservar a interação do mapa anterior com seleção de um objeto livre e arraste das alças (8 lados/cantos), sem usar o painel de propriedades.

**Situação:** branch isolada para revisão e testes; não integrar a main sem homologação e aprovação.

## Contrato

1. Objeto **desbloqueado e visível**, quando selecionado sozinho, exibe oito alças e controle de rotação; o arraste modifica largura/altura diretamente na planta.
2. Objetos bloqueados/ocultos não são redimensionados; seleção múltipla continua usando movimentação conjunta, não resize do grupo.
3. Alças usam captura do ponteiro durante a edição, inclusive se o ponteiro sair da área Canvas; em telas touch, a manipulação não deve acionar a rolagem do navegador.
4. Mudanças em objetos girados são calculadas nos **eixos locais** da forma, com a borda oposta ancorada. As dimensões não podem ficar abaixo de 0,1 m.
5. Histórico desfazer/refazer, salvamento local, exportação/importação JSON v4 e indicadores de segurança devem continuar íntegros.
6. A verificação E2E cobre Chromium/Firefox/WebKit em 1440×900 e 390×844. As viewports não substituem aparelhos físicos.

## Justificativa técnica

Antes, `state.drag.type === "resize"` calculava `dw/dh` nos eixos globais sem considerar `o.rot`. Isso causava comportamento inadequado em objetos rotacionados. Alças desenhadas em 8×8 px e raio de captura 10 px também tornavam o gesto difícil no mobile, sem `touch-action: none` no Canvas.

## Fora do escopo

- Alteração de esquema de armazenamento, modelo JSON, geometria normativa, campos do painel de propriedades, regras de objetos bloqueados e comportamento da visão geral.
- Não resolver por este PR os erros paralelos da matriz responsiva H01–H10 (diálogo de acessibilidade em 200%); essa correção deve seguir no PR #3.
