# QuímiX — estudo do acento do í (Blender 3D)

**Situação:** conceito em estudo, sem aprovação final.  
**Origem:** `laboratoriovirtual.zip`, `index.html` e `style.css`; manual `Quími_X_Digital_Laboratory.pdf` (especialmente pp. 5–6, 11–13).

## Marca de origem — dados comprovados

- A palavra visual no cabeçalho é `Qu` + `ı` (U+0131, i sem ponto) + SVG `i-bond-accent` + `mi`. O nome acessível completo permanece `QuímiX`.
- O SVG atual usa uma linha diagonal de (4,16.5) a (15,4.5) em uma viewBox 20×20, com gradiente ciano `#00e5ff` → magenta `#ff2a8d` e dois círculos nas extremidades.
- A regra CSS da marca usa `Space Grotesk` 700 (`--font-display`). O acento usa `top:-0.5em; width:0.85em; height:0.85em; left:50%; transform:translateX(-15%)`.
- O manual concebe três fases: repouso, transformação e vetor de ligação (p. 5), e relaciona geometricamente o acento ao símbolo X (p. 6).

## Problema identificado

A leitura deve ocorrer nesta ordem: (1) reconhecer a palavra e a vogal acentuada; (2) perceber o detalhe químico; (3) notar a animação. O acento atual enfatiza dois nós grandes, podendo se parecer mais com um símbolo autônomo que com acento agudo em tamanhos pequenos.

## Exploração de direções

**A — Acento vetorial:** haste única, extremidades limpas e nó energético muito discreto. Preserva o formato tipográfico.

**B — Ligação molecular refinada:** manter dois nós, agora menores, com espessura e brilho reduzidos; máxima continuidade com o SVG original.

**C — Acento de energia:** geometria de acento convencional, material prismático translúcido com energia deslocando-se internamente apenas em estado ativo.

**Direção preferencial para prototipação: A + C.** O repouso deve parecer acento agudo inequívoco; o efeito energético aparece por interação ou em introdução breve, sem deslocar a marca.

## Regras de produção

1. Não modificar o nome acessível `QuímiX` nem substituir o `í` visual por ponto convencional.
2. Manter o ângulo e a posição compatíveis com a fonte original; calibrar com a palavra completa, não apenas com o caractere isolado.
3. Evitar nós, halo e perspectiva 3D que ampliem demais a área visual do acento.
4. Usar Blender para modelagem/materialização em curva e geração de render; exportar versões SVG/PNG/WebP para aplicação 2D. Preservar um fallback estático, sem exigir WebGL.
5. Estados: repouso estático (alto contraste); ativação breve; redução de movimento sem animação. Evitar brilho excessivo em claro/escuro.
6. Validar pelo menos em 16, 24, 32 e 64 px equivalentes; zoom 200%, alto contraste e mobile.
7. Sem alterações na `main` ou no código em produção antes da comparação visual e aprovação.

## Critérios para aprovação

- Palavra inteira legível imediatamente como **QuímiX**.
- Acento reconhecível em estado estático e escala reduzida.
- Associação estética com o X sem confusão entre letras.
- Nenhuma mudança na posição das demais letras ou perda de legibilidade durante a animação.
- Render 3D coerente com a linguagem do manual, mas com versão 2D reproduzível e acessível.
