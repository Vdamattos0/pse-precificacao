# Implementation Log - V29 Main Promotion

Promotion:
- Source branch: `dev_onedrive_sync`.
- Target branch: `main`.
- Stable app file promoted: `ISIB&F_precificacao_de_projetos_v029.html` in intent; actual repo filename keeps accents: `ISIB&F_precificação_de_projetos_v029.html`.
- Main promotion strategy: selective commit, not a full branch merge, to avoid bringing intermediate HTML versions and older implementation logs into `main`.

Branch summary:
- V23 beta fixes: proposal collaborators became visible/editable to involved users.
- V24/V25 revision cycle: proposal revision tracking was made coherent after first approval submission, including accept/reject behavior and updated base state.
- V26 cleanup: revision requests stopped creating extra revision subproposal records; revision counter/title behavior was cleaned up; team/access workflow was adjusted.
- V27 validation UX: bottom validation bar expansion and HH optimizer visibility were fixed.
- V28 EMBRAPII rules: high leverage EMBRAPII validations and limits were added.
- Auth experiment: Graph/MSAL/SharePoint scaffold was implemented in V28/Auth branch but is not the active V29 persistence path.
- V29 OneDrive sync: browser File System Access API was added for direct read/write of a OneDrive-synced JSON DB.

V29 persistence:
- Added isolated `FILE_DB` provider for `onedrive_file` mode.
- User selects the official JSON once via browser file picker.
- File handle is persisted through IndexedDB when supported.
- Saves write back to the selected JSON file through `createWritable()`.
- Local/manual JSON load and save/download remain available.
- Graph/MSAL code remains disabled and is not initialized for V29.

V29 save behavior:
- `DB.saveCurrentToSharedDb(reason, opts)` routes to `FILE_DB.saveWithReloadMerge()` when a synced file is connected.
- Before writing, the latest JSON is re-read from the selected file handle.
- Only locally changed proposals are merged into the latest file DB.
- Other proposals are preserved.
- Same-proposal conflicts are blocked with a clear conflict message.
- DB metadata is maintained: `db_revision`, `last_saved_at`, `last_saved_by`.
- Proposal metadata is maintained: `revision`, `updated_at`, `updated_by`.
- Backup download is generated only when explicitly requested by the save flow, currently `Atualizar DB`.
- Creating/saving a new V0 proposal updates the synced JSON without forcing immediate backup download.

Landing/auth UX:
- `DB sincronizado` action exists on landing, auth modal, and user menu.
- Landing status now shows selected filename, proposal count, user count, and DB revision.
- Loading a synced DB no longer opens the legacy auth modal over the landing page.
- Synced DB button gives visible feedback before opening the picker.
- Unsupported browsers show a clear Edge/Chrome fallback message.

Seed DB:
- Local ignored seed `ISIBF_DB.json` was generated during development.
- It has 0 visible proposals, 16 manager/users, and 30 real reagent entries.
- It remains ignored by git because DB files are sensitive and should not be versioned.

Main contents intentionally promoted:
- `ISIB&F_precificação_de_projetos_v029.html`
- `IMPLEMENTATION_LOG_CODEX_V29.md`
- README updated to point to V29.

Main contents intentionally not promoted:
- Intermediate HTML files V23-V28.
- Auth-only branch log.
- Local or synced DB JSON files.
- Backup JSON files.

Known limitations:
- Direct synced-file persistence requires Edge or Chrome because Firefox does not support the File System Access API used here.
- If browser permission to the file handle is lost, the user must reconnect the JSON file with the picker.
- Detailed conflict UI is not implemented; same-proposal conflicts are blocked and require reload/manual resolution.

V32 beta follow-up:
- Export XLSX no Chrome foi reforçado com carregamento sob demanda do ExcelJS e CDNs alternativos.
- Otimizador de HH EMBRAPII agora usa o déficit econômico consolidado da proposta mãe + subpropostas, não apenas itens da mãe.
- Ação `Atualizar DB` foi convertida em `Backup DB`; `Salvar` é a ação que grava no DB sincronizado.
- Ações de DB foram expostas também na seção DB do menu do usuário.

