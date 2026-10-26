# QuímiX — Correção de rumo do desenvolvimento das 5 identidades no Blender

**26/10/2026 · Direção de arte / implementação**  
**Status:** diagnóstico e redefinição de critérios para uma nova geração **real** no Blender, não cinco renders aprovados.

## Diagnóstico da entrega anterior

Após confrontar a proposta acordada (escopo-mestre e Quími A da V7) com o HTML e o script da comparação:

1. **A comparação foi predominantemente vetorial.** O HTML exibiu SVGs estilizados e etapas descritivas, não os renders da aplicação Blender.
2. **O script `variacoes_cinco.py` produz um `PNG` por tema na cena no frame 120** e salva o `.blend`; não renderiza a progressão de 210 frames nem uma amostragem representativa da construção.
3. Os elementos exclusivos de cada tema foram implementados **principalmente como objetos estáticos** (órbitas, esferas, rede, gotas, retículo), adicionados a uma cena-base comum. A diferenciação ficou visualmente periférica.
4. A câmera, escala relativa entre X e Quími, volume, composição cromática e acabamento não passaram por comparação entre **cinco cenas Blender realmente renderizadas**.
5. O fluxo de uma experiência química para a construção do X e da palavra foi substituído por logotipo quase pronto com efeitos ao redor.

**Decisão:** não utilizar o HTML anterior como referência visual final. Não homologar materialidade ou movimento a partir da prévia vetorial. Preservar o X oficial, Quími A (V7), o acento molecular e a opção de fechamento na marca atual.

## Novo conceito comum — matéria → X → QuímiX

Cada versão deverá ter três momentos de leitura, com tomadas que mostrem volume físico sem comprometer a fidelidade do quadro final:

- **I. Matéria** (0–2,0 s): o fenômeno específico ocupa a cena; o X não deve estar simplesmente pronto atrás dele.
- **II. Organização** (2,0–4,2 s): movimentos e geometria do tema **constroem** o corpo, as conexões e os seis nós do X. Intensificação cromática, relevo e contato visual entre partes móveis.
- **III. Assinatura** (4,2–7,0 s): a energia/estrutura percorre a tipografia A, desenhando Q, u, í, m, i e o acento. Câmera torna-se frontal e o sistema estabiliza numa **assinatura temática**. Uma segunda finalização opcional produz a **marca publicada** do programa sem deformação.

## Linguagens tridimensionais exclusivas

### Reação — ciano `#00E5FF`, magenta `#FF2A8D`, violeta `#7B61FF`

**Objetos em movimento:** esferas reagentes com reflexos duplos, trilhas tubulares, ligações e seis nós centrais. **Ação principal:** entradas cianas percorrem ramais, ganham aceleração perto do centro, convergem e comprimem uma região emissiva; dela se expandem volumes cromáticos que revelam o chanfro do X. A energia então se propaga para os produtos magentas. **Assinatura:** os rastros de transformação escrevem Quími, com acento-vetor retornando a sua posição. **Diferença essencial:** transformação reagentes → produtos observável, não simples flash ou troca de cor.

### Atômica — azul-luz `#63C7FF`, dourado `#FFD166`, turquesa `#47E5BC`

**Objetos em movimento:** núcleo dourado estilizado, nuvens de campo semitransparentes e arcos luminosos, partículas secundárias. **Ação principal:** uma distribuição espacial se reorganiza; arcos aparecem em diferentes planos de profundidade e são recolhidos para as duas diagonais do X, sem reivindicar descrição literal dos orbitais eletrônicos. **Assinatura:** linhas energéticas traçam o Quími, acento como emissão breve. **Diferença essencial:** centro dourado e campos fluidos dominam a construção, não moléculas coloridas aleatórias.

### Ligações — verde `#20C997`, azul `#3A86FF`, lima `#A8E063`

