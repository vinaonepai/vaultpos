<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

onMounted(async () => {
  try {
    await auth.init()
  } catch (error) {
    console.error('Erro ao inicializar autenticação:', error)
  }
})
</script>