V33 bugfixes:
- Usuário novo que cria proposta direta passa a editar a própria proposta.
- Usuário novo fora do cadastro do DB passa a ver a tela inicial com cards.
- Banner de notificações é limpo na troca/login de usuário.
- Menu do usuário fecha por clique externo ou Escape.
- Gestores podem excluir a proposta atual pelo menu do usuário, com confirmação e gravação no DB sincronizado quando conectado.
- Correção financeira EMBRAPII: Suporte Operacional usa diretos financeiros + econômicos como base.
- Consolidação de proposta mãe inclui todos os itens próprios da mãe e calcula indiretos uma única vez no nível do projeto.
- Caso validado: `ISIB&F-2026-0008` fecha em R$ 162.010,21 financeiro, R$ 99.242,88 econômico e R$ 261.253,09 total.

V34 release:
- v033 corrigida promovida para `app/ISIB&F_precificação_de_projetos_v034.html`.
- Metadados, título HTML e nome do XLSX exportado atualizados para v034.
- v033 arquivada em `archive/outdated/versions/`.

V35 merge/email follow-up:
- v034 arquivada em `archive/outdated/versions/`.
- v035 criada como executavel principal em `app/`.
- Mesclagem de DBs com conflito de IDs agora normaliza metadados internos (`id_base`, `id_mae`, `tipo_proposta`, `state.meta` e historico).
- Carregamento do DB aplica reparo leve para propostas diretas sem mae cujo `id_base` apontava para outra proposta.
- Listagem evita agrupar proposta direta independente como revisao de outra apenas por `revisao_numero > 0`.
- Modulo `EMAIL_DRAFTS` gera rascunhos editaveis para envio para aprovacao, revisao solicitada e proposta aprovada, sem envio automatico.
- Workflow e painel de aprovacao abrem o rascunho depois das transicoes, mantendo save/revisao/backup existentes.
- Ajuste posterior removeu botoes extras de e-mail da barra de workflow e manteve apenas o modal automatico com acao `Enviar para e-mail` via cliente padrao/Outlook.

V36 release:
- v035 validada foi versionada como `app/ISIB&F_precificaÃ§Ã£o_de_projetos_v036.html`.
- Metadados internos, rodape e nome do XLSX exportado atualizados para v036/v36.
- v035 arquivada em `archive/outdated/versions/`.
- v036 copiada para a pasta compartilhada do OneDrive.

V37 sidebar tickets:
- v036 versionada como `app/ISIB&F_precificaÃ§Ã£o_de_projetos_v037.html`.
- Sidebar passou a exibir ticket medio financeiro/mês e ticket medio total/mês.
- Calculo linear: total financeiro / duracao e total do projeto / duracao.
- Aplicado para proposta direta, subproposta/equipe, proposta mae consolidada e visao por equipe.
- Sem mudanca em CALC, VAL, DB ou regras financeiras.

V38 Sprint 1:
- Horas de pessoal passaram a aceitar somente inteiros e exibem `HH PROJ.` somente leitura.
- Petrobras usa horas semanais inteiras, convertidas por `h/sem × 52/12 × meses`.
- Validações locais são exibidas nas subpropostas e as consolidadas permanecem na mãe.
- Otimizador econômico EMBRAPII passou a resolver o efeito do próprio HH sobre o suporte em uma execução.
- Corrigidos espaços em rascunhos `mailto`, textos com mojibake e rótulos do modo local.
- Criar/abrir proposta fecha a tela inicial; proposta direta nova exige equipe.
- Botão circular do header salva/recarrega; propostas aprovadas ficam somente leitura com Salvar e Backup disponíveis.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V038_SPRINT1.md`.

V39 Sprint 2:
- Boas práticas exclusivas de ESP para ticket mensal e presença/proporção de software.
- Origem de recursos EMBRAPII classificada por item: EP/EB para financeiro e SN para econômico.
- Material permanente e Suporte Operacional obrigatoriamente alocados em EP.
- Sidebar separa Distribuição Meta e Distribuição Atual, destacando falta/excesso por fonte.
- Custos históricos sem origem permanecem explicitamente não classificados, sem migração presumida.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V039_SPRINT2.md`.

