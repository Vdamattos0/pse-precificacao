# ISIB&F PSE - Controle de Versoes

Registro das versoes da ferramenta distribuida na pasta compartilhada.

> **Regra simples:** a versao indicada como atual aqui deve ser o HTML que os usuarios devem abrir para trabalhar.

---

## Versao atual

| Campo | Valor |
| --- | --- |
| Versao estavel | **v052** |
| Arquivo HTML atual | `ISIB&F_precificação_de_projetos_v052.html` |
| DB oficial | `ISIBF_DB.json` |
| Status | Validada para uso beta/operacional |
| Data de referencia | Julho/2026 |

---

## O que mudou na v052

### Aprovacao ESP

- Leonardo Teixeira permanece como aprovador da ESP, em acumulo com CIN.
- York Castillo Santiago foi adicionado como aprovador da ESP.
- Stefano Ferrari e Ana Carolina Spindola foram removidos da lista de aprovadores ativos da ESP.

### Permissoes e manutencao

- Papel `dev-II` habilitado para manutencao ampliada.
- Usuario `dev-II` pode editar propostas de qualquer equipe, inclusive aprovadas.
- Usuario `dev-II` pode excluir propostas quando necessario.

### Navegacao e edicao

- Navegacao de `Inicio` ajustada no cabecalho.
- Fechamento do painel `Nova Proposta` refinado.
- Botao de lapis adicionado para reconfiguracao de metadados do projeto.
- Botao `Duplicar proposta atual` adicionado no menu do usuario.
- A copia abre pronta para edicao com novo ID e status `em_elaboracao`.
- Em proposta mae, a duplicacao replica tambem as subequipes.

### Fluxo operacional atual

- `Salvar` grava no DB sincronizado.
- `Backup DB` gera uma copia local.
- Fluxo de aprovacao e revisao permanece ativo na v052.

---

## Historico recente

| Versao | Arquivo | Status | Principais diferencas |
| --- | --- | --- | --- |
| **v052** | `ISIB&F_precificação_de_projetos_v052.html` | Atual | Aprovadores ESP atualizados; permissao `dev-II`; exclusao administrativa; duplicacao de proposta; refinamentos de navegacao e edicao. |
| v051 | `archive/outdated/versions/v051/ISIB&F_precificação_de_projetos_v051.html` | Arquivada | Auditoria pre-lancamento; multi-fomento; tiers EMBRAPII; rede de testes automatizados. |
| v050 | `archive/outdated/versions/v050/ISIB&F_precificação_de_projetos_v050.html` | Arquivada | Viabilidade do otimizador avaliada no nivel do projeto; contrapartida economica distribuida por macro. |
| v049 | `archive/outdated/versions/v049/ISIB&F_precificação_de_projetos_v049.html` | Arquivada | Botao unico `Otimizar distribuicao (EP/EB/SN)`. |
| v048 | `archive/outdated/versions/v048/ISIB&F_precificação_de_projetos_v048.html` | Arquivada | Reescrita do otimizador de origem financeira com reversao quando inviavel. |

---

## Politica de arquivos na pasta compartilhada

Manter na pasta compartilhada:

- HTML atual da ferramenta;
- `ISIBF_DB.json`;
- `ISIBF_PSE_Registro_de_Bugs_e_Sugestoes.md`;
- `ISIBF_PSE_Controle_de_Versoes.md`;
- `ISIBF_PSE_Tutorial_de_Uso.md`.

Evitar na pasta compartilhada:

- muitos HTMLs antigos soltos;
- backups sem data clara;
- arquivos de teste com nomes parecidos com o DB oficial;
- copias manuais do DB sem explicacao;
- DBs paralelos sem validacao da equipe.

---

## Checklist de liberacao de nova versao

Antes de trocar a versao atual:

- [ ] O HTML abre no Edge/Chrome.
- [ ] O DB sincronizado conecta.
- [ ] A landing mostra status claro do DB.
- [ ] Criacao de proposta funciona.
- [ ] `Salvar` grava no JSON sincronizado.
- [ ] `Backup DB` gera copia local corretamente.
- [ ] Fluxo de aprovacao funciona.
- [ ] Fluxo de revisao funciona.
- [ ] Barra de validacoes mostra erros/avisos corretamente.
- [ ] Catalogos principais funcionam.
- [ ] Exportacao XLSX gera arquivo.
- [ ] XLSX abre no Excel sem aviso de reparo.
- [ ] README/logs no GitHub foram atualizados.
- [ ] Este arquivo foi atualizado.
- [ ] Usuarios foram avisados sobre qual HTML abrir.

---
