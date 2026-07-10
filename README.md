# ISIB&F PSE - Ferramenta de Precificacao de Projetos

Ferramenta interna do Instituto SENAI de Inovacao em Biossinteticos e Fibras
(ISIB&F / Firjan) para montar, validar, revisar, aprovar e exportar propostas
de projetos de PD&I.

A versao estavel atual e:

```text
app/ISIB&F_precificação_de_projetos_v052.html
```

> Observacao: os arquivos HTML oficiais usam acentos no nome. Se o terminal
> Windows exibir caracteres estranhos, confira os nomes diretamente na pasta
> `app/` ou na interface do GitHub.

## Objetivo da ferramenta

A ferramenta foi criada para apoiar a preparacao de propostas PSE com controle
de custos, regras de fomento e colaboracao entre equipes. Ela centraliza:

- composicao de rubricas financeiras e economicas;
- propostas diretas, propostas mae e subpropostas por equipe;
- controles de acesso por usuario, gestor, equipe e colaborador;
- validacoes de regramentos;
- ciclo de aprovacao e revisao com controle de alteracoes;
- catalogos de precos;
- persistencia em JSON sincronizado pelo OneDrive;
- exportacao XLSX executiva/comercial.

## Execucao recomendada

1. Abra o arquivo estavel atual no navegador:

   ```text
   app/ISIB&F_precificação_de_projetos_v052.html
   ```

2. Use Edge ou Chrome para habilitar o modo `DB sincronizado`.

3. Clique em `DB sincronizado`.

4. Selecione o arquivo oficial:

   ```text
   ISIBF_DB.json
   ```

5. Confira na landing page se o DB foi conectado corretamente:

   - nome do arquivo;
   - numero de propostas;
   - numero de usuarios;
   - revisao do DB;
   - status visual de conexao.

6. Informe seu e-mail corporativo cadastrado no DB.

7. Use a ferramenta normalmente.

8. Clique em `Atualizar DB` para gravar no JSON sincronizado.

Firefox continua funcionando para modo local/manual, mas nao salva diretamente
no mesmo arquivo sincronizado porque nao suporta a File System Access API usada
pelo modo `DB sincronizado`.

## Modos de banco de dados

### 1. DB sincronizado por OneDrive

Modo recomendado para beta e uso real.

Fluxo:

1. O usuario sincroniza a pasta SharePoint via OneDrive.
2. O usuario seleciona `ISIBF_DB.json` uma vez pelo seletor do navegador.
3. A ferramenta le o arquivo JSON.
4. Ao salvar, a ferramenta rele o JSON mais recente antes de gravar.
5. A proposta atual e mesclada de forma conservadora no DB mais recente.
6. O mesmo arquivo JSON selecionado e sobrescrito pelo navegador.
7. O backup local continua preservado no fluxo `Atualizar DB`.

Esse modo nao usa Microsoft Graph, MSAL, PowerShell, terminal, Graph Explorer ou
tokens manuais.

### 2. Modo local/manual

Modo de contingencia e testes.

Permite importar/exportar JSON manualmente. Deve continuar funcionando mesmo
quando o modo sincronizado nao estiver disponivel.

### 3. Scaffold SharePoint/Graph

Existem artefatos historicos de estudo para Graph/MSAL, mas a versao validada
atual usa persistencia por arquivo OneDrive sincronizado.

## DB oficial

O arquivo oficial de trabalho e:

```text
ISIBF_DB.json
```

Esse arquivo contem usuarios, propostas e informacoes sensiveis. Ele nao deve
ser versionado no Git. Deve ficar na pasta SharePoint/OneDrive sincronizada.

O repositorio contem apenas seed/catalogos autorizados, por exemplo:

```text
data/seed/ISIBF_DB_v030_virgem.json
data/catalog/catalogo_default_reagentes.json
data/catalog/precos_default_reagentes_pdi_2026.xlsx
```

## Arquivo seed oficial

