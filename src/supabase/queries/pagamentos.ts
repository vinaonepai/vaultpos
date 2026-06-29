import { supabase } from '../client'
import type { Pagamento, PagamentoComRelacoes, CreatePagamento } from '@/types/database.types'

export async function getPagamentos(empresaId: string): Promise<PagamentoComRelacoes[]> {
  const { data, error } = await supabase
    .from('pagamentos')
    .select('*, comandas(id, mesa), usuarios(id, nome)')
    .eq('empresa_id', empresaId)
    .order('data_pagamento', { ascending: false })
  if (error) throw error
  return data as PagamentoComRelacoes[]
}

export async function getPagamentosByComanda(comandaId: string): Promise<Pagamento[]> {
  const { data, error } = await supabase
    .from('pagamentos')
    .select('*')
    .eq('comanda_id', comandaId)
  if (error) throw error
  return data
}

export async function createPagamento(pagamento: CreatePagamento): Promise<Pagamento> {
  const { data, error } = await supabase
    .from('pagamentos')
    .insert({ ...pagamento, status: 'pago' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cancelarPagamento(id: string) {
  const { error } = await supabase
    .from('pagamentos')
    .update({ status: 'cancelado' })
    .eq('id', id)
  if (error) throw error
}