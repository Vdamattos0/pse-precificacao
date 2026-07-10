const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(repoRoot, 'app', 'ISIB&F_precificação_de_projetos_v052.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function extractObjectDeclaration(source, name) {
  const marker = `const ${name} =`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} não encontrado no HTML`);
  const braceStart = source.indexOf('{', start);
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 2);
    }
  }
  throw new Error(`Declaração ${name} incompleta`);
}

const context = {
  console,
  setTimeout,
  clearTimeout,
  fmt_r: value => `R$ ${Number(value || 0).toFixed(2)}`,
  STATE: {
    meta: {
      tipo_proposta: 'mae',
      fomentos: ['embrapii'],
      macroentregas: [
        { id: 'm1', nome: 'Macro 1', duracao_meses: 3 },
        { id: 'm2', nome: 'Macro 2', duracao_meses: 3 }
      ]
    },
    config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25 },
    proposal: { id: 'MAE', tipo_proposta: 'mae' }
  },
  FOMENTO: { has: () => true },
  VAL: { projectScope: (state, calc) => calc },
  DB: { _data: { proposals: {} } },
  TEAM: { getEquipes: () => [] },
  CALC: {
    calcAll: () => ({ totalFin: 1000, totalEco: 0, config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25 } }),
    hhTotal: () => 100,
    pessoalCusto: item => 100 * Number(item.horas || 0),
    viagemTotal: item => Number(item.valor || 0),
    softCusto: item => Number(item.valor || (Number(item.custo_hora || 0) * Number(item.horas_uso || 0))),
    equipCusto: item => Number(item.valor || (Number(item.custo_hora || 0) * Number(item.horas_uso || 0)))
  },
  MACRO: {
    isEnabled: () => false,
    supportsMultiple: key => ['ptec', 'padm', 'soft', 'equip'].includes(key),
    normalizeList: list => Array.isArray(list) ? list : [],
    validSelectedIds(item, meta, multiple) {
      const valid = new Set((meta.macroentregas || []).map(macro => macro.id));
      const selected = multiple
        ? (Array.isArray(item.macro_ids) ? item.macro_ids : [item.macro_id])
        : [item.macro_id || (Array.isArray(item.macro_ids) ? item.macro_ids[0] : '')];
      return selected.filter(id => valid.has(id));
    },
    itemValue(key, item, state) {
      if (key === 'ptec' || key === 'padm') return context.CALC.pessoalCusto(item, key, state);
      if (key === 'soft') return context.CALC.softCusto(item);
      if (key === 'equip') return context.CALC.equipCusto(item);
      return Number(item.valor || 0);
    }
  }
};

vm.createContext(context);
vm.runInContext(`
${extractObjectDeclaration(html, 'FUNDING_POLICY')}
${extractObjectDeclaration(html, 'FUNDING')}
this.FUNDING_POLICY = FUNDING_POLICY;
this.FUNDING = FUNDING;
`, context);

const { FUNDING_POLICY, FUNDING } = context;

function approx(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} deveria ser aproximadamente ${expected}`);
}

function blankState() {
  return { ptec: [], padm: [], viagens: [], soft: [], equip: [], cons: [], serv: [], matp: [] };
}

function totalForMacro(records, macroId) {
  return FUNDING._entriesForBucket(records, macroId).reduce((sum, entry) => sum + FUNDING._entryValue(entry), 0);
}

function actualForMacro(records, macroId) {
  return FUNDING._entriesForBucket(records, macroId).reduce((out, entry) => {
    const source = FUNDING.sourceOf(entry.item, entry.key === 'matp' ? 'ep' : null);
    out[source] += FUNDING._entryValue(entry);
    return out;
  }, { ep: 0, eb: 0, sn: 0, unclassified: 0 });
}

function runPolicyTests() {
  const target = FUNDING_POLICY.targets(100000, context.STATE.config);
  assert.deepEqual(JSON.parse(JSON.stringify(target)), { ep: 42000, eb: 33000, sn: 25000 });

  const acceptable = FUNDING_POLICY.assess(
    { ep: 44000, eb: 31000, sn: 25000, unclassified: 0 },
    target,
    100000,
    'Teste'
  );
  assert.equal(acceptable.reds.length, 0);
  assert.ok(acceptable.yellows.length >= 1);

  const overCap = FUNDING_POLICY.assess(
    { ep: 40000, eb: 35000, sn: 25000, unclassified: 0 },
    target,
    100000,
    'Teste'
  );
  assert.ok(overCap.reds.some(message => message.includes('EMBRAPII')));

  const excessiveEp = FUNDING_POLICY.assess(
    { ep: 50000, eb: 25000, sn: 25000, unclassified: 0 },
    target,
    100000,
    'Teste'
  );
  assert.ok(excessiveEp.reds.some(message => message.includes('7,0 p.p.')));
}

