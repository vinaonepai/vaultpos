<template>
  <ion-page>
    <auth-layout :pills="['Realtime', 'Gestão', 'Futuro']">
      <template #hero-title>
        <h1>Controle inteligente para seu negócio</h1>
      </template>

      <template #hero-description>
        <p>
          Acompanhe pedidos, estoque e pagamentos com uma interface premium, rápida e preparada para crescer.
        </p>
      </template>

      <ion-card class="auth-card">
        <ion-card-header>
          <ion-card-title>Entrar na conta</ion-card-title>
          <ion-card-subtitle>Use suas credenciais para continuar</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-list inset>
            <ion-item>
              <ion-label position="stacked">E-mail</ion-label>
              <ion-input
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                autocomplete="email"
              />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Senha</ion-label>
              <ion-input
                v-model="password"
                type="password"
                placeholder="********"
                autocomplete="current-password"
              />
            </ion-item>
          </ion-list>

          <ion-button expand="block" class="login-button" @click="handleLogin">
            Entrar
          </ion-button>

          <div class="auth-links">
            <a href="#" @click.prevent="goToForgotPassword">Esqueci minha senha</a>
            <a href="#" @click.prevent="goToRegister">Criar conta</a>
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
const password = ref('')

const showToast = async (message: string, color: 'success' | 'danger' = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 2200,
    color,
    position: 'top',
  })

  await toast.present()
}

const goToForgotPassword = () => router.replace('/forgot-password')
const goToRegister = () => router.replace('/register')

const handleLogin = async () => {
  try {
    await auth.login(email.value, password.value)
    await showToast('Login realizado com sucesso!', 'success')
    router.replace('/home')
  } catch (error: any) {
    console.error('Falha ao entrar:', error)
    await showToast(error?.message || 'Não foi possível entrar.', 'danger')
  }
}
</script>
