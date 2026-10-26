# QuímiX — Escopo-mestre das cinco identidades 3D

**Documento de concepção técnica e artística — versão 1.0 (26/10/2026)**  
**Status:** escopo proposto; não há renderizações homologadas das cinco identidades.  
**Destino de desenvolvimento:** branch `design/quimix-acento-blender`, pasta `experimentos-identidade/quimix/identidades/` do repositório `quimicaifbacampusvca/mapaderiscoslaboratorio`. Nenhuma alteração no `main` ou no programa em produção.

## 1. Referências e decisões anteriores

- **Identidade publicada:** `laboratoriovirtual.zip` → `index.html`, estilos e SVG do X. O nome acessível é *QuímiX*. A tipografia publicada utiliza Space Grotesk 700. O acento é composto por `ı` (i sem ponto) e SVG próprio com haste diagonal e dois nós em ciano/magenta.
- **X oficial:** silhueta vetorial de 12 vértices, conexões e círculos nas extremidades, estrutura molecular interior, anéis concêntricos, pontos centrais distintos, ligações duplas e acentos cromáticos ciano/magenta. O X não será substituído por um X genérico ou por uma letra tipográfica simples.
- **Tipografia experimental:** a **versão A** aprovada como direção na V7 foi refinada em `quimi_a_refinada_v7.svg`. Ela é a base do estudo de movimentação e extrusão tipográfica; a substituição da fonte em produção **não está homologada**.
- **Manual `Quími_X_Digital_Laboratory.pdf`:** páginas 2–4 sustentam a abordagem neo-minimalista e a relação nome/símbolo; páginas 5–6 apresentam acento-vetor e orientação do X; páginas 7–8 apresentam materialidade cromática e legibilidade; páginas 9–10, espaço negativo e grade modular; páginas 11–13, animação e transições cinéticas. O manual orienta linguagem visual, não comprova a física de todos os efeitos temáticos aqui propostos.
- **V6/V7:** os protótipos HTML/WASM e scripts de Blender são referências de interação, ainda não comprovantes de renderização Blender/Cycles nem de paridade WebGL completa.

## 2. Sistema de identidade: o que muda e o que não muda

**Imutável por padrão:** nome e leitura “QuímiX”; reconhecimento do X original; estrutura essencial da silhueta e suas conexões; ordem de leitura palavra → símbolo; acessibilidade da assinatura; possibilidade de convergência final 2D para a marca publicada.

**Variável por tema:** cor dos reagentes/nós e do brilho, iluminação, materiais, velocidade/percurso dos componentes, efeitos de ligação, montagem da palavra e comportamento transitório do acento, planos de fundo e microambiente.

**Duas finalizações para cada tema:**
1. **Final temático** — cor e material temáticos, ainda dentro da geometria reconhecível; serve a vinhetas, seções e campanhas.
2. **Final canônico** — composição oficial do programa sobreposta com geometria, tipografia, posicionamento e acento fiéis, enquanto o 3D perde emissão/extrusão. Esta é a saída-padrão enquanto não for aprovada outra identidade oficial.

A versão A da tipografia é um **caminho experimental**; a escolha entre “Quími A temático” e “marca publicada canônica” deverá ficar configurável no projeto, nunca silenciosamente substituir a segunda.

## 3. Linguagem e padrão de animação comum

**Duração-mestre proposta:** 7,0 s; Blender em 30 fps = 210 quadros. Visualizador web calcula tempo contínuo a partir de `t` em segundos (e não de uma suposição de fps). Em modo reduzido, abre diretamente na assinatura final, sem deslocamento, pulsos ou partículas.

| Janela temporal | Função | Obrigatório |
|---|---|---|
| 0,00–1,20 s | Ativação da matéria temática | Forma/energia inicial identificável |
| 1,20–2,80 s | Organização e aproximação | Trajetórias distintas, aceleração/desaceleração suave |
| 2,80–4,20 s | Manifestação do X | Corpo tridimensional e topologia fiel |
| 4,20–5,50 s | Construção de “Quími” | Versão A com stroke reveal, volume e acento em ligação |
| 5,50–6,40 s | Síntese da assinatura | Agrupamento, câmera frontal, luz recuando |
| 6,40–7,00 s | Finalização | Marca temática ou canônica nítida e legível |

**Ritmo:** curvas Bézier/ease-in-out com antecipação e desaceleração; nunca teletransportar objetos. Colisões e pequenas oscilações são intencionais e contidas; sem flashes de alta frequência, tremor de câmera ou brilho capaz de ofuscar as letras. Transições entre materiais devem ser suaves.

**Câmera:** abertura 3/4 controlada (yaw até ~18°, pitch até ~10°), avançando gradualmente para vista frontal; final 100% alinhado ao SVG 2D de referência. Usar câmera-perspectiva para drama com plano de finalização no espaço de tela (a superposição do SVG evita distorções).

