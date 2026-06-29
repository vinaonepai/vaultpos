import { supabase } from '../client'
import type { Cliente, CreateCliente, UpdateCliente } from '@/types/database.types'

export async function getClientes(empresaId: string): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('nome')
  if (error) throw error
  return data
}

export async function getClienteById(id: string): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createCliente(cliente: CreateCliente): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .insert(cliente)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCliente(id: string, updates: UpdateCliente): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCliente(id: string) {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)
  if (error) throw error
}