O seed virgem atual e:

```text
data/seed/ISIBF_DB_v030_virgem.json
```

Caracteristicas:

- zero propostas visiveis;
- usuarios, gestores e aprovadores iniciais;
- catalogo real de reagentes;
- valores padrao autorizados de cargos/HH;
- valores padrao autorizados de equipamentos/HM;
- sem propostas fake visiveis;
- sem catalogos fake de software ou material permanente.

Use esse seed apenas para inicializar um novo DB oficial ou ambiente de teste.
Nao use esse arquivo como DB vivo se ja existir um `ISIBF_DB.json` em uso.

## Estrutura do repositorio

```text
/
  README.md
  .gitignore

  app/
    ISIB&F_precificação_de_projetos_v051.html

  data/
    catalog/
      catalogo_default_reagentes.json
      precos_default_reagentes_pdi_2026.xlsx
    seed/
      ISIBF_DB_v030_virgem.json

  docs/
    HANDOVER.md
    design/
      C-premium.html
      c-system.css
      landing.html

  logs/
    IMPLEMENTATION_LOG_CURRENT.md
    IMPLEMENTATION_LOG_CODEX_V030_XLSX_EXPORT.md
    IMPLEMENTATION_LOG_CODEX_V031_CATALOGS.md
    IMPLEMENTATION_LOG_CODEX_V032_VALIDATION_EXPORT.md
    IMPLEMENTATION_LOG_CODEX_V033_BUGFIXES.md
    IMPLEMENTATION_LOG_CODEX_V034_RELEASE.md
    IMPLEMENTATION_LOG_CODEX_V035_MERGE_EMAIL.md

  archive/
    versions/
      pse_v12.html
      pse_v22_claude_continuation.html
    logs/
      IMPLEMENTATION_LOG_CLAUDE_V22.md
    outdated/
      versions/
        ISIB&F_precificação_de_projetos_v028.html
        ISIB&F_precificação_de_projetos_v029.html
        ISIB&F_precificação_de_projetos_v029_app-copy.html
        ISIB&F_precificação_de_projetos_v030.html
        ISIB&F_precificação_de_projetos_v031.html
        ISIB&F_precificação_de_projetos_v032.html
        ISIB&F_precificação_de_projetos_v033.html
        ISIB&F_precificação_de_projetos_v034.html
        ISIB&F_precificação_de_projetos_v035.html
        ISIB&F_precificação_de_projetos_v036.html
        pse_v23_codex_beta_fixes.html
        pse_v24_codex_revision_tracking.html
        pse_v25_codex_revision_cycle.html
        pse_v26_codex_revision_cleanup.html
        pse_v27_codex_validation_bar.html
        pse_v28_embrapii_rules.html
      logs/
        IMPLEMENTATION_LOG_CODEX_AUTH.md
        IMPLEMENTATION_LOG_CODEX_V23.md
        IMPLEMENTATION_LOG_CODEX_V24.md
        IMPLEMENTATION_LOG_CODEX_V25.md
        IMPLEMENTATION_LOG_CODEX_V26.md
        IMPLEMENTATION_LOG_CODEX_V27.md
        IMPLEMENTATION_LOG_CODEX_V28.md
        IMPLEMENTATION_LOG_CODEX_V29.md
```

Na branch `dev`, o diretorio `app/` fica propositalmente enxuto: somente a
versao recente de continuacao (`v051`) permanece como executavel principal.
Versoes intermediarias e experimentais ficam em `archive/outdated/` para
consulta historica sem poluir o ponto de entrada do desenvolvimento.

## Funcionalidades principais

### Tipos de proposta

- `Proposta Direta`: proposta independente, sem subequipes.
- `Proposta Mae`: proposta multi-equipe consolidada.
- `Subproposta de Equipe`: recorte de uma proposta mae para uma equipe
  participante.

Em propostas mae, a ferramenta permite selecionar equipes participantes,
definir equipe focal e adicionar colaboradores com permissao por subequipe.

