<template>
  <ion-tabs>
    <ion-router-outlet />

    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="admin-dashboard" href="/admin/dashboard">
        <ion-icon :icon="gridOutline" />
        <ion-label>Dashboard</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="admin-produtos" href="/admin/produtos">
        <ion-icon :icon="cubeOutline" />
        <ion-label>Produtos</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="admin-estoque" href="/admin/estoque">
        <ion-icon :icon="archiveOutline" />
        <ion-label>Estoque</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="admin-financeiro" href="/admin/financeiro">
        <ion-icon :icon="cashOutline" />
        <ion-label>Financeiro</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="admin-mais" href="/admin/mais">
        <ion-icon :icon="appsOutline" />
        <ion-label>Mais</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>
</template>

<script setup lang="ts">
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/vue';
import {
  archiveOutline,
  cashOutline,
  cubeOutline,
  gridOutline,
  appsOutline,
} from 'ionicons/icons';
</script>
