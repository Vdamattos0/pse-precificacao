# Roteiro de validação no navegador — v052 (Aprovadores ESP)

> Abra `app/ISIB&F_precificação_de_projetos_v052.html`. **Faça a validação preferencialmente com uma CÓPIA do DB**
> do beta (não salve por cima do oficial até validar). Marque `[x]` no que passar.

## 0. Setup e sanity
- [ ] Título da aba/rodapé mostra **v052**.
- [ ] Console do navegador (F12) **sem erros** ao abrir.
- [ ] Conectar `ISIBF_DB.json` pelo modo `DB sincronizado`.

## 1. Cadastro de Aprovadores (Código e Banco de Dados)
- [ ] Acesse a tela de **Gestão de Usuários** (menu do usuário -> Usuários, se perfil administrador estiver ativo).
- [ ] Verifique se **Stefano Ferrari** e **Ana Carolina Spindola** não constam mais na listagem de usuários.
- [ ] Verifique se **Leonardo Teixeira** consta na listagem e sua equipe está descrita como `CIN,ESP`.

## 2. Seleção de Aprovador por Equipes (Proposta Direta)
- [ ] Crie uma nova proposta direta.
- [ ] Na configuração da proposta, selecione a equipe **CIN**:
  - [ ] No campo de seleção do aprovador, confirme que **Leonardo Teixeira** aparece como opção selecionável.
- [ ] Mude a equipe da proposta para **ESP**:
  - [ ] No campo de seleção do aprovador, confirme que **Leonardo Teixeira** continua aparecendo como opção selecionável (filtrado para ESP).
- [ ] Mude a equipe para **TAP**:
  - [ ] Confirme que **Leonardo Teixeira** não aparece nas opções (ou o filtro muda para a equipe TAP e exibe o aprovador correto da TAP).

## 3. Seleção de Aprovador na Proposta Mãe
- [ ] Crie uma proposta mãe.
- [ ] Adicione subpropostas para as equipes **CIN** e **ESP**:
  - [ ] Na subproposta **CIN**, o aprovador padrão associado automaticamente (ou no select) é **Leonardo Teixeira** (lvteixeira@firjan.com.br).
  - [ ] Na subproposta **ESP**, o aprovador padrão associado automaticamente (ou no select) é **Leonardo Teixeira** (lvteixeira@firjan.com.br).
  - [ ] Confirme que não há erro de falta de gestor para a equipe ESP.

## 4. Remoção Definitiva de Aprovadores
- [ ] Tente pesquisar ou selecionar **Stefano Ferrari** ou **Ana Carolina Spindola** em qualquer dropdown de aprovador: confirme que nenhum deles é retornado ou está disponível.
- [ ] Verifique se no histórico do DB sincronizado não foram reinjetados após salvar.

## 5. Exportação e Sanity Check do XLSX
- [ ] Exporte uma proposta da v052 para XLSX:
  - [ ] O nome do arquivo gerado deve conter o sufixo `_v052.xlsx`.
  - [ ] Na folha `00_Capa`, o campo "Versao" exibe `v052` e a linha superior do título mostra "Exportacao comercial v052".

## 6. UX: Navegação e Edição de Metadados
- [ ] No cabeçalho da proposta, verifique a presença do link **Início**:
  - [ ] Clique em **Início**: confirme que o workspace é ocultado e a tela inicial (cards pós-login) é mostrada de forma correta.
  - [ ] Clique no logotipo **PSE Firjan · ISIB&F** no canto superior esquerdo: confirme que ele também retorna para a tela inicial.
- [ ] Clique em **Nova Proposta** a partir da tela inicial:
  - [ ] Sem preencher nada, clique em **Cancelar** no modal de criação: confirme que a interface retorna suavemente para a tela inicial.
- [ ] Abra uma proposta existente na qual você tenha permissão de edição (perfil Elaborador/Líder/Gestor):
  - [ ] Verifique o ícone de lápis (editar) exibido ao lado do título do projeto.
  - [ ] Clique no lápis: confirme que o modal **Configuração do Projeto** é aberto preenchido com as informações atuais.
  - [ ] Altere o **Fomento** (ex: mude de EMBRAPII para ANP), mude o título ou altere a duração, e clique em **Salvar**: confirme que as alterações são propagadas imediatamente, os totais e regras são recalculados no ato, e a barra de título é atualizada.

## 7. Validação do Papel de Desenvolvedor (dev-II)
- [ ] Faça logout do usuário atual e tente logar com o email: `vdmattos@firjan.com.br`
  - [ ] Confirme que a senha exigida é `SENAI`.
  - [ ] Ao logar, verifique se no canto superior direito o seu avatar exibe o chip de papel azul **dev II**.
- [ ] Abra qualquer proposta existente que esteja no status **Aprovado**:
  - [ ] Confirme que as seções não estão bloqueadas como somente leitura (não há o banner amarelo e os inputs e botões de adicionar estão ativos).
  - [ ] Altere algum campo ou valor da proposta aprovada e clique em **Salvar**: confirme que o salvamento é realizado com sucesso.
- [ ] No menu do usuário (clique no avatar), verifique que a opção **Excluir proposta atual** está disponível.
  - [ ] Crie uma proposta de teste temporária e clique em **Excluir proposta atual**: confirme que o projeto é apagado do DB após a confirmação.

## 8. Testes Automatizados
- [ ] Rodar `node tools/run_tests.js` e verificar que todas as suítes passaram (verde).