### Rubricas suportadas

- Pessoal Tecnico;
- Pessoal Administrativo / Gestao;
- Viagens, Passagens e Diarias;
- Software;
- Uso de Equipamentos;
- Material de Consumo;
- Servicos de Terceiros;
- Material Permanente / Equipamentos para compra;
- Custos Indiretos e Configuracoes Gerais.

### Propostas multi-equipe

Para propostas mae:

- a proposta mae consolida itens das subpropostas;
- itens de subpropostas aparecem agrupados por equipe;
- itens proprios da proposta mae continuam editaveis na propria proposta mae;
- a aprovacao e feita no nivel do projeto como um todo;
- subpropostas nao passam por aprovacao intermediaria nesta versao beta.

### Equipe focal

Propostas mae exigem equipe focal. A equipe focal e usada para definir o
gestor/aprovador geral do projeto.

### Colaboradores e acesso

O menu `Equipe & Acesso` permite adicionar colaboradores e definir suas
subequipes de acesso/revisao. Colaboradores vinculados a uma subequipe devem
ver e editar as propostas correspondentes.

### Gestores e aprovadores

A ferramenta mantem uma lista interna de gestores/aprovadores por equipe.

Regras principais:

- proposta mae roteia aprovacao para gestor da equipe focal;
- proposta direta usa gestor da equipe da proposta, quando aplicavel;
- se houver mais de um gestor valido, o usuario deve selecionar o aprovador;
- gestor pode aprovar/finalizar proposta propria sem aprovador superior;
- isso nao dispensa validacoes financeiras ou regulatórias.

### Revisoes e controle de alteracoes

Depois do primeiro envio para aprovacao:

- alteracoes passam a ser tratadas como revisao;
- alteracoes de usuarios e gestores entram no controle de alteracoes;
- o lider tecnico pode aceitar/recusar alteracoes;
- ao concluir revisao, cria-se um novo estado base;
- o ciclo pode voltar para aprovacao e se repetir.

O pedido de revisao ocorre na proposta original, sem criar propostas duplicadas
do tipo `mae_rev` ou equivalentes.

### Barra de validacoes

A barra inferior mostra erros e avisos de validacao.

Ela foi refinada para expandir e apresentar detalhes como:

- severidade;
- mensagem;
- rubrica;
- equipe/subproposta quando aplicavel;
- valor mencionado;
- regra ou regramento relacionado.

### Catalogos de preco

Catalogos disponiveis:

- Material de Consumo / Reagentes;
- Software;
- Uso de Equipamentos;
- Material Permanente / Compra de Equipamentos.

Material de Consumo usa o catalogo real de reagentes. Software e Material
Permanente podem iniciar vazios, mas o usuario consegue salvar itens para
prospeccoes futuras.

Uso de Equipamentos usa modelo simples:

```text
Nome
Preco por hora / HM
Horas totais
Valor total
```

O valor total e calculado como preco por hora vezes horas de uso.

### Pessoal, cargos e HH

A versao atual usa tabela HH atualizada como padrao.

Tambem existe suporte a tabela antiga como `legacy`:

- Pessoal Tecnico tem checkbox `usar HH legacy?`;
- Pessoal Administrativo tem checkbox `usar HH legacy?`;
- quando marcado, a rubrica passa a usar a tabela antiga;
- quando desmarcado, usa a tabela atual;
- propostas antigas com cargos legacy continuam abrindo por fallback.

O HH informado na tabela ja e o custo horario carregado total. A ferramenta
usa:

```text
custo total = HH carregado x horas
```

Para exibicao, o total e dividido entre remuneracao e encargos usando o
percentual de encargos existente. Encargos nao sao somados novamente em cima do
HH.

### Fomentos

Fomentos suportados:

- Sem Fomento;
- EMBRAPII;
- ANP;
- Petrobras;
- ANEEL;
- combinacoes multi-fomento quando permitidas.

