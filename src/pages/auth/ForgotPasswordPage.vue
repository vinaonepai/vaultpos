<template>
  <ion-page>
    <ion-content fullscreen class="auth-page">
      <div class="auth-shell">
        <section class="auth-hero">
          <div class="brand-mark">
            <span class="brand-dot" />
            <span>VaultPOS</span>
          </div>
          <h1>Recuperar senha</h1>
          <p>Informe seu e-mail e enviaremos instruções para redefinir sua senha.</p>
          <div class="hero-pills">
            <span>Segurança</span>
            <span>Rápido</span>
            <span>Simples</span>
          </div>
        </section>

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

            <div class="auth-links">
              <a href="#" @click.prevent="goToLogin">Voltar ao login</a>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
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
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  toastController,
} from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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

<style scoped>
.auth-page { display:flex; align-items:center; justify-content:center; padding:2rem; }
.auth-shell { width:min(1180px,100%); display:grid; gap:2rem; align-items:center; grid-template-columns:1.1fr 0.9fr; }
.auth-hero { padding:2.25rem; border-radius:32px; background:linear-gradient(135deg, rgba(18,18,18,0.95) 0%, rgba(8,8,8,0.9) 100%); border:1px solid rgba(255,122,26,0.2); box-shadow:0 30px 80px rgba(0,0,0,0.45); }
.brand-mark { display:inline-flex; align-items:center; gap:0.7rem; padding:0.45rem 0.85rem; border-radius:999px; background:rgba(255,122,26,0.12); color:var(--ion-color-primary); font-weight:700; letter-spacing:0.08em; text-transform:uppercase; font-size:0.82rem; }
.brand-dot { width:0.8rem; height:0.8rem; border-radius:50%; background:linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary)); box-shadow:0 0 16px rgba(255,122,26,0.6); }
.auth-hero h1 { margin:1.2rem 0 0.85rem; font-size:clamp(2rem,3.7vw,3.3rem); line-height:1.05; }
.auth-hero p { font-size:1rem; color:#d1d5db; max-width:40rem; line-height:1.65; }
.hero-pills { display:flex; flex-wrap:wrap; gap:0.75rem; margin-top:1.4rem; }
.hero-pills span { padding:0.5rem 0.8rem; border-radius:999px; background:rgba(255,122,26,0.12); color:var(--ion-color-primary); border:1px solid rgba(255,122,26,0.2); font-size:0.86rem; }
.auth-card { padding:0.35rem; border-radius:28px; }
ion-list { margin-bottom:0.5rem; padding:0.25rem; }
ion-item { --padding-start:0.9rem; --inner-padding-end:0.9rem; margin-bottom:0.7rem; }
.login-button { margin-top:1rem; height:46px; }
.auth-links { display:flex; justify-content:flex-end; margin-top:1rem; font-size:0.95rem; }
.auth-links a { color:var(--ion-color-primary); text-decoration:none; font-weight:600; }
@media (max-width:900px){ .auth-page{padding:1rem;} .auth-shell{grid-template-columns:1fr; gap:1.25rem;} .auth-hero{padding:1.25rem;} }
</style>
