# QuímiX — animação do X em Blender 3D

**Proposta isolada:** reagentes ciano → convergência no X → propagação → produtos magenta. Não modifica o aplicativo nem o branch `main`.

O movimento deve ser **direcional**: o magenta não converge junto com o ciano; só surge após a transformação no centro.

| Quadros (24 fps) | Fase |
|---|---|
| 1–23 | Surgem as bolinhas cianas nas conexões à esquerda |
| 24–53 | Partículas cianas avançam pelas ramificações e convergem para o centro |
| 54–70 | A reação ilumina a região central e revela a placa do X |
| 71–103 | O fluxo se expande pela direita e ativa os produtos magentas |
| 104–120 | Estabilização no símbolo original, com luz reduzida |

**Fonte geométrica:** `laboratoriovirtual/index.html` (SVG `.brand-mark-icon`, viewBox 900×650). Preservar silhueta de 12 vértices, seis nós internos, ramificações externas esquerdas, anéis concêntricos, núcleo violeta, estrutura direita bifurcada e ligação dupla à direita. Os nós da marca original devem conservar as cores originais no repouso; a energia azul pode ser transitória sobre estruturas que têm outras cores estáticas.

**Implementação:** usar Blender com `bpy` para modelar um corpo extrudado em grafite, curvas 3D de ligações, esferas emissivas e anéis toroidais. Animar trajetórias por keyframes com materiais ciano (`#00E5FF`) e magenta (`#FF2A8D`), câmera, luzes e pontos de edição no timeline. Exportar `.blend` editável, PNGs de quadros de controle e MP4 via FFmpeg. A presença desses arquivos no repositório não significa que a cena tenha sido renderizada e homologada.

**Manual de identidade:** Quími_X_Digital_Laboratory.pdf, principalmente pp. 5–7, 10–12. A narrativa cinética é uma proposta de design, não um mecanismo químico real.

A palavra Quími e o acento no í **não entram** nesta etapa. Primeiro homologaremos a construção 3D do X.

Para execução local do script Blender: `blender -b --factory-startup --python blender/quimix_reacao_x.py -- --output render --still`.