**Padrão de volume (medidas relativas; escala final será calibrada em Blender):** altura do X = 2,0 BU; extrusão em 0,15–0,28 BU conforme versão; bevel de 0,018–0,045 BU; tubos com raios 0,012–0,030 BU; nós esféricos entre 0,05–0,10 BU. Estas são faixas de teste, não geometrias homologadas. Ajustar Bevel, Normals e subdivisão para não deformar os 12 vértices.

**Acento comum:** imediatamente reconhecível como agudo quando imóvel; pode atuar como vetor, elétron, ponte, gota ou faceta *durante* a animação; termina na forma canônica correspondente à assinatura escolhida.

## 4. Identidades por tema

### 4.1 QuímiX — REAÇÃO / TEMPERATURA
**Mensagem:** reagentes se transformam em produtos; a energia ativa a estrutura, mas não altera sua topologia final.

**Cores e papéis:** ciano elétrico `#00E5FF` (entrada/reagentes); magenta `#FF2A8D` (saída/produtos); violeta `#7B61FF` (estado transitório); grafite `#232A34` (corpo do X); branco frio `#EAF7FF` (reflexos). Contraste obrigatório sobre fundos claros e escuros.

**Cena Blender:** 4 esferas de entrada com superfícies cerâmicas/emissivas e brilho volumétrico controlado; ramos e anéis concêntricos como curvas bevel; núcleo de reação com envelope de emissão; X grafite extrudado e chanfrado; conexões internas preservadas; 4 esferas/produtos na saída com coloração magenta.

**Animação específica:** esferas cianas percorrem caminhos independentes, convergem para a região central; pulso transitório gera relevo e realce bicolor na superfície do X; energia se propaga pelas ligações à direita; surgem produtos magentas; câmera recua e material perde emissão para assentar na assinatura. A “temperatura” será representada por intensidade energética artística, **não por uma escala termométrica quantitativa**.

**Quími e acento:** traços nascem como trilhas de energia deixadas pela síntese; acento é pequena ponte ativa ciano→magenta. Na finalização, o acento volta ao seu desenho regular.

**Marcos visuais:** ciano antes de magenta; separação clara entre núcleo e dois pontos centrais; ausência de explosão que esconda o X.

### 4.2 QuímiX — ATÔMICA
**Mensagem:** organização da matéria em escalas atômicas; equilíbrio entre centro e distribuição eletrônica.

**Cores e papéis:** azul profundo `#1F4E79` (ambiente), azul-luz `#63C7FF` (elétrons/traços), dourado `#FFD166` (núcleo), turquesa `#47E5BC` (estado excitado), cinza espacial `#2F3742` (estrutura), branco estelar `#F4F9FF` (tipografia).

**Cena Blender:** núcleo estilizado com pequenas partículas douradas e materiais metálico/cerâmico; campos translúcidos e arcos orbitais azuis como expressão *simbólica*; elétrons luminosos com caudas suaves; X emergindo de arcos convergentes e conservando a silhueta oficial.

**Animação específica:** campo eletrônico surge por densidade/linhas; trajetórias ganham coerência ao redor do núcleo; dois eixos diagonais convergem para materializar o X; a palavra é revelada por linhas de percurso, com acento como transição luminosa; final em azul profundo/dourado ou marca canônica.

**Nota científica:** órbitas circulares de elétrons não devem ser apresentadas como descrição literal de orbitais de átomos multieletrônicos. Priorizar nuvens/probabilidade abstratas ou rotular efeitos orbitais como metáfora visual.

**Marcos visuais:** sem planeta girando ao redor de uma bola como “modelo exato”; brilho dourado secundário para não competir com o X.

### 4.3 QuímiX — LIGAÇÕES QUÍMICAS
**Mensagem:** as conexões criam estruturas estáveis e inteligíveis.

**Cores e papéis:** verde ligação `#20C997` (nós A), azul ligação `#3A86FF` (nós B), verde-lima `#A8E063` (ligação ativa), cinza molecular `#4A5568` (barras/corpo), azul petróleo `#1B4965` (profundidade), branco técnico `#F7FBFF` (letra).

**Cena Blender:** unidades esféricas com terminações e materiais em duas famílias; tubos Bevel com múltiplos raios para diferentes pesos de ligação; guia de linhas finas; X como rede organizada com conectores originais e segmentos de luz que percorrem as arestas.

**Animação específica:** pontos separados se aproximam, conexões surgem de modo encadeado (não aparecem de uma só vez), a topologia do X se fecha com pequena deformação elástica e retorno à forma original; palavra Quími se desenha por continuidade de ligações; acento é uma ponte inclinada com par de nós.

