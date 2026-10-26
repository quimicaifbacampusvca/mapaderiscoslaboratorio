# QuímiX — Reação R8, cena 3D de referência

Este projeto corrige o problema apontado na análise das cinco identidades: em vez de objetos temáticos estáticos ao redor de uma logo pronta, a cena anima a construção do **X oficial** e da **tipografia A V7**.

**Entregas configuradas:** `QuimiX_REACAO_R8.blend` (210 quadros a 30 fps), `01_reagentes.png`, `02_convergencia.png`, `03_nucleo_e_X.png`, `04_quimi_produtos.png`, `05_assinatura_final.png`, `comparativo_renderizado.html` e `manifest-render.json`.

## Sequência

1. **Quadro 20:** reagentes cianos, materiais e primeiros anéis de entrada.
2. **Quadro 64:** convergência e propagação pelos tubos da rede esquerda.
3. **Quadro 110:** formação do X extrudado e pulso da síntese.
4. **Quadro 160:** rede dos produtos e revelação progressiva das letras.
5. **Quadro 210:** corpo do X original, seis nós internos, conexões, acento e Quími A estabilizados.

O X tem 12 vértices reais; não são barras cruzadas genéricas. A cena inclui material metálico, chanfro geométrico, tubos bevel, núcleos esféricos, rim lights ciano/magenta, câmera 3/4 com aproximação e alinhamento frontal, animação Bézier e tipografia desenhada como curvas reais.

## Executar

```bash
blender -b --factory-startup -t 4 --python reacao_3d_refinada.py -- --output renders-r8 --samples 20 --resolution 1024
python3 montar_quadro_reacao.py renders-r8
```

A renderização é feita exclusivamente pelo Blender/Cycles. O HTML só é produzido depois de validar os cinco arquivos PNG gerados e o `.blend`; não contém substitutos SVG. O projeto **não descreve uma reação química quantitativamente correta**, e a tipografia A permanece uma proposta experimental, distinta da marca atualmente publicada.

**Estado local antes do Actions:** código e validação sintática, sem render local por falta do executável Blender. Qualquer resultado de render só deve ser declarado após checagem dos artefatos do runner.