**Objetos em movimento:** unidades de ligação arredondadas, terminais, segmentos tubulares com chanfro e pontos de contato. **Ação principal:** nós aproximam-se por trajetórias assíncronas; ligações crescem entre eles e a rede vai se reorganizando, até que seus segmentos integram a topologia original do X. **Assinatura:** o traço contínuo de conectores revela a tipografia A. **Diferença essencial:** o sentido de conexão física/geométrica determina a animação — nenhuma “órbita” genérica.

### pH / Soluções — coral `#EF476F`, violeta `#9D4EDD`, azul `#3A86FF`

**Objetos em movimento:** dois corpos líquidos estilizados, gotas com geometria, meniscos, camadas ópticas e frentes cromáticas. **Ação principal:** fluxos se aproximam em profundidade, seu contato percorre o X como mudança cromática localizada e a superfície transmite essa passagem às letras de Quími. **Assinatura:** a gota do acento se estabiliza no formato agudo. **Diferença essencial:** morfologia líquida e transmissão de cor, não círculos coloridos. As cores são estilização de indicadores, sem escala pH universal.

### Cristalina — azul cristal `#5BC0EB`, turquesa `#64DFDF`, roxo `#7B2CBF`

**Objetos em movimento:** malhas espaciais, vértices, hastes estruturais e facetas com normais definidas. **Ação principal:** nucleação de pontos, crescimento progressivo de arestas/faces em camadas Z, conexão para produzir a silhueta X extrudada; reflexos revelam suas bordas. **Assinatura:** a estrutura facetada perde excesso de refração e desenha Quími. **Diferença essencial:** crescimento volumétrico espacial, não um retículo imóvel atrás do logo. Não alegar um sistema cristalino específico.

## Requisitos técnicos obrigatórios

- Base geométrica: X SVG do programa (12 vértices, conexões laterais, anéis e pontos separados); Quími A V7 como curvas autorais; acento em geometria própria.
- Escala comum: mesmo bounding-box do lockup em cinco cenas, antes de testar efeitos.
- Cena: Blender, geometria real, chanfro visível em vista 3/4, sombreado e materiais PBR, sem substituir o Blender por SVG na etapa de aprovação 3D.
- Movimento: 7 s × 30 fps = 210 frames, com chaves e trajetórias distintas por tema. A versão reduced-motion pode abrir no quadro final.
- Render mínimo por identidade: **cinco frames chave** (matéria inicial, convergência, corpo parcialmente construído, revelação do Quími, assinatura), **uma sequência animada** e um `.blend` editável.
- HTML comparativo: **apenas** mostrar sequências ou imagens efetivamente renderizadas no Blender, com scrub, pausa, tema e comparação lado a lado. O WebAssembly (se necessário) governa cinética; WebGL/WebGPU desenha uma cena exportada glTF/GLB; arquivo `.blend` e PNG não são uma cena WebGL funcional por si sós.
- Gating: não declarar Blender renderizado sem arquivos comprovados do workflow, nem homologar fidelidade sem inspeção visual dos marcos.
- Regra de interface: o modelo deve ocupar a área central como protagonista; textos e fichas não podem comprimir o logo em uma miniatura plana.

## Procedimento de verificação para a próxima implementação

1. Confirmar execução GitHub Actions e baixar artefatos reais do Blender; quando ausentes, relatar o bloqueio em vez de usar imagens simuladas.
2. Validar **Reação**, a cena mais madura, por cinco frames Blender e assinatura final. Ajustar luz, câmera, espessura e proximidade do Quími.
3. Congelar câmera, malha comum, envelope de brilho e régua tipográfica; duplicar estrutura de composição para os demais temas.
4. Implementar as quatro animações restantes com **cinemáticas próprias**; exigir que seja possível reconhecer o tema mesmo em cinza.
5. Comparar as cinco com mesmo enquadramento e com o X canônico em referência lado a lado.
6. Gerar HTML **somente depois** dos renders; marcar explicitamente o que foi testado em Blender, renderização no navegador e fallback.

**Não alterar `main`.** Todas as correções permanecem na branch `design/quimix-acento-blender` até aprovação visual.