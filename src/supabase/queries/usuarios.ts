import { supabase } from '../client'
import type { Usuario, CreateUsuario, UpdateUsuario } from '@/types/database.types'

export async function getUsuarios(empresaId: string): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('ativo', true)
    .order('nome')
  if (error) throw error
  return data
}

export async function getUsuarioById(id: string): Promise<Usuario> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getUsuarioByEmail(email: string): Promise<Usuario> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single()
  if (error) throw error
  return data
}

export async function createUsuario(usuario: CreateUsuario): Promise<Usuario> {
  const { data, error } = await supabase
    .from('usuarios')
    .insert(usuario)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateUsuario(id: string, updates: UpdateUsuario): Promise<Usuario> {
  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteUsuario(id: string) {
  const { error } = await supabase
    .from('usuarios')
    .update({ ativo: false })
    .eq('id', id)
  if (error) throw error
}

export async function updateUltimoLogin(id: string) {
  const { error } = await supabase
    .from('usuarios')
    .update({ ultimo_login: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}