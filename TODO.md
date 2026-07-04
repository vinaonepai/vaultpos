- [x] Entender o fluxo atual de navegação do app (rotas + auth)
- [ ] Atualizar `src/App.vue` para inicializar o authStore e redirecionar para rota inicial (em vez de só fazer query no Supabase)
- [x] Ajustar `src/main.ts`/`App.vue` para chamar `authStore.init()` e então navegar (`/login`)

- [ ] Remover/encapsular a query de `empresas` do `App.vue` (ou deixar não-bloqueante)
- [ ] Validar `ionic serve` e confirmar que abre no login ou redireciona corretamente

## PARTE 1 — Ajustes Estruturais
- [x] Reorganizar tab bar do Admin: criar MaisPage.vue e adicionar rota /admin/mais
- [x] Criar .env.example como referência de configuração
- [x] Documentar sistema de autenticação híbrido em auth.store.ts
- [x] Corrigir infinite redirect no router guard (problema com /home)
- [ ] Decidir se o login local (mock) deve ser removido antes de produção ou mantido apenas como fallback de desenvolvimento
- [ ] Configurar variáveis Supabase reais no .env (se necessário para próximas etapas)

## PARTE 2 em diante — Implementar conteúdo das telas
- [ ] Implementar Dashboard Admin
- [ ] Implementar página de Produtos
- [ ] Implementar página de Estoque
- [ ] Implementar página de Financeiro
- [ ] Implementar página de Empresa
- [ ] Implementar página de Relatórios
- [ ] Implementar página de Usuários
- [ ] Implementar página de Configurações
- [ ] Implementar Dashboard Garçom
- [ ] Implementar página de Comandas
- [ ] Implementar página de Pagamentos
- [ ] Implementar página de Estoque Garçom
- [ ] Implementar página de Perfil Garçom
