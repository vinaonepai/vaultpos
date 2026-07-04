<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mais</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item router-link="/admin/empresa">
          <ion-icon :icon="businessOutline" slot="start" />
          <ion-label>Empresa</ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end" />
        </ion-item>

        <ion-item router-link="/admin/relatorios">
          <ion-icon :icon="statsChartOutline" slot="start" />
          <ion-label>Relatórios</ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end" />
        </ion-item>

        <ion-item router-link="/admin/usuarios">
          <ion-icon :icon="peopleOutline" slot="start" />
          <ion-label>Usuários</ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end" />
        </ion-item>

        <ion-item router-link="/admin/configuracoes">
          <ion-icon :icon="settingsOutline" slot="start" />
          <ion-label>Configurações</ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end" />
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import {
  businessOutline,
  chevronForwardOutline,
  peopleOutline,
  settingsOutline,
  statsChartOutline,
} from 'ionicons/icons'
</script>

<style scoped>
ion-list {
  padding-top: 1rem;
}

ion-item {
  margin-bottom: 0.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 122, 26, 0.16);
}

ion-icon[slot="start"] {
  color: var(--ion-color-primary);
  margin-right: 0.75rem;
}

ion-icon[slot="end"] {
  color: #6b7280;
}
</style>