Para propostas antigas, `meta.fomento` continua suportado. Para propostas
novas, `meta.fomentos` representa a selecao multi-fomento.

### Regramentos e validacoes

A ferramenta possui validacoes vermelhas e amarelas.

Exemplos:

- aporte economico EMBRAPII;
- distribuicao EP / EB / SN;
- alta alavancagem EMBRAPII;
- compra de equipamento por faixa de valor de projeto;
- suporte operacional;
- DOA / CI;
- regras ANP, Petrobras e ANEEL;
- limites de horas, FTE e alocacao;
- conflitos de rubrica e itens que exigem memoria/pro-forma.

Desde a v032, as validacoes de economico EMBRAPII e indiretos em projetos
multi-equipe sao avaliadas no nivel do projeto consolidado, nao por subproposta.
Isso permite que uma subproposta forneca todo o economico do projeto sem gerar
erro isolado nas demais subpropostas.

### Propostas sem fomento

Propostas sem fomento agora permitem configurar custos indiretos.

Regra atual:

- referencia: 30%;
- abaixo de 30% gera aviso amarelo;
- nao bloqueia a proposta.

### Exportacao XLSX

A exportacao XLSX foi reconstruida na v030.

Entrada publica preservada:

```js
EXPORT.run()
```

Biblioteca usada:

```text
ExcelJS 4.4.0 via CDN
```

O arquivo gerado segue padrao profissional:

```text
ISIBF_PSE_Proposta_<proposalId>_<safeTitle>_<yyyy-mm-dd>_v037.xlsx
```

Planilhas geradas:

1. `00_Capa`
2. `01_Dashboard_PPT`
3. `02_Resumo_Financeiro`
4. `03_Origem_Recursos`
5. `04_Rubricas`
6. `05_Equipes_HH`
7. `06_Subpropostas`
8. `07_Materiais_Servicos`
9. `08_Validacoes`
10. `09_Dados_Graficos`
11. `10_Dados_Brutos`

Caracteristicas:

- capa executiva;
- dashboard pronto para uso comercial/PPT;
- resumo financeiro;
- origem de recursos;
- detalhes por rubrica;
- HH por equipe;
- subpropostas;
- materiais e servicos;
- validacoes;
- dados de graficos;
- dados brutos para auditoria/BI.

Exportacao e bloqueada quando existem erros criticos. Avisos amarelos nao
bloqueiam, mas entram na aba de validacoes.

## Fluxo recomendado de uso

1. Conectar ao DB sincronizado.
2. Fazer login com e-mail cadastrado no DB.
3. Criar proposta direta ou proposta mae.
4. Em proposta mae, selecionar equipes participantes, equipe focal e
   colaboradores.
5. Preencher rubricas.
6. Revisar barra de validacoes.
7. Usar `Atualizar DB` para salvar no JSON sincronizado.
8. Enviar para aprovacao quando nao houver erros bloqueantes.
9. Gestor solicita revisao ou aprova.
10. Lider tecnico aceita/recusa alteracoes em revisao.
11. Exportar XLSX quando a proposta estiver pronta para apresentacao.

## Cuidados operacionais

- Sempre confirme que o DB sincronizado esta conectado antes de editar.
- Use Edge ou Chrome para salvar diretamente no arquivo sincronizado.
- Clique em `Atualizar DB` antes de fechar o navegador.
- Se houver conflito de DB, recarregue e mescle antes de sobrescrever.
- Nao edite manualmente o JSON oficial sem backup.
- Mantenha backup local dos marcos importantes.

## Regras de desenvolvimento

