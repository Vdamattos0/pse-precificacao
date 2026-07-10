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
  let depth = 0, quote = '', escaped = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === quote) quote = ''; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') { depth -= 1; if (depth === 0) return source.slice(start, i + 2); }
  }
  throw new Error(`Declaração ${name} incompleta`);
}

const STATE = {
  meta: {
    tipo_proposta: 'mae',
    fomentos: ['embrapii'],
    macroentregas: [
      { id: 'm1', nome: 'M1', duracao_meses: 3 },
      { id: 'm2', nome: 'M2', duracao_meses: 3 }
    ]
  },
  config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25 }
};

const context = {
  console,
  fmt_r: v => `R$ ${Number(v || 0).toFixed(2)}`,
  STATE,
  FOMENTO: { has: () => true, embrapiiTier: () => ({ label: 'x' }) },
  CALC: {
    hhTotal: () => 10,
    pessoalCusto: (item) => 10 * (+item.horas || 0),
    softCusto: s => (s.valor !== undefined || s.custo_hora !== undefined || s.horas_uso !== undefined) ? +(s.valor || 0) : (s.val_ano || 0) * ((s.meses || 0) / 12),
    equipCusto: e => +(e.valor || 0),
    calcAll: () => ({})
  },
  MACRO: {
    normalizeList: list => Array.isArray(list) ? list : [],
    supportsMultiple: key => ['ptec', 'padm', 'soft', 'equip'].includes(key),
    isEnabled: () => true,
    selectedIds(item, multiple) {
      if (multiple) { const raw = Array.isArray(item.macro_ids) ? item.macro_ids : (item.macro_id ? [item.macro_id] : []); return [...new Set(raw.map(String).filter(Boolean))]; }
      return item.macro_id ? [String(item.macro_id)] : [];
    },
    validSelectedIds(item, meta, multiple) {
      const valid = new Set((meta.macroentregas || []).map(m => m.id));
      return this.selectedIds(item, multiple).filter(id => valid.has(id));
    },
    itemValue(key, item, st) {
      if (key === 'ptec' || key === 'padm') return context.CALC.pessoalCusto(item, key, st);
      if (key === 'soft') return context.CALC.softCusto(item);
      if (key === 'equip') return context.CALC.equipCusto(item);
      return +(item.valor || 0);
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

const { FUNDING } = context;
const approx = (a, b, t = 0.02) => assert.ok(Math.abs(a - b) <= t, `${a} ≈ ${b}`);
const blankState = (over = {}) => ({ ptec: [], padm: [], viagens: [], soft: [], equip: [], cons: [], serv: [], matp: [], ...over });

// ── A) _expandMultiMacroItems: software valor-only (catálogo) é dividido pelas macros
//        sem zerar o valor e PRESERVANDO economico ──────────────────────────────────
{
  const rec = { st: blankState({ soft: [{ id: 'aspen', nome: 'Aspen', valor: 1000, economico: true, macro_ids: ['m1', 'm2'] }] }) };
  FUNDING._expandMultiMacroItems([rec]);
  const clones = rec.st.soft;
  assert.equal(clones.length, 2, 'deve gerar um clone por macro');
  assert.ok(clones.every(c => c.economico === true), 'economico deve ser preservado (não pode virar financeiro)');
  assert.ok(clones.every(c => c.macro_ids.length === 1), 'cada clone fica em uma macro');
  approx(clones.reduce((s, c) => s + c.valor, 0), 1000); // total preservado, não zerado
}

// ── B) _expandMultiMacroItems: pessoa multi-macro divide horas inteiras preservando total ──
{
  const rec = { st: blankState({ ptec: [{ id: 'p', cargo: 'x', horas: 101, economico: false, macro_ids: ['m1', 'm2'] }] }) };
  FUNDING._expandMultiMacroItems([rec]);
  const parts = rec.st.ptec;
  assert.ok(parts.every(p => Number.isInteger(p.horas)), 'horas inteiras');
  assert.equal(parts.reduce((s, p) => s + p.horas, 0), 101, 'soma das horas preservada');
}

// ── C) _defragment: remescla fragmentos ep+eb da mesma base/macro/natureza e é idempotente ──
{
  const rec = { st: blankState({ ptec: [
    { id: 'p_origem_1_1', nome: 'P', cargo: 'x', horas: 30, economico: false, fonte_recurso: 'eb', macro_ids: ['m1'] },
    { id: 'p_origem_1_2', nome: 'P', cargo: 'x', horas: 20, economico: false, fonte_recurso: 'ep', macro_ids: ['m1'] }
  ] }) };
  FUNDING._defragment([rec]);
  assert.equal(rec.st.ptec.length, 1, 'fragmentos remesclados em um item');
  assert.equal(rec.st.ptec[0].horas, 50, 'horas somadas');
  assert.equal(rec.st.ptec[0].id, 'p', 'id base restaurado');
  assert.equal(rec.st.ptec[0].economico, false);
  assert.equal(rec.st.ptec[0].fonte_recurso, 'ep', 'financeiro volta para EP (allocator redecide EB)');
  const snapshot = JSON.stringify(rec.st.ptec);
  FUNDING._defragment([rec]); // idempotente
  assert.equal(JSON.stringify(rec.st.ptec), snapshot, 'segunda passada não altera nada');
}

// ── D) _defragment: macros diferentes e naturezas diferentes NÃO se misturam ──
{
  const rec = { st: blankState({ soft: [
    { id: 'a_origem_1_1', valor: 100, economico: false, fonte_recurso: 'ep', macro_ids: ['m1'] },
    { id: 'a_origem_1_2', valor: 100, economico: false, fonte_recurso: 'ep', macro_ids: ['m2'] },
    { id: 'a_origem_1_3', valor: 100, economico: true, fonte_recurso: 'sn', macro_ids: ['m1'] }
  ] }) };
  FUNDING._defragment([rec]);
  assert.equal(rec.st.soft.length, 3, 'macros/naturezas distintas permanecem separadas');
}

// ── E) _optimizeBucket: NUNCA converte econômico→financeiro; só mexe no pool financeiro ──
{
  const rec = { st: blankState({
    ptec: [{ id: 'p', cargo: 'x', horas: 100, economico: false, fonte_recurso: 'ep', macro_id: 'm1', macro_ids: ['m1'] }],
    soft: [{ id: 'aspen', valor: 500, economico: true, fonte_recurso: 'sn', macro_id: 'm1', macro_ids: ['m1'] }]
  }) };
  const res = FUNDING._optimizeBucket([rec], null, { ep: 0, eb: 1000, sn: 500 }, 0);
  assert.equal(rec.st.soft[0].economico, true, 'Aspen econômico permanece econômico');
  assert.equal(rec.st.soft[0].fonte_recurso, 'sn', 'Aspen permanece em SENAI');
  assert.equal(res.snAllocated, 0, 'otimizador não aloca SN (contrapartida é fixa)');
  assert.ok(rec.st.ptec.every(p => p.economico === false), 'pessoa financeira nunca vira econômica');
  const ebCost = rec.st.ptec.filter(p => p.fonte_recurso === 'eb').reduce((s, p) => s + 10 * (+p.horas || 0), 0);
  approx(ebCost, 1000); // pessoa (custo 1000) realocada inteira para EB
}

// ── F) Guard estrutural: o código não reativa a alocação de SN nem o flip econômico ──
{
  const optBucketSrc = html.slice(html.indexOf('_optimizeBucket(records,macroId,target,serial){'), html.indexOf('_revisionBackup(records){'));
  assert.doesNotMatch(optBucketSrc, /_allocateSource\([^)]*'sn'/, "_optimizeBucket não deve mais alocar 'sn'");
  assert.match(optBucketSrc, /if\(entry\.item\.economico\)\s*return;/, "_optimizeBucket deve pular itens econômicos");
  const optMainSrc = html.slice(html.indexOf('async optimizeFinancialOrigins(){'), html.indexOf('sidebar(calc){'));
  assert.match(optMainSrc, /this\._defragment\(records\);/, 'optimizeFinancialOrigins deve desfragmentar antes de otimizar');
  assert.match(optMainSrc, /ecoChanged/, 'guard deve checar mudança da contrapartida econômica (totalEco)');
  assert.match(optMainSrc, /_assessResult\(records\)/, 'deve avaliar viabilidade e oferecer reversão');
}

console.log('test_v052_funding_invariants: OK');
