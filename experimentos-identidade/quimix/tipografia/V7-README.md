# QuímiX V7 — tipografia A refinada e X original

**Situação:** protótipo de aprovação; não substitui a marca publicada.

## Objetivo
Aplicar a direção tipográfica A aprovada ao nome **Quími**, com cauda do Q mais fluida, entreletras refinado, acento molecular reconhecível, profundidade construtiva temporária e convergência para o **X SVG original** do simulador.

## Arquivos
- `../quimix_x_webassembly_3d_v7.html` — prévia com WebAssembly cinético integrado, WebGL 3D quando disponível, fallback Canvas, comparação Versão A/Marca atual e controles de câmera/tempo.
- `quimi_a_refinada_v7.svg` — geometria de construção dos glifos e acento.
- `../blender/quimix_tipografia_a_v7.py` — scripts de curvas 3D por glifo, keyframes, câmera e malha original do X.

## Movimento / ordem
1. Bolinhas cianas ativam as entradas.
2. Deslocamento e convergência até o núcleo do X.
3. Formação volumétrica e pico cromático.
4. Formação dos produtos magentas.
5. Construção ordenada do nome: Q → u → í → m → i, extrusão temporária e integração com X.
6. Em repouso, efeitos de construção saem da cena. A opção **Versão A** mostra a nova proposta; **Marca atual** permite comparar a palavra antiga com o mesmo X.

## Validação
JavaScript passou em verificação sintática. O WASM embutido passou em validação por Node.js (assinatura `0x51584D58`, rotas inicial/final, pulso final). A composição estática A+X foi renderizada via CairoSVG; **não é uma renderização Blender**. O script Blender local completo foi validado sintaticamente; ainda não houve renderização 3D por ausência do aplicativo Blender no ambiente. O teste automatizado do HTML no Chromium foi bloqueado pela política local `ERR_BLOCKED_BY_ADMINISTRATOR`; validar visualmente em navegadores reais antes da homologação.

## Regra de segurança do projeto
Nenhum arquivo na `main` foi alterado. Não substituir o logotipo vigente sem aprovação visual explícita da nova composição A+X.
