# QuímiX — Estudo tipográfico 01

**Status:** exploração preliminar, não homologada. A marca da aplicação e a V6 permanecem intactas.

## Material de referência
- Marca original extraída do arquivo `laboratoriovirtual.zip`, especialmente `index.html`: composição Quími + X, tipografia Space Grotesk 700, acento vetorial de ligação com nós ciano e magenta, X molecular em SVG.
- Manual `Quími_X_Digital_Laboratory.pdf` (15 páginas): páginas 2–4 abordam neo-minimalismo tipográfico e integração entre símbolo e palavra; páginas 5–6 detalham o acento de ligação e a geometria relacionada ao X; páginas 10–13 abordam o espaçamento modular e o comportamento dinâmico.

## Propostas
- **A — Traço fluido:** letras redesenhadas com traços finos e ritmo aberto; maior proximidade ao neo-minimalismo proposto no manual.
- **B — Equilíbrio molecular (preferencial):** curvas mais encorpadas, mantendo legibilidade em interface, mas afastando-se do peso estático original.
- **C — Estrutura escultural:** contornos mais espessos, apropriados para criação volumétrica com curvas, extrusão e chanfros no Blender.

O protótipo `estudo_01.html` é autocontido, preserva o X real em SVG e usa **curvas vetoriais autorais** para construir Q, u, í, m, i — não simula fontes variando apenas propriedades CSS. Possui comparação com a marca atual, guias de construção, controles de peso e profundidade *visual simulada*.

## Condições para evolução
1. O contraste entre o Quími e o X deve ser testado em contextos claro/escuro e tamanhos pequenos.
2. O acento precisa ser imediatamente reconhecível como acento agudo; sua animação deve continuar conectada ao mecanismo molecular.
3. Revisar morfologia e espaçamento de Q/u/í/m/i antes de converter os traçados definitivos em curvas Blender.
4. Somente após aprovação, executar no Blender 3D com bevel/extrusão/materialização, renderizar e verificar paridade com a versão web.
5. A assinatura oficial do aplicativo permanece a atual até aprovação expressa da nova proposta.

**Nota:** o HTML não é um render Blender; o controle de profundidade faz uma visualização preparatória de extrusão. Nenhum arquivo de fonte tipográfica está incluído.