function runMacroOptimizerTests() {
  // Cenário VIÁVEL no modelo v051: contrapartida econômica (SENAI) dentro do teto de cada macro.
  // O otimizador de origem só redistribui o pool FINANCEIRO entre EP/EB e NUNCA altera economico.
  const stateA = blankState();
  // m1: pessoa financeira (10000) + pessoa econômica SENAI (3000)
  stateA.ptec.push({ id: 'p1', cargo: 'pesquisador', horas: 100, macro_ids: ['m1'], fonte_recurso: 'ep', economico: false });
  stateA.ptec.push({ id: 'eHH1', cargo: 'pesquisador', horas: 30, macro_ids: ['m1'], fonte_recurso: 'sn', economico: true });
  stateA.cons.push({ id: 'c1', nome: 'Reagente A', quantidade: 101, valor_unitario: 10, valor: 1010, macro_id: 'm1', fonte_recurso: 'ep', economico: false });
  stateA.matp.push({ id: 'mp1', nome: 'Equipamento permanente', valor: 500, macro_id: 'm1', fonte_recurso: 'ep', economico: false });
  stateA.serv.push({ id: 's1', nome: 'Consultoria', cat: 'consultoria', valor: 700, macro_id: 'm1', fonte_recurso: 'ep', economico: false });

  const stateB = blankState();
  // m2: pessoa financeira (8000) + consumo + serviço PD&I + software econômico SENAI multi-macro
  stateB.ptec.push({ id: 'p2', cargo: 'pesquisador', horas: 80, macro_ids: ['m2'], fonte_recurso: 'ep', economico: false });
  stateB.cons.push({ id: 'c2', nome: 'Reagente B', quantidade: 41, valor_unitario: 17, valor: 697, macro_id: 'm2', fonte_recurso: 'ep', economico: false });
  stateB.serv.push({ id: 's2', nome: 'Ensaio PD&I', cat: 'pdi', valor: 333.33, macro_id: 'm2', fonte_recurso: 'ep', economico: false });
  // Software econômico SÓ-VALOR (catálogo) em duas macros: deve dividir sem zerar e permanecer SENAI.
  stateB.soft.push({ id: 'soft1', nome: 'Software econômico', valor: 1000, macro_ids: ['m1', 'm2'], fonte_recurso: 'sn', economico: true });

  const records = [
    { proposalId: 'MAE', st: stateA },
    { proposalId: 'SUB', st: stateB }
  ];

  // Expansão multi-macro: software econômico (1000) → 500 + 500, preservando economico e o total.
  FUNDING._expandMultiMacroItems(records);
  assert.equal(stateB.soft.length, 2, 'Software em duas macros deve ser dividido em dois registros de cálculo');
  approx(stateB.soft.reduce((sum, item) => sum + item.valor, 0), 1000);
  stateB.soft.forEach(item => {
    assert.equal(item.macro_ids.length, 1);
    assert.equal(item.economico, true, 'natureza econômica preservada na expansão');
    assert.equal(item.fonte_recurso, 'sn');
  });

  const beforeM1 = totalForMacro(records, 'm1');
  const beforeM2 = totalForMacro(records, 'm2');
  const resultM1 = FUNDING._optimizeBucket(records, 'm1', FUNDING_POLICY.targets(beforeM1, context.STATE.config), 0);
  const resultM2 = FUNDING._optimizeBucket(records, 'm2', FUNDING_POLICY.targets(beforeM2, context.STATE.config), resultM1.serial);
  assert.ok(resultM2.serial >= resultM1.serial);
  assert.equal(resultM1.snAllocated, 0, 'o otimizador de origem não aloca SN (contrapartida é fixa)');

  // 1) Totais por macro preservados
  approx(totalForMacro(records, 'm1'), beforeM1);
  approx(totalForMacro(records, 'm2'), beforeM2);

  // 2) EB nunca acima do teto; soma das três fontes == total
  for (const macroId of ['m1', 'm2']) {
    const total = totalForMacro(records, macroId);
    const target = FUNDING_POLICY.targets(total, context.STATE.config);
    const actual = actualForMacro(records, macroId);
    assert.ok(actual.eb <= target.eb + 0.02, `${macroId}: EMBRAPII ultrapassou o teto`);
    approx(actual.ep + actual.eb + actual.sn, total);
  }

  // 3) Natureza imutável: econômicos permanecem SENAI; financeiros nunca viram econômicos
  const econSn = item => { assert.equal(item.economico, true); assert.equal(item.fonte_recurso, 'sn'); };
  stateA.ptec.filter(p => p.id.startsWith('eHH')).forEach(econSn);
  stateB.soft.forEach(econSn);
  const finNotEco = item => assert.equal(item.economico, false, 'item financeiro nunca vira econômico');
  stateA.ptec.filter(p => !p.id.startsWith('eHH')).forEach(finNotEco);
  [...stateA.cons, ...stateA.matp, ...stateA.serv, ...stateB.ptec, ...stateB.cons, ...stateB.serv].forEach(finNotEco);

  // 4) Inteiros preservados
  records.forEach(record => {
    record.st.ptec.forEach(item => assert.ok(Number.isInteger(Number(item.horas)), 'Horas de pessoal devem permanecer inteiras'));
    record.st.cons.forEach(item => assert.ok(Number.isInteger(Number(item.quantidade)), 'Quantidade de consumo deve permanecer inteira'));
  });

  // 5) Material permanente e consultoria permanecem em EP
  assert.equal(stateA.matp[0].fonte_recurso, 'ep');
  assert.equal(stateA.serv[0].fonte_recurso, 'ep', 'Consultoria não deve ser dividida nem realocada para EB');

  // 6) Reordenação por macro continua funcionando
  const originalEnabled = context.MACRO.isEnabled;
  context.MACRO.isEnabled = () => true;
  FUNDING._sortRecordsByMacro(records);
  context.MACRO.isEnabled = originalEnabled;
}

