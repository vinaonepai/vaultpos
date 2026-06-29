import { supabase } from './client'

const BUCKET_PRODUTOS = 'produtos'
const BUCKET_EMPRESAS = 'empresas'
const BUCKET_USUARIOS = 'usuarios'

export async function uploadImagemProduto(empresaId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${empresaId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from(BUCKET_PRODUTOS)
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = supabase.storage.from(BUCKET_PRODUTOS).getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function uploadLogoEmpresa(empresaId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${empresaId}/logo.${ext}`
  const { data, error } = await supabase.storage
    .from(BUCKET_EMPRESAS)
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = supabase.storage.from(BUCKET_EMPRESAS).getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function uploadFotoUsuario(usuarioId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${usuarioId}/foto.${ext}`
  const { data, error } = await supabase.storage
    .from(BUCKET_USUARIOS)
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = supabase.storage.from(BUCKET_USUARIOS).getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}