# QuímiX — V6: relevo e volume cinético

Estudo independente da versão em produção. A V6 mantém a mesma assinatura vetorial da V5 e não modifica o aplicativo Mapa de Riscos.

## Implementado no visualizador HTML

- Malha WebGL do X com chanfros, frente, verso e paredes laterais, usando os 12 vértices do símbolo do programa.
- Normais para os materiais, iluminação de duas fontes, reflexos especulares e efeito Fresnel.
- Ligações tubulares e anéis com maior seção.
- Esferas ciano e magenta com superfícies reflexivas, núcleos e halos, com rastros deslocados no tempo calculados pelo mesmo WebAssembly.
- Controle **Volume** de 90 a 190%; valor inicial 145%.
- Quadro final: camada WebGL/Canvas desaparece, mantendo literalmente o bloco SVG oficial da V5 (palavra, acento e X).
- Fallback Canvas 2D identificado quando WebGL não está disponível.

## Blender

Preparado localmente um script V6 (`quimix_x_volume_v6_blender.py`) com extrusão e bevel mais profundos, tubos maiores, materiais PBR, luz de contorno, câmera inclinada no ponto de maior relevo e esferas de rastro com keyframes. **O Blender não foi executado neste ambiente**, portanto a cena .blend e o render Blender ainda não foram homologados.

## Verificação

- Sintaxe JavaScript e malha do X validadas (168 vértices, 92 triângulos, sem valores inválidos).
- Sintaxe do script Python validada.
- No Chromium: WebAssembly ativo, sem erros de JavaScript, reprodução por tempo, ajuste de volume e assinatura final verificados.
- O ambiente não disponibilizou WebGL acelerado: o navegador ativou fallback Canvas 2D.
- Nenhuma alteração no SVG do quadro final em relação à V5.

## Prévia

Arquivo: [quimix_x_webassembly_3d_v6.html](./quimix_x_webassembly_3d_v6.html).

**Critério antes de produção:** testar WebGL num navegador com contexto gráfico funcional, executar o projeto Blender, avaliar os keyframes com a marca oficial e homologar fidelidade do último quadro.
