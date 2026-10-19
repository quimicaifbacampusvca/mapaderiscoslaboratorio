# UIUX-0.9.2 — Biblioteca gráfica de elementos laboratoriais
## Etapa 1: integração de Parede e Porta

**Versão-base:** `558e0a8856a92370e3620dd5726aa1f91ee8b40d` — após isolamento da identidade PWA.
**Identidade:** Alerta e Precisão. **Escopo:** somente os tipos `wall` e `door` e suas miniaturas.

### Implementação

- Parede: contorno grafite, preenchimento cinza-gelo, hachuras e filetes ortogonais, orientação horizontal/vertical e compactação controlada.
- Porta: folha, dobradiça, arco tracejado azul e seta indicadora; em tamanho reduzido, mantém folha e dobradiça em vez de um retângulo indistinto.
- Canvas e SVG consomem o mesmo conjunto de regras em `js/architectural-glyphs.js`. Os hachurados são limitados ao retângulo por geometria de recorte.
- `getDoorArcData` recebe as dimensões da área correspondente para exportar corretamente portas de um projeto com várias salas.
- O documento SVG recebe margens suficientes para exibir o arco de abertura de uma porta externa sem cortar a imagem. O tamanho real e a escala dos objetos não mudam.
- `index.html` apresenta ícones atualizados de Parede e Porta no painel Estrutura.
- `sw.js` passa a incluir o módulo gráfico no shell offline, com nome de cache novo.
- `manifest.webmanifest` e seu identificador de PWA `/mapaderiscoslaboratorio/` **não foram alterados**. CSS/Home compacta também permanecem inalterados.

### Preservação

Sem alteração de `js/types.js`, `js/geometry.js`, `js/validation.js`, lógica de medidas, rotação, hitboxes, seleção, colisão, histórico, armazenamento, IndexedDB e esquema JSON v4. Os **outros 21 tipos** continuam com os desenhos atuais.

### Testes concluídos na cópia integrada

| Verificação | Resultado |
|---|---|
| Node: frontend e contratos PWA/IndexedDB/estilo gráfico | **17/17** suítes |
| Chromium isolado: regressão de interface 320–1440 px | **122/122** |
| Chromium isolado: Canvas, SVG, portas externas e múltiplas áreas | **27/27** |
| Pacote portátil: verificações SHA-256 | **37/37** |
| Servidor portátil: recursos HTTP da aplicação | **32/32** |
| Servidor portátil: bloqueios de caminhos indevidos | **10/10** |

As imagens e a exportação SVG foram inspecionadas visualmente. Os testes Chromium operam com a página isolada devido ao bloqueio administrativo de navegação a `localhost` nesta sessão. Os testes do servidor portátil usam cliente HTTP local, não comprovam instalação PWA em navegador. **Ainda pendentes:** GitHub Pages em execução após cache novo, instalação PWA no computador do usuário, Firefox, Safari/WebKit, persistência após reiniciar navegador e impressão externa.

### Rollback

Pode-se reverter esta alteração visual ao commit `558e0a8856a92370e3620dd5726aa1f91ee8b40d` sem apagar projetos, limpar armazenamento ou converter arquivos JSON. Não apagar dados do site durante a reversão.

### Próxima etapa

Aplicar progressivamente os seis pilotos restantes: `bench`, `benchL`, `sink`, `hood`, `extinguisher` e `chemical`, mantendo a correspondência entre Canvas, miniatura e SVG.