function runExportStructureChecks() {
  assert.match(html, /12_Macro_Rubrica_Fontes/);
  assert.match(html, /fundingSource/);
  assert.match(html, /rubricSources/);
  assert.match(html, /multiItemWidget\('soft'/);
  assert.match(html, /multiItemWidget\('equip'/);
  assert.match(html, /Sem solução automática viável/);
  assert.match(html, /VAL\.projectScope\(STATE,CALC\.calcAll\(STATE\)\)/);
  assert.match(html, /this\.embrapiiScope\(st,st===STATE\?CALC\.calcAll\(STATE\):calc\)/);
}

function runOptimizerVisibilityCheck() {
  const originalActual = FUNDING.currentActual;
  FUNDING.currentActual = () => ({ ep: 0, eb: 0, sn: 0, unclassified: 1000 });
  const status = FUNDING.optimizationStatus({
    totalFin: 1000,
    totalEco: 0,
    config: context.STATE.config
  });
  FUNDING.currentActual = originalActual;
  assert.equal(status.visible, true, 'Custos sem origem devem manter o otimizador de fontes disponível na proposta mãe');
}

function runOptimizerQualityCheck() {
  const originalEnabled = context.MACRO.isEnabled;
  const originalSchedule = context.MACRO.buildSchedule;
  context.MACRO.isEnabled = () => true;
  context.MACRO.buildSchedule = () => ({
    macros: [{ id: 'm1', nome: 'Macro 1', total: 100000, actual: { ep: 45000 }, target: { ep: 42000 } }]
  });
  const quality = FUNDING._qualityAfterOptimization([]);
  context.MACRO.isEnabled = originalEnabled;
  context.MACRO.buildSchedule = originalSchedule;
  assert.ok(quality.worst > 0.05, 'EP 7,14% acima do valor-meta deve oferecer reversão');
}

runPolicyTests();
runMacroOptimizerTests();
runExportStructureChecks();
runOptimizerVisibilityCheck();
runOptimizerQualityCheck();
console.log('OK: regras de contribuição, multi-macro, reversão, inteiros e exportação v052.');