**Nota científica:** evitar sugerir que ligação iônica, covalente e metálica são a mesma estrutura. O primeiro protótipo é **abstrato/conectivo**; subvariantes científicas específicas só após seleção do fenômeno e validação.

**Marcos visuais:** conexões não devem encobrir o Q nem reduzir legibilidade do acento; a dupla ligação do SVG permanece identificável.

### 4.4 QuímiX — pH / SOLUÇÕES
**Mensagem:** soluções se misturam; indicadores revelam transformações cromáticas.

**Cores e papéis:** vermelho ácido `#EF476F` (entrada cromática A); violeta indicador `#9D4EDD` (mistura/transição); azul básico `#3A86FF` (entrada cromática B); verde equilíbrio `#8AC926` (estágio opcional); amarelo de transição `#FFD166` (realce); branco líquido `#F8FCFF` (reflexo).

**Cena Blender:** gotículas com malha arredondada e shader de transmissão/reflexo; superfícies de mistura por *shader/morph* para prototipagem, evitando simulação de fluidos como dependência do navegador; trilhas capilares; X de vidro fosco/grafite; iluminação colorida sutil por baixo.

**Animação específica:** dois fluxos cromáticos distintos aproximam-se; contato inicia propagação de cor pelo corpo do X; o gradiente passa por violeta com bordas fluidas e sem “arco-íris” arbitrário; Quími nasce por meniscos luminosos; acento é gota inclinada que se endireita como acento agudo no final.

**Nota científica:** não atribuir universalmente uma cor a um pH sem escolher o indicador e as condições. A paleta representa **uma linguagem de indicadores**, e não escala quantitativa. Se uma futura versão invocar repolho-roxo, confirmar as cores com o modelo/experimento adotado.

**Marcos visuais:** nada de bolhas excessivas, manchas sobre letras ou efeitos de cor que prejudiquem o contraste e a leitura.

### 4.5 QuímiX — CRISTALINA
**Mensagem:** organização espacial, crescimento geométrico e materialidade da matéria sólida.

**Cores e papéis:** azul cristal `#5BC0EB` (arestas), turquesa mineral `#64DFDF` (faces), roxo facetado `#7B2CBF` (profundidade), cinza metálico `#495057` (armação), branco prisma `#F1F7FF` (reflexos), ciano gelo `#A9F0FF` (refração discreta).

**Cena Blender:** retículo de nós e barras construído por Geometry Nodes; crescimento de células simples como **abstração geométrica**; X extrudado com bevel mais pronunciado e superfícies facetadas, porém com silhueta 12-vértices intacta; cristal prismático pequeno para acento; shader material translúcido ajustável.

**Animação específica:** vértices aparecem como núcleos de crescimento; arestas e planos surgem ordenadamente; camadas de rede giram suavemente em profundidade e se alinham no X; o Quími é desenhado em linhas lapidadas com pouca espessura; refrações se recolhem e deixam a marca limpa.

**Nota científica:** uma malha cúbica genérica não representa todos os materiais cristalinos. A primeira identidade é uma metáfora do ordenamento. Se for mostrar CFC, CCC ou HC, exigir parâmetros e material de referência especificados.

**Marcos visuais:** não alterar proporções do X com prismas ou detalhes facetados; reduzir refração no modo navegador.

## 5. Construção técnica no Blender

### 5.1 Organização dos ativos

```text
QuimiX_MASTER.blend
  00_REFERENCE/   svg_x_original, quimi_A_V7, wordmark_publicada
  01_GEOMETRY/    x_body, x_bevel, inner_bonds, rings, nodes, quimi_curves, accent
  02_RIG/         camera, focus_target, action_controllers, effect_locators
  03_MATERIALS/   graphite, glass, chrome, emission, theme_palette
  04_LIGHTS/      key, fill, rim_left, rim_right, reaction_point
  05_OUTPUT/      final_lockup_plane, shadow_catcher
  06_GUIDES/      typography_grid, safe_area, axes

QuimiX_REACAO.blend / QuimiX_ATOMICA.blend / QuimiX_LIGACOES.blend /
QuimiX_PH.blend / QuimiX_CRISTALINA.blend
```

- Cada arquivo temático deve **linkar** as coleções comuns do mestre, sem multiplicar geometria incompatível.
- Assinatura legível em todas as animações e invariável nas chaves finais; geometria autoral de Quími preservada em SVG e curvas com nomes inequívocos (Q, u, i_base, accent, m, i_final).
- `Geometry Nodes` para repetição cristalina, partículas e trajetórias; `Curve + Bevel` para conexões; malha Bevel + Weighted Normals para X; `Shader Nodes` com atributos de tema e parâmetros de energia; animação com keyframes, drivers e ações não destrutivas.
- Materiais com parâmetros (`base_color`, `emission_strength`, `roughness`, `metallic`, `transmission`) expostos por tema, sem valores de cor hardcoded em vários nós diferentes.
- Rigs e animações devem ser reprodutíveis por script Python do Blender; `.blend` é o editável-mestre e não substitui os scripts de construção nem os SVG originais.

