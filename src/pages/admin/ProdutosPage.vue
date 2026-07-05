<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Produtos</ion-title>
      </ion-toolbar>
      <ion-toolbar class="search-toolbar">
        <ion-searchbar
          v-model="search"
          placeholder="Buscar por nome"
          :debounce="150"
          show-clear-button="focus"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="estoqueStore.error" class="error-banner">
        {{ estoqueStore.error }}
      </div>

      <ion-segment v-model="selectedCategory" scrollable class="category-segment">
        <ion-segment-button value="todas">
          <ion-label>Todas</ion-label>
        </ion-segment-button>
        <ion-segment-button
          v-for="categoria in estoqueStore.categorias"
          :key="categoria.id"
          :value="categoria.id"
        >
          <ion-label>{{ categoria.nome }}</ion-label>
        </ion-segment-button>
      </ion-segment>

      <div v-if="estoqueStore.loading && estoqueStore.produtos.length === 0" class="loading-state">
        <ion-spinner name="crescent" />
        <span>Carregando produtos...</span>
      </div>

      <div v-else-if="filteredProdutos.length === 0" class="empty-state">
        Nenhum produto cadastrado ainda
      </div>

      <div v-else class="products-list">
        <ion-card
          v-for="produto in filteredProdutos"
          :key="produto.id"
          class="product-card"
          :class="{ 'product-card-warning': isEstoqueBaixo(produto) }"
          button
          role="button"
          tabindex="0"
          @click="openEdit(produto)"
          @keydown.enter="openEdit(produto)"
        >
          <ion-card-content>
            <div class="product-row">
              <div class="product-main">
                <div class="product-name">{{ produto.nome }}</div>
                <div class="product-meta">
                  <span>{{ categoriaNome(produto) }}</span>
                  <span v-if="produto.codigo">SKU {{ produto.codigo }}</span>
                </div>
              </div>

              <div class="product-price">
                {{ formatBRL(produto.preco) }}
              </div>
            </div>

            <div class="stock-row">
              <div class="stock-copy">
                Estoque: <strong>{{ produto.estoque }}</strong>
                <span class="stock-min">min. {{ produto.estoque_minimo }}</span>
              </div>
              <ion-badge v-if="isEstoqueBaixo(produto)" color="warning">
                Estoque baixo
              </ion-badge>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="openCreate">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>

      <produto-form-modal
        :is-open="modalOpen"
        :produto="selectedProduto"
        :categorias="estoqueStore.categorias"
        @close="closeModal"
        @saved="handleSaved"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { addOutline } from 'ionicons/icons'
import ProdutoFormModal from '@/components/ProdutoFormModal.vue'
import { useEstoqueStore } from '@/stores/estoque.store'
import type { ProdutoComCategoria } from '@/types/database.types'

const estoqueStore = useEstoqueStore()

const search = ref('')
const selectedCategory = ref('todas')
const modalOpen = ref(false)
const selectedProduto = ref<ProdutoComCategoria | null>(null)

const filteredProdutos = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('pt-BR')

  return estoqueStore.produtosAtivos.filter((produto) => {
    const matchesSearch = !term || produto.nome.toLocaleLowerCase('pt-BR').includes(term)
    const matchesCategory =
      selectedCategory.value === 'todas' || produto.categoria_id === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

onMounted(async () => {
  const requests: Promise<void>[] = []

  if (estoqueStore.produtos.length === 0) {
    requests.push(estoqueStore.fetchProdutos())
  }

  if (estoqueStore.categorias.length === 0) {
    requests.push(estoqueStore.fetchCategorias())
  }

  if (requests.length > 0) {
    await Promise.all(requests)
  }
})

function openCreate() {
  selectedProduto.value = null
  modalOpen.value = true
}

function openEdit(produto: ProdutoComCategoria) {
  selectedProduto.value = produto
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  selectedProduto.value = null
}

function handleSaved() {
  modalOpen.value = false
  selectedProduto.value = null
}

function categoriaNome(produto: ProdutoComCategoria) {
  if (produto.categorias?.nome) return produto.categorias.nome
  const categoria = estoqueStore.categorias.find((item) => item.id === produto.categoria_id)
  return categoria?.nome ?? 'Sem categoria'
}

function isEstoqueBaixo(produto: ProdutoComCategoria) {
  return produto.estoque <= produto.estoque_minimo
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value ?? 0)
}
</script>

<style scoped>
.search-toolbar {
  --padding-start: 0.5rem;
  --padding-end: 0.5rem;
}

ion-searchbar {
  --background: rgba(255, 255, 255, 0.05);
  --border-radius: 14px;
  --color: var(--ion-text-color);
  padding-top: 0.35rem;
  padding-bottom: 0.6rem;
}

.error-banner {
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 14px;
  color: var(--ion-color-danger);
  background: rgba(239, 68, 68, 0.08);
}

.category-segment {
  margin-bottom: 1rem;
}

ion-segment {
  --background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 122, 26, 0.14);
  border-radius: 14px;
  padding: 0.25rem;
}

ion-segment-button {
  --border-radius: 10px;
  --color-checked: var(--ion-color-primary-contrast);
  --indicator-color: var(--ion-color-primary);
  min-width: max-content;
}

.loading-state,
.empty-state {
  min-height: 42vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.72);
  text-align: center;
}

.loading-state ion-spinner {
  color: var(--ion-color-primary);
}

.products-list {
  display: grid;
  gap: 0.85rem;
  padding-bottom: 5.5rem;
}

.product-card {
  margin: 0;
  border: 1px solid rgba(255, 122, 26, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
}

.product-card-warning {
  border-color: rgba(245, 158, 11, 0.38);
  box-shadow: 0 18px 44px rgba(245, 158, 11, 0.1);
}

.product-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: start;
}

.product-main {
  min-width: 0;
}

.product-name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ion-text-color);
  overflow-wrap: anywhere;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.7rem;
  margin-top: 0.25rem;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.88rem;
}

.product-price {
  color: var(--ion-color-primary);
  font-weight: 800;
  white-space: nowrap;
}

.stock-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  margin-top: 1rem;
}

.stock-copy {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.92rem;
}

.stock-min {
  margin-left: 0.45rem;
  color: rgba(255, 255, 255, 0.58);
}

ion-fab-button {
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
}

@media (min-width: 760px) {
  .products-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
