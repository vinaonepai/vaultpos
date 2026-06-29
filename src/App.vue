<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue'
import { supabase } from '@/supabase/client'

onMounted(async () => {
  const { data, error } = await supabase.from('empresas').select('*')
  console.log('✅ Conexão OK:', data)
  console.log('❌ Erro:', error)
})
</script>