V40 Sprint 3:
- Fundação de macroentregas para proposta mãe EMBRAPII, mantendo propostas históricas no modo tradicional.
- Criação e editor posterior exigem no mínimo 3 macros, nomes, durações inteiras e soma igual ao prazo total.
- Períodos relativos são derivados em meses sequenciais.
- Subpropostas novas, adicionadas depois ou abertas de DB antigo herdam prazo e estrutura da mãe.
- Validação estrutural funciona mesmo antes de existir valor financeiro.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V040_SPRINT3.md`.

V41 Sprint 4:
- Todos os itens passam a exigir macroentrega quando o modo por macro está ativo.
- Pessoas podem atuar em várias macros e são rateadas linearmente pela duração das etapas.
- Demais rubricas pertencem integralmente a uma macro.
- Sidebar ganhou visão `Por Macroentrega`, com rubricas, equipes, desembolso e comparação Meta x Atual de EP/EB/SN.
- Validação bloqueia itens sem macro, referências inválidas, origem financeira ausente e distribuição divergente por etapa.
- Fórmulas de `CALC` permaneceram intactas.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V041_SPRINT4.md`.

V42 Sprint 5:
- Macroentregas integradas ao XLSX, Track Changes, histórico, carregamento e mesclagem.
- XLSX ganhou a aba `11_Cronograma_Macros` e campos de macro nas tabelas normalizadas.
- `state` e `state_base` são normalizados em conjunto, evitando diferenças artificiais de revisão.
- Propostas tradicionais antigas permanecem sem campos novos; propostas macro recebem versão de schema compatível.
- Fórmulas, workflow, status e valores financeiros permaneceram intactos.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V042_SPRINT5.md`.

V43 auditoria final:
- Validações agregadas de mãe passaram a considerar mãe + subpropostas, inclusive quando a mãe não possui itens próprios.
- Limites consolidados de serviços EMBRAPII e equipamentos ANP foram corrigidos.
- Percentuais configurados em `0%` passaram a ser respeitados no cálculo e na interface.
- Novas propostas ANP/Petrobras de infraestrutura começam com DOA de `3%`.
- Matriz multifomento validada com o teto equivalente mais conservador.
- A repartição automática entre DOA e CI não foi inventada; o usuário configura os componentes dentro do teto combinado.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V043_FINAL_AUDIT.md`.

V44 otimizadores e macroentregas:
- Macroentregas disponíveis também para propostas diretas EMBRAPII.
- Seleção de atuação de pessoal por macro agora é visível e não usa dropdown com scroll interno.
- Meta e distribuição atual possuem cores de divergência/aderência distintas.
- Otimizador econômico tem regra de visibilidade centralizada e desaparece quando a meta é atendida.
- Novo otimizador distribui custos financeiros entre Empresa Parceira e EMBRAPII, inclusive nas subpropostas, preservando valores e horas inteiras.
- Prioridade de divisão: pessoal e material de consumo; software, uso de equipamentos e serviços PD&I também podem ser fracionados.
- Viagens, material permanente e serviços não PD&I permanecem inteiros; indiretos e material permanente permanecem na Empresa Parceira.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V044_FUNDING_OPTIMIZER.md`.

V45 otimização por macroentrega:
- O otimizador passou a resolver separadamente as metas EP/EMBRAPII/SENAI de cada macroentrega.
- SENAI e EMBRAPII funcionam como tetos; resíduos decorrentes da granularidade dos itens permanecem na Empresa Parceira.
- Diferenças de até 7 p.p. adicionais em EP geram aviso; diferenças maiores ou fontes acima do teto bloqueiam.
- Horas de pessoal e quantidades de consumo permanecem inteiras; consumo fracionário bloqueia a otimização.
- Consultoria permanece fora da divisão automática; somente serviços classificados como PD&I são divisíveis.
- XLSX ganhou detalhamento de rubrica e fonte de recurso por macroentrega.
- Criada a primeira suíte automatizada das regras financeiras alteradas.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V045_MACRO_OPTIMIZATION.md`.

