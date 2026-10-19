# UIUX-0.9.2.4 — Componentes visuais e seletores

Base: `687a7b1a4d57201ffe0464e539da45dc852b888d`, Mapa de Riscos do Laboratório.

## Diagnóstico

A lista nativa de `Tipo da área` não adotava os estados visuais “Alerta e Precisão”, sobretudo no popup aberto. Os três `select` reais do HTML são `areaType`, `areaSelect` e `doorConnection`. CSS aplicado diretamente a `option` não padroniza os menus nativos em todos os sistemas operacionais. A auditoria também detectou falta de uma regra temática central para o controle `range`, botão de escolha de arquivo e foco dos `summary` expansíveis.

## Alterações

- Adicionar `js/styled-selects.js`, sem remover os `select` originais ou trocar os valores dos projetos. Cada seletor ganha um combobox visível e um popup próprio com `role=listbox` e `role=option`.
- Sincronização de opções dinâmicas; `change` real no elemento original e atualização do texto selecionado.
- Teclado: setas, Home/End, Enter/Espaço, Escape, Tab, busca pelo início da palavra. Atributos de acessibilidade e indicação visível do foco.
- CSS local `css/controls-consistency.css`: botões, itens ativos, popup que evita recorte no painel, cores, temas e foco; acabamento do `range`, botão de arquivo e `summary`.
- Precache PWA: CSS e JS adicionados, versão do cache atualizada.
- Documento de referência da acessibilidade SIAB 1.0.0 preparado em `qa/CONTRATO-ACESSIBILIDADE-SIAB-PARA-MRL.md` para o trabalho seguinte.

## Testes e limitações

O componente foi testado em Chromium isolado com 3 selects e 5 opções: clique, disparo de `change`, setas/Home/End/Enter, Escape, Tab e alteração dinâmica das opções. Os arquivos CSS/JS publicados reproduzem os bytes testados na cópia local. A integração completa no GitHub Pages, compatibilidade Safari/WebKit, Firefox e avaliação de leitor de telas exigem homologação externa antes da 1.0.0.

Nenhuma alteração foi feita em geometria, riscos, banco de objetos, formato JSON v4, IndexedDB e motor Canvas. A série UIUX-0.9.2 Etapa 3 (15 desenhos restantes) permanece separada desta correção.
