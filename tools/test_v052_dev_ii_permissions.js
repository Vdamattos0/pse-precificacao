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

// Criar o contexto do sandbox
const context = {
  console,
  setTimeout,
  clearTimeout,
  fmt_r: value => `R$ ${Number(value || 0).toFixed(2)}`,
  STATE: {
    meta: {
      tipo_proposta: 'direta',
      fomentos: ['embrapii']
    },
    proposal: {
      id: 'ISIB&F-2026-0001',
      status: 'aprovado',
      tipo_proposta: 'direta'
    }
  },
  LS: {
    get: () => null,
    set: () => {},
    del: () => {}
  },
  DB: {
    _data: {
      users: {}
    }
  },
  DATA: {
    approvers: [
      { nome: 'Leonardo Teixeira', equipe: 'CIN,ESP', email: 'lvteixeira@firjan.com.br', papel: 'gestor', ativo: true }
    ]
  }
};

vm.createContext(context);

// Carregar e executar códigos do HTML
const authDecl = extractObjectDeclaration(html, 'AUTH');
const approversDecl = extractObjectDeclaration(html, 'APPROVERS');

vm.runInContext(`
${authDecl}
${approversDecl}
this.AUTH = AUTH;
this.APPROVERS = APPROVERS;
`, context);

// Testar ensureDbUsers para dev-II
const db = { users: {} };
context.APPROVERS.ensureDbUsers(db);
assert.ok(db.users['vdmattos@firjan.com.br'], 'Vivian de Mattos deve existir no DB');
assert.equal(db.users['vdmattos@firjan.com.br'].papel_global, 'dev-II', 'Vivian deve ser dev-II');

// Testar AUTH.betaPasswordFor para dev-II
const pwd = context.AUTH.betaPasswordFor('vdmattos@firjan.com.br', db.users['vdmattos@firjan.com.br']);
assert.equal(pwd, 'SENAI', 'Password deve ser SENAI');

// Testar AUTH.resolveRole para dev-II
context.AUTH._user = db.users['vdmattos@firjan.com.br'];
context.AUTH._user.email = 'vdmattos@firjan.com.br';
context.AUTH._users = db.users;

const role = context.AUTH.resolveRole(context.STATE.proposal);
assert.equal(role, 'dev-II', 'Role resolvido deve ser dev-II');

// Testar canEdit para dev-II em proposta aprovada (Bypass total)
assert.equal(context.STATE.proposal.status, 'aprovado', 'Proposta deve estar aprovada');
const canEditApproved = context.AUTH.canEdit(context.STATE.proposal);
assert.equal(canEditApproved, true, 'dev-II deve poder editar mesmo propostas aprovadas');

console.log('test_v052_dev_ii_permissions: OK');
