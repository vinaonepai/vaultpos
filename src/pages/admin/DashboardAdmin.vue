<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="header-greeting">
        Olá, {{ userStore.nomeUsuario || 'usuário' }}
      </div>

      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent" class="loading-spinner" />
        <div class="loading-text">Carregando dados...</div>
      </div>

      <ion-alert
        v-else-if="!userStore.empresaId"
        color="warning"
        :is-open="true"
        header="Atenção"
        sub-header="Não foi possível carregar os dados da empresa"
        message="Verifique se o e-mail está cadastrado na tabela 'usuarios' do Supabase."
      />

      <template v-else>
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-md="6">
              <ion-card class="metric-card">
                <ion-card-header>
                  <div class="metric-title">
                    <ion-icon :icon="receiptOutline" />
                    <span>Comandas Abertas</span>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <div class="metric-value">{{ comandasStore.totalComandasAbertas }}</div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <ion-col size="12" size-md="6">
              <ion-card class="metric-card">
                <ion-card-header>
                  <div class="metric-title">
                    <ion-icon :icon="cubeOutline" />
                    <span>Produtos Ativos</span>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <div class="metric-value">{{ estoqueStore.totalProdutos }}</div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <ion-col size="12" size-md="6">
              <ion-card
                class="metric-card"
                :class="estoqueStore.totalEstoqueBaixo > 0 ? 'metric-card-warning' : ''"
              >
                <ion-card-header>
                  <div class="metric-title">
                    <ion-icon :icon="personCircleOutline" />

                    <span>Estoque Baixo</span>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <div class="metric-value">{{ estoqueStore.totalEstoqueBaixo }}</div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <ion-col size="12" size-md="6">
              <ion-card class="metric-card">
                <ion-card-header>
                  <div class="metric-title">
                    <ion-icon :icon="cashOutline" />
                    <span>Total Recebido</span>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <div class="metric-value">{{ formatBRL(financeiroStore.totalRecebido) }}</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-card class="section-card">
          <ion-card-header>
            <ion-card-title>Recebimentos por método</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="method-list">
              <div class="method-row">
                <div class="method-left">
                  <ion-icon :icon="buildOutline" class="method-icon" />

                  <div>
                    <div class="method-name">Pix</div>
                    <div class="method-value">{{ formatBRL(financeiroStore.totalPix) }}</div>
                  </div>
                </div>
                <div class="method-bar" :style="{ width: methodWidth(financeiroStore.totalPix) }" />
              </div>

              <div class="method-row">
                <div class="method-left">
                  <ion-icon :icon="cardOutline" class="method-icon" />
                  <div>
                    <div class="method-name">Cartão</div>
                    <div class="method-value">{{ formatBRL(financeiroStore.totalCartao) }}</div>
                  </div>
                </div>
                <div class="method-bar" :style="{ width: methodWidth(financeiroStore.totalCartao) }" />
              </div>

              <div class="method-row">
                <div class="method-left">
                  <ion-icon :icon="cashOutline" class="method-icon" />
                  <div>
                    <div class="method-name">Dinheiro</div>
                    <div class="method-value">{{ formatBRL(financeiroStore.totalDinheiro) }}</div>
                  </div>
                </div>
                <div class="method-bar" :style="{ width: methodWidth(financeiroStore.totalDinheiro) }" />
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card
          v-if="estoqueStore.produtosEstoqueBaixo.length > 0"
          class="section-card attention-card"
        >
          <ion-card-header>
            <ion-card-title>Atenção: Estoque Baixo</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item
                v-for="produto in estoqueStore.produtosEstoqueBaixo.slice(0, 5)"
                :key="produto.id"
                button
                router-link="/admin/estoque"
              >
                <ion-label>
                  <div class="list-title">{{ produto.nome }}</div>
                  <div class="list-subtitle">
                    {{ produto.estoque }} / {{ produto.estoque_minimo }} unidades
                  </div>
                </ion-label>
              </ion-item>
            </ion-list>

            <div v-if="estoqueStore.produtosEstoqueBaixo.length > 5" class="see-all">
              <ion-item router-link="/admin/estoque" lines="none">
                <ion-label>
                  Ver todos ({{ estoqueStore.produtosEstoqueBaixo.length }})
                </ion-label>
              </ion-item>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="section-card">
          <ion-card-header>
            <ion-card-title>Comandas Abertas</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-if="comandasStore.comandasAbertas.length === 0" class="empty-state">
              Nenhuma comanda aberta no momento.
            </div>

            <ion-list v-else>
              <ion-item v-for="item in comandasStore.comandasAbertas.slice(0, 5)" :key="item.id">
                <ion-label>
                  <div class="list-title">
                    {{ item.mesa ?? 'Sem mesa' }}
                  </div>
                  <div v-if="item.clientes?.nome" class="list-subtitle">{{ item.clientes.nome }}</div>
                  <div class="list-subtitle">
                    Total: {{ formatBRL(item.total ?? 0) }}
                  </div>
                  <div class="list-subtitle">
                    há {{ minutosDesde(item.criada_em) }} min
                  </div>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

