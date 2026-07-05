<template>
  <ion-page>
    <auth-layout :pills="['Segurança', 'Rápido', 'Simples']">
      <template #hero-title>
        <h1>Recuperar senha</h1>
      </template>

      <template #hero-description>
        <p>Informe seu e-mail e enviaremos instruções para redefinir sua senha.</p>
      </template>

      <ion-card class="auth-card">
        <ion-card-header>
          <ion-card-title>Redefinir senha</ion-card-title>
          <ion-card-subtitle>Enviaremos um link para o seu e-mail</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-list inset>
            <ion-item>
              <ion-label position="stacked">E-mail</ion-label>
              <ion-input v-model="email" type="email" placeholder="seu@email.com" autocomplete="email" />
            </ion-item>
          </ion-list>

          <ion-button expand="block" class="login-button" @click="handleReset">
            Enviar link
          </ion-button>

          <div class="auth-links auth-links-end">
            <a href="#" @click.prevent="goToLogin">Voltar ao login</a>
          </div>
        </ion-card-content>
      </ion-card>
    </auth-layout>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  toastController,
} from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')

const showToast = async (message: string, color: 'success' | 'danger' = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 2200,
    color,
    position: 'top',
  })

  await toast.present()
}

const goToLogin = () => {
  router.replace('/login')
}

const handleReset = async () => {
  if (!email.value.trim()) {
    await showToast('Informe um e-mail válido.', 'danger')
    return
  }

  try {
    await auth.forgotPassword(email.value.trim())
    await showToast('Link de redefinição enviado para o seu e-mail.', 'success')
    router.replace('/login')
  } catch (error: any) {
    console.error('Falha ao enviar redefinição:', error)
    await showToast(error?.message || 'Não foi possível enviar o link.', 'danger')
  }
}
</script>
