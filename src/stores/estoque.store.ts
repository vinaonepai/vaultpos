import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user.store'
import { createProduto, deleteProduto, getProdutos, updateProduto } from '@/supabase/queries/produtos'
import { createCategoria, getCategorias } from '@/supabase/queries/categorias'
import { getMovimentacoes, movimentarEstoque } from '@/supabase/queries/estoque'
import type { CreateProduto, UpdateProduto } from '@/types/database.types'

export const useEstoqueStore = defineStore('estoque', () => {
  // State
  const produtos = ref<any[]>([])
  const categorias = ref<any[]>([])
  const movimentacoes = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const produtosAtivos = computed(() =>
    produtos.value.filter(p => p.ativo)
  )
  const produtosEstoqueBaixo = computed(() =>
    produtos.value.filter(p => p.estoque <= p.estoque_minimo && p.ativo)
  )
  const totalProdutos = computed(() => produtosAtivos.value.length)
  const totalEstoqueBaixo = computed(() => produtosEstoqueBaixo.value.length)

  // Buscar produtos
  async function fetchProdutos() {
    const userStore = useUserStore()
    if (!userStore.empresaId) return

    loading.value = true
    error.value = null
    try {
      produtos.value = await getProdutos(userStore.empresaId)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Buscar categorias
  async function fetchCategorias() {
    const userStore = useUserStore()
    if (!userStore.empresaId) return

    loading.value = true
    error.value = null
    try {
      categorias.value = await getCategorias(userStore.empresaId)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Buscar movimentações
  async function fetchMovimentacoes() {
    const userStore = useUserStore()
    if (!userStore.empresaId) return

    loading.value = true
    error.value = null
    try {
      movimentacoes.value = await getMovimentacoes(userStore.empresaId)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Registrar movimentação de estoque
  async function registrarMovimentacao(dados: {
    produto_id: string
    tipo: 'entrada' | 'saida' | 'ajuste'
    quantidade: number
    motivo?: string
  }) {
    const userStore = useUserStore()
    if (!userStore.empresaId || !userStore.usuario) return

    loading.value = true
    error.value = null
    try {
      await movimentarEstoque({
        empresa_id: userStore.empresaId,
        usuario_id: userStore.usuario.id,
        ...dados,
      })
      await fetchProdutos()
      await fetchMovimentacoes()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Criar produto
  async function criarProduto(dados: Omit<CreateProduto, 'empresa_id'>) {
    const userStore = useUserStore()
    if (!userStore.empresaId) {
      const err = new Error('Empresa nao encontrada')
      error.value = err.message
      throw err
    }

    loading.value = true
    error.value = null
    try {
      await createProduto({
        empresa_id: userStore.empresaId,
        ...dados,
      })
      await fetchProdutos()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Editar produto
  async function editarProduto(id: string, dados: UpdateProduto) {
    loading.value = true
    error.value = null
    try {
      await updateProduto(id, dados)
      await fetchProdutos()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Desativar produto
  async function desativarProduto(id: string) {
    loading.value = true
    error.value = null
    try {
      await deleteProduto(id)
      await fetchProdutos()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Criar categoria
  async function criarCategoria(nome: string) {
    const userStore = useUserStore()
    if (!userStore.empresaId) {
      const err = new Error('Empresa nao encontrada')
      error.value = err.message
      throw err
    }

    loading.value = true
    error.value = null
    try {
      const categoria = await createCategoria({
        empresa_id: userStore.empresaId,
        nome,
        descricao: null,
        ativo: true,
      })
      await fetchCategorias()
      return categoria
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    produtos,
    categorias,
    movimentacoes,
    loading,
    error,
    // Getters
    produtosAtivos,
    produtosEstoqueBaixo,
    totalProdutos,
    totalEstoqueBaixo,
    // Actions
    fetchProdutos,
    fetchCategorias,
    fetchMovimentacoes,
    registrarMovimentacao,
    criarProduto,
    editarProduto,
    desativarProduto,
    criarCategoria,
  }
})