import {
  IonAlert,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  IonSpinner,
} from '@ionic/vue'
import {
  receiptOutline,
  cubeOutline,
  personCircleOutline,
  cashOutline,
  buildOutline,

  cardOutline,

} from 'ionicons/icons'

import { useUserStore } from '@/stores/user.store'
import { useComandasStore } from '@/stores/comandas.store'
import { useEstoqueStore } from '@/stores/estoque.store'
import { useFinanceiroStore } from '@/stores/financeiro.store'

const userStore = useUserStore()
const comandasStore = useComandasStore()
const estoqueStore = useEstoqueStore()
const financeiroStore = useFinanceiroStore()

const loading = ref(true)

const totalRecebido = computed(() => financeiroStore.totalRecebido)

const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value ?? 0)
}

const methodWidth = (value: number) => {
  const total = totalRecebido.value || 0
  if (!total) return '0%'
  const percent = Math.max(0, Math.min(100, (value / total) * 100))
  return `${percent}%`
}

const minutosDesde = (iso: string | Date | null | undefined) => {
  if (!iso) return '0'
  const d = typeof iso === 'string' ? new Date(iso) : iso
  const diffMs = Date.now() - d.getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  return minutes
}

onMounted(async () => {
  try {
    if (userStore.empresaId) {
      await Promise.all([
        comandasStore.fetchComandas('aberta'),
        estoqueStore.fetchProdutos(),
        financeiroStore.fetchPagamentos(),
      ])
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.header-greeting {
  font-size: 1.05rem;
  margin: 0.75rem 0 1.25rem;
  color: var(--ion-text-color);
  opacity: 0.92;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.loading-spinner {
  font-size: 2.5rem;
  color: var(--ion-color-primary);
}

.loading-text {
  margin-top: 0.75rem;
  opacity: 0.85;
}

.metric-card {
  height: 100%;
}

.metric-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
}

.metric-title ion-icon {
  color: var(--ion-color-primary);
}

.metric-value {
  font-size: 2rem;
  font-weight: 800;
}

.metric-card-warning {
  border-color: rgba(245, 158, 11, 0.45);
  box-shadow: 0 24px 60px rgba(245, 158, 11, 0.12);
}

.section-card {
  margin-top: 1rem;
}

.attention-card {
  border-color: rgba(245, 158, 11, 0.35);
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.method-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.method-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.method-icon {
  color: var(--ion-color-primary);
}

.method-name {
  font-weight: 700;
  opacity: 0.95;
}

.method-value {
  opacity: 0.85;
}

.method-bar {
  height: 8px;
  background: rgba(255, 122, 26, 0.18);
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(255, 122, 26, 0.12) inset;
}

.method-bar[style] {
  background: linear-gradient(90deg, var(--ion-color-primary), rgba(255, 122, 26, 0.25));
}

.list-title {
  font-weight: 800;
  margin-bottom: 0.15rem;
}

.list-subtitle {
  font-size: 0.92rem;
  opacity: 0.85;
}

.empty-state {
  opacity: 0.85;
  padding: 0.25rem 0.1rem;
}

.see-all {
  margin-top: 0.5rem;
}
</style>

