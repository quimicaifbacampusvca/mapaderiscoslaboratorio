# UIUX-0.9.3 — Acessibilidade no Mapa de Riscos

## Referência verificada

A implementação usa a organização de recursos do SIAB 1.0.0, conferida em `SIAB-1.0.0-standalone.html` e `Manual_Usuario_SIAB_1.0.0_entrega.docx`: tema, contraste, escala 80%–200%, espaçamento, redução de movimento, animação de abertura, leitura simples, visão de cores, VLibras opcional e restaurar padrões.

Os recursos específicos do SIAB (som do pH e vibração na viragem) não fazem parte do Mapa de Riscos. A simulação de daltonismo é uma aproximação visual, **não** um recurso de correção ou certificação de acessibilidade.

## Comportamento

- Configurações usa `<dialog>.showModal()`: foco limitado ao diálogo, Escape nativo, fundo inerte, clique na área externa para fechar e retorno de foco ao acionador.
- A seção Acessibilidade está dentro de Configurações, disponível na Home e no editor. Os controles são etiquetas e campos nativos com indicação de estado, agrupados por aparência, visão de cores e recursos opcionais.
- Configurações ficam em `localStorage` sob a chave **`mrl_accessibility_preferences_v1`**, separada dos mapas. A falha no armazenamento não interrompe o uso, mas impede a persistência e apresenta mensagem informativa.
- O zoom geométrico, o Canvas de riscos, as coordenadas, o JSON v4, IndexedDB e exportação SVG permanecem intocados.
- O filtro de visão de cores usa uma sobreposição (`backdrop-filter`) conforme a abordagem do SIAB; seu suporte pode variar entre navegadores.
- VLibras carrega recursos externos apenas após clique explícito, exigindo conexão. Nenhum recurso crítico do editor depende dessa conexão.
- Ao ampliar texto a 200%, o diálogo pode rolar internamente. Não é necessário manter todos os controles visíveis sem rolagem nesse modo especial.
- `prefers-reduced-motion` é respeitado como padrão na primeira sessão; o usuário pode personalizá-lo.

## Testes e limites de homologação

- **20 suítes Node aplicáveis** aprovadas na cópia de trabalho, incluindo contrato de acessibilidade e regressão de PWA.
- **110/110** verificações no Chromium isolado nos tamanhos 320×568, 390×844, 768×900, 1024×768 e 1440×900: ativação/fechamento do diálogo, foco, controles, alto contraste, tema, fonte, filtro de cores, persistência em armazenamento simulado e restauração.
- Texto ampliado até **200%**: controles alcançáveis dentro do diálogo em 320×568, 390×844, 768×900 e 1440×900.
- Os testes Chromium foram realizados com HTML/CSS/JS reais **injetados em uma página isolada** por bloqueio do acesso localhost/GitHub Pages no ambiente. Para inspecionar o painel aberto a partir do editor, a QA alternou somente as classes de visibilidade; não executou novo projeto nem validou novamente o motor de dados nesse cenário.
- A persistência de preferências foi verificada durante a sessão (mock de `localStorage`), não entre reinicializações reais do navegador.
- Faltam homologação real com Firefox, Safari/WebKit, leitor de telas, filtros visuais multiplataforma e VLibras online.

Esta rodada **não conclui a homologação 1.0.0**.
