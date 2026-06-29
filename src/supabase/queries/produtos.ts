import { supabase } from '../client'
import type { Produto, ProdutoComCategoria, CreateProduto, UpdateProduto } from '@/types/database.types'

export async function getProdutos(empresaId: string): Promise<ProdutoComCategoria[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*, categorias(id, nome)')
    .eq('empresa_id', empresaId)
    .eq('ativo', true)
    .order('nome')
  if (error) throw error
  return data as ProdutoComCategoria[]
}

export async function getProdutoById(id: string): Promise<ProdutoComCategoria> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*, categorias(id, nome)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as ProdutoComCategoria
}

export async function getProdutosPorCategoria(empresaId: string, categoriaId: string): Promise<Produto[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('categoria_id', categoriaId)
    .eq('ativo', true)
    .order('nome')
  if (error) throw error
  return data
}

export async function createProduto(produto: CreateProduto): Promise<Produto> {
  const { data, error } = await supabase
    .from('produtos')
    .insert(produto)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProduto(id: string, updates: UpdateProduto): Promise<Produto> {
  const { data, error } = await supabase
    .from('produtos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProduto(id: string) {
  const { error } = await supabase
    .from('produtos')
    .update({ ativo: false })
    .eq('id', id)
  if (error) throw error
}