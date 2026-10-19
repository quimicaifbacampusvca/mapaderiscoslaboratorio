# UIUX-0.9.2 — Etapa 2: seis desenhos técnicos

**Base de integração:** main, commit `6b65fde9d1d992637cda107675a108636059d727`.

**Elementos abrangidos:** Bancada (`bench`), Bancada L (`benchL`), Pia (`sink`), Capela (`hood`), Extintor (`extinguisher`) e Risco Químico (`chemical`).

## Implementação

- Módulo `js/lab-glyphs.js` com planos geométricos para Canvas e SVG, sem dependência de armazenamentos ou estado de projeto.
- Editor `js/mapa.js` delega desenhos dos seis itens; o risco químico no SVG exportado usa frasco, não abreviação textual.
- Seis miniaturas SVG da paleta usam a mesma linguagem gráfica e mantêm rótulos acessíveis.
- O extintor conserva corpo e bico abaixo de 20 px; a capela usa preenchimento técnico neutro e setas discretas.
- Cache `uiux-0.9.2-six-glyphs-v1` incorpora os novos ativos para uso offline.
- Permanecem intocados dados JSON v4, tipos, geometria, seleção, rotação, colisões, autosave e IndexedDB. Os demais 15 tipos não foram reestilizados.

## Testes executados no pacote de integração

| Verificação | Resultado |
|---|---|
| Suítes Node frontend, incluindo nova regressão | **18/18** |
| Seis objetos em Chromium 1440, 390, 320 px; Canvas/SVG | **42/42** |
| Regressão da etapa 1 Parede/Porta em Chromium | **27/27** |
| Interface/Home e editor em Chromium 320–1440 px | **122/122** |
| Pacote portátil: integridade | **42 arquivos verificados** |
| Recursos estáticos via HTTP Python | **37/37** |
| Bloqueios de caminhos indevidos | **10/10** |

Os testes de Chromium injetaram os arquivos reais em uma página isolada: o ambiente bloqueia o acesso do Chromium a localhost. Firefox/WebKit, instalação real do PWA e persistência nativa entre sessões ainda exigem homologação externa. O teste HTTP portátil ocorre com o servidor Python real.

## Rollback

Reverter somente este commit restaura o desenho anterior. Não limpar armazenamento local nem migrar arquivos de projeto; a alteração é gráfica, não estrutural.
