import { supabase } from '../client'
import type { EmpresaComConfiguracoes, UpdateEmpresa, UpdateConfiguracao } from '@/types/database.types'

export async function getEmpresa(id: string): Promise<EmpresaComConfiguracoes> {
  const { data, error } = await supabase
    .from('empresas')
    .select('*, configuracoes(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as EmpresaComConfiguracoes
}

export async function updateEmpresa(id: string, updates: UpdateEmpresa) {
  const { data, error } = await supabase
    .from('empresas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateConfiguracoes(empresaId: string, updates: UpdateConfiguracao) {
  const { data, error } = await supabase
    .from('configuracoes')
    .update(updates)
    .eq('empresa_id', empresaId)
    .select()
    .single()
  if (error) throw error
  return data
}