- `main` deve conter apenas versoes validadas.
- Novas alteracoes devem ser feitas em branch de desenvolvimento.
- Nao commitar `ISIBF_DB.json`, backups ou DBs reais.
- Nao alterar formulas financeiras sem revisao explicita.
- Nao alterar regras de fomento sem registrar no log.
- Nao remover modo local/manual.
- Nao remover backup local.
- Nao refatorar sem necessidade os namespaces principais:
  - `CALC`;
  - `VAL`;
  - `EXPORT`;
  - `REVISION`;
  - `AUTH`;
  - `PRICE_CAT`;
  - `TEAM`;
  - `FOMENTO`;
  - `FILE_DB`.
- Cada versao nova deve ter HTML versionado e log correspondente.

## Historico recente

| Versao | Arquivo | Status | Resumo |
| --- | --- | --- | --- |
| v052 | `app/ISIB&F_precificação_de_projetos_v052.html` | Estavel atual | Gestores de aprovação ESP: Leonardo Teixeira adicionado como aprovador ESP em acúmulo com CIN; Stefano Ferrari e Ana Carolina Spindola removidos. |
| v051 | `archive/outdated/versions/v051/ISIB&F_precificação_de_projetos_v051.html` | Arquivado | Auditoria pre-lancamento: multi-fomento (max. 2; ANP+Petrobras proibido; indiretos pelo regime mais restritivo; EP>=50% em combo EMBRAPII+regulado), distribuicao por tier EMBRAPII (CG/AA1/AA2) que muda ao cruzar de categoria, diarias pre-preenchidas por fomento, migracao de propostas antigas e rede de testes automatizados do motor (`tools/`). |
| v050 | `archive/outdated/versions/v050/...v050.html` | Arquivado em dev | Viabilidade do otimizador avaliada no nivel do projeto (corrige falso "sem solucao"); contrapartida economica distribuida por macro proporcional ao financeiro. |
| v049 | `archive/outdated/versions/v049/...v049.html` | Arquivado em dev | Botao unico "Otimizar distribuicao (EP/EB/SN)" preservando o valor financeiro das rubricas. |
| v048 | `archive/outdated/versions/v048/...v048.html` | Arquivado em dev | Reescrita do otimizador de origem preservando itens economicos/SENAI; idempotencia e reversao quando inviavel. |
| v047 | `archive/outdated/versions/v047/...v047.html` | Arquivado em dev | Botoes de otimizacao passam a aparecer na proposta mae consolidada. |
| v044–v046 | `archive/outdated/versions/...` | Arquivado em dev | Otimizadores de distribuicao financeira (EP/EB) e por macroentrega, preservando valores e horas inteiras. |
| v040–v043 | `archive/outdated/versions/...` | Arquivado em dev | Macroentregas (fundacao, itens, XLSX, consolidacao) e auditoria de regramentos multifomento. |
| v038–v039 | `archive/outdated/versions/...` | Arquivado em dev | Horas inteiras e h/semana Petrobras; classificacao de origem EP/EB/SN por item; boas praticas ESP. |
| v037 | `archive/outdated/versions/ISIB&F_precificação_de_projetos_v037.html` | Arquivado em dev | Sidebar passa a exibir ticket medio financeiro/mês e ticket medio total/mês em proposta direta, subproposta e proposta mae. |
| v036 | `archive/outdated/versions/ISIB&F_precificação_de_projetos_v036.html` | Arquivado em dev | Versionamento da v035 validada como v036 para distribuicao no OneDrive. |
| v035 | `archive/outdated/versions/ISIB&F_precificação_de_projetos_v035.html` | Arquivado em dev | Correcao generica de metadados na mesclagem de DBs, reparo leve de `id_base` inconsistente e rascunhos de e-mail para aprovacao/revisao/aprovado sem envio automatico. |
| v034 | `archive/outdated/versions/ISIB&F_precificação_de_projetos_v034.html` | Arquivado em dev | Promocao da v033 corrigida para nome/versionamento v034, com ajuste financeiro EMBRAPII/consolidado. |
| v033 | `archive/outdated/versions/ISIB&F_precificação_de_projetos_v033.html` | Arquivado em dev | Correcoes de acesso para usuario novo, home cards, notificacoes, fechamento do menu do usuario, exclusao de proposta por gestor e ajuste financeiro EMBRAPII/consolidado. |
| v032 | `archive/outdated/versions/ISIB&F_precificação_de_projetos_v032.html` | Arquivado em dev | Ajustes de validacao por escopo de projeto, indiretos sem fomento, export XLSX v032 e seletor HH legacy/atual. |
| v031 | `archive/outdated/versions/ISIB&F_precificação_de_projetos_v031.html` | Arquivado em dev | Catalogos para Software, Uso de Equipamentos e Material Permanente; uso de equipamento por HM conhecido. |
| v030 | `archive/outdated/versions/ISIB&F_precificação_de_projetos_v030.html` | Arquivado em dev | Nova exportacao XLSX executiva com ExcelJS; seed virgem oficial; limpeza de defaults de pessoal; correcao de HH carregado. |
| v029 | `archive/outdated/versions/ISIB&F_precificação_de_projetos_v029_app-copy.html` | Arquivado em dev | Persistencia em JSON sincronizado via File System Access API. |
| v022 | `archive/versions/pse_v22_claude_continuation.html` | Arquivado | Versao historica de beta funcional. |
| v012 | `archive/versions/pse_v12.html` | Arquivado | Baseline original. |

