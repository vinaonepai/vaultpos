import { supabase } from '../client'
import type { MovimentacaoEstoque, MovimentacaoComRelacoes, CreateMovimentacao } from '@/types/database.types'

export async function getMovimentacoes(empresaId: string): Promise<MovimentacaoComRelacoes[]> {
  const { data, error } = await supabase
    .from('movimentacoes_estoque')
    .select('*, produtos(id, nome), usuarios(id, nome)')
    .eq('empresa_id', empresaId)
    .order('data', { ascending: false })
  if (error) throw error
  return data as MovimentacaoComRelacoes[]
}

export async function movimentarEstoque(mov: CreateMovimentacao): Promise<MovimentacaoEstoque> {
  const { data: produto, error: prodError } = await supabase
    .from('produtos')
    .select('estoque')
    .eq('id', mov.produto_id)
    .single()
  if (prodError) throw prodError

  let novoEstoque = produto.estoque
  if (mov.tipo === 'entrada') novoEstoque += mov.quantidade
  else if (mov.tipo === 'saida') novoEstoque -= mov.quantidade
  else novoEstoque = mov.quantidade

  if (novoEstoque < 0) throw new Error('Estoque insuficiente.')

  const { data, error } = await supabase
    .from('movimentacoes_estoque')
    .insert(mov)
    .select()
    .single()
  if (error) throw error

  await supabase
    .from('produtos')
    .update({ estoque: novoEstoque })
    .eq('id', mov.produto_id)

  return data
}