<template>
  <ion-page>
    <auth-layout :pills="['Gestão', 'Segurança', 'Escalável']">
      <template #hero-title>
        <h1>Crie sua conta</h1>
      </template>

      <template #hero-description>
        <p>Cadastre-se para acessar o painel, organizar vendas e controlar seu negócio com agilidade.</p>
      </template>

      <ion-card class="auth-card">
        <ion-card-header>
          <ion-card-title>Criar conta</ion-card-title>
          <ion-card-subtitle>Preencha os dados abaixo</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-list inset>
            <ion-item>
              <ion-label position="stacked">Nome</ion-label>
              <ion-input v-model="name" placeholder="Seu nome" autocomplete="name" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">E-mail</ion-label>
              <ion-input v-model="email" type="email" placeholder="seu@email.com" autocomplete="email" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Senha</ion-label>
              <ion-input v-model="password" type="password" placeholder="********" autocomplete="new-password" />
            </ion-item>
          </ion-list>

          <ion-button expand="block" class="login-button" @click="handleRegister">
            Cadastrar
          </ion-button>

          <div class="auth-links auth-links-end">
            <a href="#" @click.prevent="goToLogin">Já tenho conta</a>
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

const name = ref('')
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

const goToLogin = () => {
  router.replace('/login')
}

const handleRegister = async () => {
  if (!name.value.trim() || !email.value.trim() || !password.value.trim()) {
    await showToast('Preencha todos os campos para continuar.', 'danger')
    return
  }

  try {
    await auth.register(email.value.trim(), password.value, { full_name: name.value.trim() })
    await showToast('Conta criada com sucesso!', 'success')
    router.replace('/home')
  } catch (error: any) {
    console.error('Falha ao cadastrar:', error)
    await showToast(error?.message || 'Não foi possível criar a conta.', 'danger')
  }
}
</script>