### 5.2 Render e adaptação web

- **Blender:** prévias rápidas em Eevee e referência de acabamento em Cycles; salvar arquivo `.blend`, render de frames-chave e animação final antes de homologar.
- **Web:** exportar `.glb`/glTF 2.0 com geometria e animação básica, reproduzida via Babylon.js (ou motor WebGL/WebGPU homologado) com bibliotecas locais para funcionamento offline. Nem todo shader de Cycles se converte automaticamente em PBR/glTF: definir materiais simplificados equivalentes.
- **WebAssembly:** utilizar apenas para cálculos de trajetórias/cinética quando for vantajoso; WASM não é renderizador 3D, nem equivale a executar Blender no navegador. Implementar fallback estático/SVG independente de WebGL e `prefers-reduced-motion`.
- **Formatos:** `.blend` mestre e variações, `.py` de construção, `.svg` canônicos, `.glb` otimizados, `.webp`/`.png` de quadro final, `.mp4`/`.webm` (opcional), `manifest.json` de cor/estado, páginas HTML de inspeção.
- **Perfis de qualidade propostos:** desktop 1920×1080 30 fps; mobile 1080×1920 ou viewport adaptativa sem cortar assinatura; export web com LOD de geometria, shaders simplificados e limites de partículas ajustáveis. Os orçamentos de tamanho/FPS devem ser medidos antes de virar promessa contratual.

## 6. Critérios de qualidade / QA

**Fidelidade:** comparação sobreposta do último frame com SVG oficial, sem deslocamento da palavra, Q, acento ou X; comparar também modo V7 A separadamente com os contornos experimentais.

**Cinema/arte:** profundidade visível em câmera oblíqua, reflexos não estourados, hierarquia cromática clara, esferas com materialidade e trajetórias suaves; cinco temas distinguíveis sem texto explicativo.

**Web/compatibilidade:** Chromium, Firefox e WebKit/Safari em desktop e mobile; WebGL/WebGPU quando disponível; fallback SVG quando indisponível; funcionamento offline/PWA; cuidado com DPR, resize, foco visível, teclado, toque e `prefers-reduced-motion`.

**Acessibilidade:** nome acessível `QuímiX`; alto contraste e leitura em fundos claros/escuros; sinalização não depende exclusivamente das cores; controles pause/replay/etapas; ausência de flashes e paralisia por GPU indisponível.

**Rigor:** não usar órbitas tipo sistema solar como modelo científico geral; nem escala pH-color sem indicador; nem lattice única como universal; nem confundir intensidade luminosa com temperatura medida.

**Aceite individual:** cada identidade só avança após (a) storyboard escrito aprovado; (b) frame da formação e frame da assinatura renderizados no Blender; (c) ciclo completo revisado; (d) arquivo editável `.blend` inspecionável; (e) prévia HTML testada com diagnóstico de backend; (f) comparação visual com a marca original.

## 7. Ordem de produção e governança

1. **Congelar referência da marca atual** e exportar as curvas V7 A como fontes geométricas experimentais; versionar com checksums (nunca redistribuir arquivos-fontes `.woff2` junto aos entregáveis públicos se não necessário).
2. **Construir `QuimiX_MASTER.blend`** com X, conexões, Quími, acento, iluminação e câmera; homologar *apenas* a câmera, a extrusão e a finalização.
3. **Reação**: utilizar como referência cinética inicial, sem confundir os protótipos V6/V7 com Blender renderizado.
4. **Ligações**, **Atômica**, **Cristalina**, **pH/Soluções**: executar tema a tema, reutilizando mestre e controladores, evitando produção integral dos cinco sem revisões intermediárias.
5. **Exportação web e testes cruzados**, comparando com render Blender e SVG canônico.
6. **Aprovação por identidade**, com PR separado por tema se for publicar ou integrar.
7. **Integração em produto** só após aprovação explícita, com opção para reduzir/desativar animações. A versão principal do Mapa de Riscos do Laboratório não participa do experimento de identidade.

## 8. O que não será feito nesta fase

Nenhuma imagem de conceito gerada, nenhum `.blend` ou `.glb` alegadamente renderizado sem execução real, nenhuma substituição automática da marca oficial, nenhum merge no `main` e nenhuma afirmação de homologação de WebGL/Blender baseada exclusivamente em validação sintática. A fase é **especificação artística + técnica**, com as cinco identidades descritas e parâmetros a serem aprovados.