# TODO - VaultPOS (Admin > Dashboard) - Parte 2/11

- [ ] Passo 1: Atualizar `src/router/index.ts` para chamar `userStore.fetchUsuarioLogado()` no `beforeEach` para rotas privadas, quando `userStore.usuario` ainda estiver `null`.
- [ ] Passo 2: Implementar `src/pages/admin/DashboardAdmin.vue` completo:
  - [ ] Header com saudação
  - [ ] Loading (skeleton/spinner) durante busca
  - [ ] Banner de erro quando `empresaId` não existir
  - [ ] 4 cards de métricas usando as stores existentes
  - [ ] Seção “Recebimentos por método” com barras proporcionais
  - [ ] Seção “Atenção: Estoque Baixo” (até 5, com link para `/admin/estoque`)
  - [ ] Seção “Comandas Abertas” (até 5, com cálculo “há X min”)
  - [ ] `onMounted` com `Promise.all` e `finally` para desligar loading
- [ ] Passo 3: Validar manualmente navegando para `/admin/dashboard` após login (e cenário de usuário mock/sem empresa).

