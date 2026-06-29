import { supabase } from '../client'
import type {
  Comanda, ComandaComRelacoes, ComandaDetalhada,
  ItemComanda, ItemComandaComProduto,
  CreateComanda, UpdateComanda, CreateItemComanda,
  StatusComanda
} from '@/types/database.types'

export async function getComandas(empresaId: string, status?: StatusComanda): Promise<ComandaComRelacoes[]> {
  let query = supabase
    .from('comandas')
    .select('*, clientes(id, nome, telefone), usuarios(id, nome)')
    .eq('empresa_id', empresaId)
    .order('criada_em', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data as ComandaComRelacoes[]
}

export async function getComandaById(id: string): Promise<ComandaDetalhada> {
  const { data, error } = await supabase
    .from('comandas')
    .select(`
      *,
      clientes(id, nome, telefone),
      usuarios(id, nome),
      itens_comanda(
        id, quantidade, valor_unitario, subtotal,
        produtos(id, nome, imagem)
      )
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as ComandaDetalhada
}

export async function createComanda(comanda: CreateComanda): Promise<Comanda> {
  const { data, error } = await supabase
    .from('comandas')
    .insert({ ...comanda, status: 'aberta' as StatusComanda })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateComanda(id: string, updates: UpdateComanda): Promise<Comanda> {
  const { data, error } = await supabase
    .from('comandas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addItemComanda(item: CreateItemComanda & { valor_unitario: number }): Promise<ItemComanda> {
  const subtotal = item.quantidade * item.valor_unitario
  const { data, error } = await supabase
    .from('itens_comanda')
    .insert({ ...item, subtotal })
    .select()
    .single()
  if (error) throw error
  await recalcularTotais(item.comanda_id)
  return data
}

export async function updateItemQuantidade(itemId: string, comandaId: string, quantidade: number, valorUnitario: number): Promise<ItemComanda> {
  const subtotal = quantidade * valorUnitario
  const { data, error } = await supabase
    .from('itens_comanda')
    .update({ quantidade, subtotal })
    .eq('id', itemId)
    .select()
    .single()
  if (error) throw error
  await recalcularTotais(comandaId)
  return data
}

export async function removeItemComanda(itemId: string, comandaId: string) {
  const { error } = await supabase
    .from('itens_comanda')
    .delete()
    .eq('id', itemId)
  if (error) throw error
  await recalcularTotais(comandaId)
}

export async function fecharComanda(id: string, desconto = 0): Promise<Comanda> {
  const comanda = await getComandaById(id)
  const total = comanda.subtotal + comanda.taxa_servico - desconto
  return updateComanda(id, {
    status: 'fechada',
    desconto,
    total,
    fechada_em: new Date().toISOString(),
  })
}

export async function cancelarComanda(id: string) {
  return updateComanda(id, {
    status: 'cancelada',
    fechada_em: new Date().toISOString(),
  })
}

async function recalcularTotais(comandaId: string) {
  const { data: itens, error } = await supabase
    .from('itens_comanda')
    .select('subtotal')
    .eq('comanda_id', comandaId)
  if (error) throw error

  const subtotal = itens.reduce((acc, item) => acc + item.subtotal, 0)

  const { data: comanda } = await supabase
    .from('comandas')
    .select('taxa_servico, desconto')
    .eq('id', comandaId)
    .single()

  const total = subtotal + (comanda?.taxa_servico ?? 0) - (comanda?.desconto ?? 0)

  await supabase
    .from('comandas')
    .update({ subtotal, total })
    .eq('id', comandaId)
}