V46 refinamento dos otimizadores:
- Software e uso de equipamentos podem ser associados a várias macroentregas.
- Itens multi-macro são rateados pela duração e separados por macro durante a otimização, preservando o total.
- Itens são reordenados pela sequência das macros após uma otimização aceita.
- Soluções com EP mais de 5% acima do valor-meta oferecem reversão integral.
- Corrigida a dupla consolidação que podia ocultar os botões de otimização econômica e de origens na proposta mãe.
- Custos inicialmente sem origem mantêm o otimizador de fontes disponível.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V046_OPTIMIZER_REFINEMENT.md`.

V47 botões de otimização na mãe consolidada:
- Extraído o bloco "Ajustes automáticos" (botões `Otimizar HH Técnico` e `Otimizar origem financeira`) para um helper compartilhado `renderFundingAdjustments(calc)`.
- O helper recalcula o escopo do projeto via `VAL.embrapiiScope(STATE, CALC.calcAll(STATE))`, evitando dupla contagem mesmo quando `calc` já vem consolidado.
- A view consolidada "Por Equipe" da proposta mãe passou a chamar `renderFundingAdjustments(consol.calc)`, corrigindo o caso em que a mãe possui subpropostas (ESP/DAP) mas nenhum item próprio e os botões não apareciam em nenhuma visão.
- Removido o gate antigo `calc.dist && FOMENTO.has(...)`, que ficava `null` quando a mãe não tem itens próprios.
- Nenhuma fórmula de `CALC`/`VAL`/`FUNDING`/`FUNDING_POLICY` foi alterada; os otimizadores continuam podendo redistribuir itens entre subpropostas e trocar a fonte pagadora sem mudar o valor total.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V047_SIDEBAR_OPTIMIZER_FIX.md`.

V48 reescrita do otimizador de origem financeira:
- Correção da auditoria reportada: o otimizador inflava o total, convertia itens SENAI em EB/Empresa, fragmentava sem limite e não tinha caminho de "sem solução".
- `_optimizeBucket` agora pula itens econômicos (nunca altera `economico`) e só redistribui o pool financeiro entre EP e EB; não aloca mais SN.
- Novo `_defragment`/`_mergeFragments`: remescla fragmentos de execuções anteriores antes de otimizar → idempotência (rodar duas vezes dá o mesmo resultado; fim das micro-frações).
- `_expandMultiMacroItems` divide por duração em unidades inteiras por maior-resto, preservando o total; trata software só-`valor` (catálogo) sem zerar e preserva `economico`.
- Guard reforçado: cancela e reverte se a contrapartida econômica (`totalEco`) mudar, não só o total geral.
- Novo `_assessResult` + diálogo "Sem solução automática viável" com oferta de reverter ao estado original quando EB/SN estouram teto ou EP excede 7 p.p.
- `optimizationStatus` mostra o botão de origem só para desvio EP/EB ou custos sem origem (falta de SENAI é do otimizador de HH econômico).
- Nenhuma fórmula de `CALC`/`FUNDING_POLICY` alterada; horas/quantidades inteiras, consultoria/matp/indiretos em EP preservados.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V048_FUNDING_OPTIMIZER_REWORK.md`.

V49 botão único de distribuição EP/EB/SN:
- Unificou os dois otimizadores em um só botão "Otimizar distribuição (EP/EB/SN)" (`FUNDING.optimizeAll`).
- Ordem: completa a contrapartida econômica (SENAI) adicionando HH econômico para fechar 25% do total final, depois distribui o pool financeiro entre EP/EB maximizando a EMBRAPII até a meta (resto na Empresa), e distribui o econômico por macroentrega.
- Invariante novo: o valor FINANCEIRO direto de cada rubrica não muda (guard de `dirFin`); adicionar contrapartida econômica é permitido (aumenta o total), alterar o financeiro não.
- Corrige o EP inchado: com o econômico trazido para 25%, o EP volta a ~42% e o EB a ~33%.
- Núcleo econômico extraído para `VAL._addEconomicContrapartida` (sem render/toast).
- Sidebar passou a mostrar um botão único; `optimizeEco`/`optimizeFinancialOrigins` continuam definidos mas não são mais acionados.
- Nenhuma fórmula de `CALC`/`FUNDING_POLICY` alterada.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V049_UNIFIED_DISTRIBUTION.md`.

