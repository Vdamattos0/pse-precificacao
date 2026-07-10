const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(repoRoot, 'app', 'ISIB&F_precificação_de_projetos_v052.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function extractFunctionDeclaration(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} não encontrado no HTML`);
  const braceStart = source.indexOf('{', source.indexOf(')', start));
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
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`Declaração ${name} incompleta`);
}

// ── 1) Garante que ambas as views da proposta mãe expõem o bloco de ajustes ──
// (própria/proprio e consolidado "Por Equipe") — esta é a falha relatada:
// na view consolidada o bloco de "Ajustes automáticos" nunca era renderizado.
const renderResumeSrc = extractFunctionDeclaration(html, 'renderResume');

assert.match(
  renderResumeSrc,
  /EMBRAPII distribution[\s\S]*?h\+=FUNDING\.sidebar\(calc\);[\s\S]*?h\+=renderFundingAdjustments\(calc\);/,
  'View "própria" deve chamar renderFundingAdjustments(calc)'
);

assert.match(
  renderResumeSrc,
  /h\+=FUNDING\.sidebar\(consol\.calc\);[\s\S]{0,80}h\+=renderFundingAdjustments\(consol\.calc\);/,
  'View consolidada "Por Equipe" deve chamar renderFundingAdjustments(consol.calc)'
);

// Garante que o gate antigo baseado em calc.dist (que ficava null em mães
// com subpropostas) foi removido.
assert.doesNotMatch(
  renderResumeSrc,
  /if\(calc\.dist&&FOMENTO\.has/,
  'Gate antigo "calc.dist && FOMENTO.has(...)" não deve mais existir'
);

// ── 2) Testa o comportamento de renderFundingAdjustments isoladamente ──
const fnSrc = extractFunctionDeclaration(html, 'renderFundingAdjustments');

function buildContext(overrides = {}) {
  const state = {
    meta: { tipo_proposta: 'mae', fomentos: ['embrapii'] },
    config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25 }
  };
  const context = {
    STATE: state,
    esc: s => String(s == null ? '' : s),
    FOMENTO: {
      has: () => true,
      embrapiiTier: () => ({ label: 'Tier teste' })
    },
    CALC: { calcAll: () => ({}) },
    VAL: {
      embrapiiScope: () => ({ totalFin: 100000, totalEco: 20000 }),
      economicOptimizationStatus: () => ({ visible: false, reason: '', deficit: 0 })
    },
    FUNDING: {
      optimizationStatus: () => ({ visible: false, blocked: false, reason: '' })
    },
    ...overrides
  };
  vm.createContext(context);
  vm.runInContext(fnSrc, context);
  return context;
}

function calcFixture(extra = {}) {
  return { config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25 }, ...extra };
}

// 2a) Sem EMBRAPII (ou proposta tipo "equipe"): bloco não é renderizado.
{
  const ctx = buildContext({ FOMENTO: { has: () => false, embrapiiTier: () => ({ label: 'x' }) } });
  assert.equal(ctx.renderFundingAdjustments(calcFixture()), '', 'Sem EMBRAPII o bloco deve ser vazio');
}
{
  const ctx = buildContext();
  ctx.STATE.meta.tipo_proposta = 'equipe';
  assert.equal(ctx.renderFundingAdjustments(calcFixture()), '', 'Em subproposta (equipe) o bloco deve ser vazio');
}

// 2b) totalProj <= 0 (escopo do projeto ainda vazio): bloco não é renderizado.
{
  const ctx = buildContext({
    VAL: {
      embrapiiScope: () => ({ totalFin: 0, totalEco: 0 }),
      economicOptimizationStatus: () => ({ visible: false, reason: '', deficit: 0 })
    }
  });
  assert.equal(ctx.renderFundingAdjustments(calcFixture()), '', 'Com totalProj=0 o bloco deve ser vazio');
}

// 2c) Déficit de contrapartida econômica: botão unificado "Otimizar distribuição (EP/EB/SN)" aparece.
{
  const ctx = buildContext({
    VAL: {
      embrapiiScope: () => ({ totalFin: 100000, totalEco: 20000 }),
      economicOptimizationStatus: () => ({ visible: true, reason: 'Faltam R$ 5.000 de aporte econômico.', deficit: 5000 })
    }
  });
  const out = ctx.renderFundingAdjustments(calcFixture());
  assert.match(out, /onclick="FUNDING\.optimizeAll\(\)"/, 'Botão unificado deve aparecer com déficit econômico');
  assert.match(out, /Otimizar distribuição \(EP\/EB\/SN\)/);
  assert.doesNotMatch(out, /VAL\.optimizeEco\(\)/, 'botão antigo de HH não deve mais existir');
}

// 2d) Distribuição financeira fora da meta: botão unificado aparece.
{
  const ctx = buildContext({
    FUNDING: { optimizationStatus: () => ({ visible: true, blocked: false, reason: 'Distribuição financeira EP/EB fora da meta.' }) }
  });
  const out = ctx.renderFundingAdjustments(calcFixture());
  assert.match(out, /onclick="FUNDING\.optimizeAll\(\)"/, 'Botão unificado deve aparecer com EP/EB fora da meta');
  assert.doesNotMatch(out, /FUNDING\.optimizeFinancialOrigins\(\)/, 'botão antigo de origem não deve mais existir');
}

// 2e) Bloqueado (itens sem macroentrega): mostra motivo, sem botão de ação.
{
  const ctx = buildContext({
    FUNDING: { optimizationStatus: () => ({ visible: false, blocked: true, reason: 'Atribua todos os itens às macroentregas.' }) }
  });
  const out = ctx.renderFundingAdjustments(calcFixture());
  assert.doesNotMatch(out, /onclick="FUNDING\.optimizeAll\(\)"/, 'bloqueado não mostra botão');
  assert.match(out, /Atribua todos os itens às macroentregas\./);
}

// 2f) Tudo dentro da meta: mostra o selo "Distribuição EP/EB/SN nas metas", sem botão.
{
  const ctx = buildContext({
    VAL: {
      embrapiiScope: () => ({ totalFin: 100000, totalEco: 20000 }),
      economicOptimizationStatus: () => ({ visible: false, reason: '', deficit: 0 })
    },
    FUNDING: { optimizationStatus: () => ({ visible: false, blocked: false, reason: '' }) }
  });
  const out = ctx.renderFundingAdjustments(calcFixture());
  assert.match(out, /Distribuição EP\/EB\/SN nas metas/);
  assert.doesNotMatch(out, /onclick="FUNDING\.optimizeAll\(\)"/);
}

// 2g) Funciona com calc próprio (sem .dist) e com consol.calc:
// a função nunca depende de calc.dist, apenas de calc.config (com fallback STATE.config).
{
  const ctx = buildContext({
    VAL: {
      embrapiiScope: () => ({ totalFin: 100000, totalEco: 20000 }),
      economicOptimizationStatus: () => ({ visible: true, reason: 'Faltam R$ 5.000 de aporte econômico.', deficit: 5000 })
    }
  });
  const calcSemDist = { config: { ep_pct: 0.42, eb_pct: 0.33, sn_pct: 0.25 } };
  assert.doesNotThrow(() => ctx.renderFundingAdjustments(calcSemDist));
  const out = ctx.renderFundingAdjustments(calcSemDist);
  assert.match(out, /onclick="FUNDING\.optimizeAll\(\)"/);
}

console.log('test_v052_sidebar_optimizer_buttons: OK');
