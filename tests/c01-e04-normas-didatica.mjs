/**
 * C01/E04 — contrato de distinção entre alertas geométricos, normas e
 * indicadores didáticos. Não atribui eficácia de certificação ao motor.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

const validation=read('js/validation.js');
const geometry=read('js/geometry.js');
const app=read('js/mapa.js');
const html=read('index.html');
const doc=read('qa/CONTRATO-C01-E04-REGRAS-NORMAS.md');
assert.match(validation,/NR-23, item 23\.3\.4\.1/,
  'O aviso de desobstrução deve indicar o item oficial verificado');
assert.match(validation,/1,2 m de referência, sem equivalência normativa universal/,
  'O envelope de 1,2 m não deve ser exibido como dimensão legal');
assert.match(geometry,/NÃO um limite legal universal/,
  'A heurística de aproximação não pode ser tratada como norma');
assert.match(html,/3 × 3 m, critério didático/,
  'Dimensão de 3x3 m não pode parecer padrão legal mínimo');
assert.match(html,/Indicadores de preenchimento, não uma certificação normativa/,
  'O relatório não pode se apresentar como atestado de segurança');
assert.match(html,/Relatório de Revisão Didática/,
  'Título público deve manter o caráter didático');
assert.match(app,/Revise os indicadores didáticos de preenchimento para concluir\./,
  'Orientação ao estudante não pode chamar os dez checks de conformidade');
assert.doesNotMatch(app,/Revise os critérios de conformidade para concluir/,
  'Linguagem potencialmente enganosa no stepper');
assert.doesNotMatch(app,/dez checks normativos/,
  'Descrição técnica incorreta dos dez indicadores');
assert.doesNotMatch(validation,/80% de obstrução|tolerância de 80%/i,
  'Não inventar uma tolerância geral a saídas bloqueadas');
for(const id of ['check-dim','check-exit','check-safety','check-fire',
  'check-electrical','check-chemical-bio','check-ventilation','check-ergonomic',
  'check-signaling','check-epi']){
  assert.ok(app.includes('"'+id+'":'), 'Indicador ausente no motor: '+id);
  assert.ok(doc.includes(String.fromCharCode(96)+id+String.fromCharCode(96)),
    'Indicador sem limites documentados: '+id);
}
for(const item of ['23.3.4.1','5.3.1(b)','IT 11/2016',
  'NR-26','10/10','1,2 m','40%']){
  assert.ok(doc.includes(item),'Falta fonte ou ressalva: '+item);
}
assert.match(doc,/não são calculados|NÃO são calculados|não é calculad/i,
  'Limitação de cálculo normativo deve estar explícita');
const passo4=read('qa/C01-E04-PASSO-04-APLICABILIDADE-CBMBA.md');
for(const norma of ['IT 11/2016','IT 20/2017','IT 21/2017',
 'IT 14/2026','IT 32/2021','IT 42/2024','16.302/2015']){
 assert.ok(passo4.includes(norma),'Falta instrução/decreto na matriz C01/E04: '+norma);
}
for(const check of ['D-4','E-1','5.5.1.2','5.2.1.5','2.4','750 m²',
 'área de armazenagem','não implementar','10/10']){
 assert.ok(passo4.toLowerCase().includes(check.toLowerCase()),
   'Falta ressalva contextual em passo 4: '+check);
}
assert.match(doc,/C01-E04-PASSO-04-APLICABILIDADE-CBMBA\.md/,
 'Contrato do C01/E04 deve apontar para o detalhamento do passo 4');
assert.doesNotMatch(app,/Revise os critérios de conformidade para concluir/,
 'Texto de conformidade legal não pode retornar ao stepper');
console.log('C01/E04: fontes, limites e terminologia didática verificados');