V50 viabilidade por projeto e contrapartida por macro:
- Corrige o falso "sem solução viável" reportado na proposta "What" (3 macros), onde o resultado era ótimo no total mas uma macro ficava marginalmente acima de 25% de SN.
- Causa: a contrapartida econômica era dividida por duração (partes iguais), mas o financeiro por macro era desigual (macro_2 tinha R$30k de consultoria a mais) → macros 1 e 3 ficavam ~0,4% acima do 25% individual, e `_assessResult` avaliava macro a macro com regra dura.
- Fix 1: a contrapartida econômica passa a ser distribuída por macro proporcional ao financeiro de cada uma (cada macro tende a ~25%), em vez de por duração.
- Fix 2: `_assessResult` avalia a viabilidade no nível do PROJETO (consolidado) — a meta EMBRAPII é de projeto; resíduos de arredondamento por macro não invalidam mais a distribuição.
- Nenhuma fórmula de `CALC`/`FUNDING_POLICY` alterada; `dirFin` continua invariante.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V050_PER_MACRO_FEASIBILITY.md`.

V51 auditoria pré-lançamento (multi-fomento, tiers, rede de testes):
- Fase A: rede de segurança — harness do motor real (`tools/engine.js`), golden snapshot do CALC, 22 regras de risco no VAL.run real, runner único (`tools/run_tests.js`). Acaba com o "motor sem teste".
- Fase B: multi-fomento — máx. 2 fomentos e ANP+Petrobras proibido; indiretos pelo regime mais restritivo (ANEEL > ANP=Petrobras > EMBRAPII), corrigindo o gap crítico de EMBRAPII+ANP que ignorava DOA/CI; EP ≥ 50% em combo EMBRAPII+regulado; UI bloqueia combos e semeia a distribuição; migração de propostas antigas para estado válido.
- Fase C: tiers EMBRAPII — distribuição muda no instante que o projeto cruza de categoria (CG 33% / AA1 25% / AA2 20% de EB; EP absorve, ≥50% nos combos); diárias pré-preenchidas 500/200; mensagem "Otimizar HH" corrigida.
- Fase D: teste de consolidação mãe/filha (sem dupla contagem). Suíte 9/9 verde; golden verde = single-fomento intacto.
- Nenhuma fórmula de `CALC`/`FUNDING_POLICY` alterada na essência (calcIndirects dirigido por regime, idêntico para fomento único).
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V051_PRELAUNCH_AUDIT.md`.

V52 gestores de aprovação ESP (Leonardo Teixeira):
- Adicionado Leonardo Teixeira como gestor de aprovação da equipe ESP, em adição à sua equipe de origem CIN.
- Removidos os antigos gestores da equipe ESP Stefano Ferrari e Ana Carolina Spindola da lista de aprovadores do sistema e de bases virgens.
- Sincronização automática na carga do banco de dados (DB) para garantir que Leonardo Teixeira pertença a ambas as equipes e que Stefano Ferrari e Ana Carolina Spindola sejam excluídos/inativados.
- Habilitada navegação "Início" no cabeçalho/logotipo e fechamento inteligente do painel "Nova Proposta".
- Adicionado botão de edição (lápis) ao lado do título para reconfiguração completa de metadados do projeto (inclusive fomento).
- Adicionado papel de desenvolvedor (`dev-II`) para Vivian de Mattos (`vdmattos@firjan.com.br`) com permissões para excluir qualquer proposta e editar dados de qualquer projeto (mesmo aprovados).
- Arquivos de teste e scripts atualizados para v052, incluindo a suíte de testes de permissão `test_v052_dev_ii_permissions.js`.
- Detalhes: `IMPLEMENTATION_LOG_CODEX_V052_ESP_APPROVERS.md`.

Quick checks:
- Source branch clean before promotion.
- Target `main` prepared from `origin/main`.
- V29 HTML copied selectively from `dev_onedrive_sync`.
- Log consolidated for main promotion.
- No repository DB JSON file staged.
