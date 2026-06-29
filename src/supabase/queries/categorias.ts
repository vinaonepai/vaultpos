import { supabase } from '../client'
import type { Categoria, CreateCategoria, UpdateCategoria } from '@/types/database.types'

export async function getCategorias(empresaId: string): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('ativo', true)
    .order('nome')
  if (error) throw error
  return data
}

export async function createCategoria(categoria: CreateCategoria): Promise<Categoria> {
  const { data, error } = await supabase
    .from('categorias')
    .insert(categoria)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCategoria(id: string, updates: UpdateCategoria): Promise<Categoria> {
  const { data, error } = await supabase
    .from('categorias')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCategoria(id: string) {
  const { error } = await supabase
    .from('categorias')
    .update({ ativo: false })
    .eq('id', id)
  if (error) throw error
}