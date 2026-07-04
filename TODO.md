- [x] Entender o fluxo atual de navegação do app (rotas + auth)
- [ ] Atualizar `src/App.vue` para inicializar o authStore e redirecionar para rota inicial (em vez de só fazer query no Supabase)
- [x] Ajustar `src/main.ts`/`App.vue` para chamar `authStore.init()` e então navegar (`/login`)

- [ ] Remover/encapsular a query de `empresas` do `App.vue` (ou deixar não-bloqueante)
- [ ] Validar `ionic serve` e confirmar que abre no login ou redireciona corretamente