## Logs principais

- `logs/IMPLEMENTATION_LOG_CODEX_V030_XLSX_EXPORT.md`
- `logs/IMPLEMENTATION_LOG_CODEX_V031_CATALOGS.md`
- `logs/IMPLEMENTATION_LOG_CODEX_V032_VALIDATION_EXPORT.md`
- `logs/IMPLEMENTATION_LOG_CODEX_V033_BUGFIXES.md`
- `logs/IMPLEMENTATION_LOG_CODEX_V034_RELEASE.md`
- `logs/IMPLEMENTATION_LOG_CODEX_V052_ESP_APPROVERS.md`
- `logs/IMPLEMENTATION_LOG_CURRENT.md`

## Testes automatizados do motor

A pasta `tools/` contém uma suíte que executa o motor real (`CALC`/`VAL`/`FOMENTO`)
fora do navegador, para travar regressão silenciosa nas fórmulas e nas regras
regulatórias. Rode antes de qualquer release:

```text
node tools/run_tests.js
```

Cobre: golden snapshot do `CALC`, ~22 regras de risco do `VAL.run`, regras
multi-fomento, migração de propostas e consolidação mãe/filha. Para atualizar
o golden após uma mudança intencional de cálculo: `UPDATE_SNAPSHOTS=1 node tools/test_engine_calc_golden.js`.

## Testes manuais recomendados antes de release

- Abrir v052 no Edge/Chrome (ver também `logs/CHECKLIST_V052_BROWSER.md`).
- Conectar `ISIBF_DB.json` pelo modo `DB sincronizado`.
- Confirmar que landing mostra status verde do DB.
- Criar proposta direta sem fomento e configurar indiretos abaixo/acima de 30%.
- Criar proposta mae EMBRAPII com pelo menos duas subequipes.
- Confirmar que economico e indiretos sao validados no projeto consolidado.
- Testar colaborador acessando apenas subequipe autorizada.
- Testar gestor aprovando e solicitando revisao.
- Testar controle de alteracoes apos envio inicial para aprovacao.
- Importar reagente do catalogo e confirmar `valor unitario x quantidade`.
- Importar equipamento por HM e confirmar `HM x horas`.
- Alternar `usar HH legacy?` em Pessoal Tecnico e Administrativo.
- Gerar XLSX e abrir no Excel desktop sem aviso de reparo.

## Status atual

`dev_v038_beta_rules` contem a v052 (gestores de aprovação ESP Leonardo Teixeira e atualização v052). Promovida para `main` apos a validacao manual da equipe (ver `logs/CHECKLIST_V052_BROWSER.md`).
