<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleDismiss">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEditing ? 'Editar produto' : 'Novo produto' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" :disabled="saving" @click="close">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form class="product-form" @submit.prevent="submit">
        <ion-list class="form-list">
          <ion-item>
            <ion-label position="stacked">Nome *</ion-label>
            <ion-input v-model="form.nome" autocomplete="off" />
          </ion-item>
          <div v-if="fieldErrors.nome" class="field-error">{{ fieldErrors.nome }}</div>

          <ion-item>
            <ion-label position="stacked">Codigo/SKU</ion-label>
            <ion-input v-model="form.codigo" autocomplete="off" />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Descricao</ion-label>
            <ion-textarea v-model="form.descricao" :auto-grow="true" />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Categoria</ion-label>
            <ion-select
              v-model="form.categoria_id"
              interface="popover"
              placeholder="Selecione"
              @ionChange="handleCategoriaChange"
            >
              <ion-select-option :value="null">Sem categoria</ion-select-option>
              <ion-select-option
                v-for="categoria in categorias"
                :key="categoria.id"
                :value="categoria.id"
              >
                {{ categoria.nome }}
              </ion-select-option>
              <ion-select-option value="__nova__">+ Nova categoria</ion-select-option>
            </ion-select>
          </ion-item>

          <div class="form-grid">
            <div>
              <ion-item>
                <ion-label position="stacked">Preco de venda *</ion-label>
                <ion-input v-model="form.preco" type="number" min="0" inputmode="decimal" />
              </ion-item>
              <div v-if="fieldErrors.preco" class="field-error">{{ fieldErrors.preco }}</div>
            </div>

            <ion-item>
              <ion-label position="stacked">Custo</ion-label>
              <ion-input v-model="form.custo" type="number" min="0" inputmode="decimal" />
            </ion-item>
          </div>

          <div class="form-grid">
            <div>
              <ion-item>
                <ion-label position="stacked">Estoque atual *</ion-label>
                <ion-input v-model="form.estoque" type="number" min="0" inputmode="numeric" />
              </ion-item>
              <div v-if="fieldErrors.estoque" class="field-error">{{ fieldErrors.estoque }}</div>
            </div>

            <div>
              <ion-item>
                <ion-label position="stacked">Estoque minimo *</ion-label>
                <ion-input v-model="form.estoque_minimo" type="number" min="0" inputmode="numeric" />
              </ion-item>
              <div v-if="fieldErrors.estoque_minimo" class="field-error">
                {{ fieldErrors.estoque_minimo }}
              </div>
            </div>
          </div>

          <ion-item>
            <ion-label position="stacked">Unidade</ion-label>
            <ion-select v-model="form.unidade" interface="popover">
              <ion-select-option value="un">un</ion-select-option>
              <ion-select-option value="kg">kg</ion-select-option>
              <ion-select-option value="g">g</ion-select-option>
              <ion-select-option value="l">l</ion-select-option>
              <ion-select-option value="ml">ml</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">URL da imagem</ion-label>
            <ion-input v-model="form.imagem" type="url" autocomplete="off" />
          </ion-item>
        </ion-list>

        <div class="modal-actions">
          <ion-button
            v-if="isEditing"
            fill="clear"
            color="danger"
            type="button"
            :disabled="saving"
            @click="confirmDeactivateOpen = true"
          >
            Desativar produto
          </ion-button>

          <div class="action-spacer" />

          <ion-button fill="outline" type="button" :disabled="saving" @click="close">
            Cancelar
          </ion-button>
          <ion-button type="submit" :disabled="saving">
            <ion-spinner v-if="saving" name="crescent" />
            <span v-else>Salvar</span>
          </ion-button>
        </div>
      </form>

      <ion-alert
        :is-open="categoryAlertOpen"
        header="Nova categoria"
        :inputs="categoryAlertInputs"
        :buttons="categoryAlertButtons"
        @didDismiss="categoryAlertOpen = false"
      />

      <ion-alert
        :is-open="confirmDeactivateOpen"
        header="Desativar produto"
        :message="`Tem certeza que deseja desativar ${form.nome || 'este produto'}? Ele deixara de aparecer nas listagens.`"
        :buttons="deactivateAlertButtons"
        @didDismiss="confirmDeactivateOpen = false"
      />

    </ion-content>
  </ion-modal>

  <ion-toast
    :is-open="toastOpen"
    :message="toastMessage"
    :color="toastColor"
    :duration="2400"
    @didDismiss="toastOpen = false"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/vue'
import { useEstoqueStore } from '@/stores/estoque.store'
import type {
  Categoria,
  CreateProduto,
  ProdutoComCategoria,
  UpdateProduto,
} from '@/types/database.types'

const NEW_CATEGORY_VALUE = '__nova__'

const props = defineProps<{
  isOpen: boolean
  produto: ProdutoComCategoria | null
  categorias: Categoria[]
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const estoqueStore = useEstoqueStore()

const saving = ref(false)
const categoryAlertOpen = ref(false)
const confirmDeactivateOpen = ref(false)
const toastOpen = ref(false)
const toastMessage = ref('')
const toastColor = ref<'success' | 'danger' | 'warning'>('success')

const form = reactive({
  nome: '',
  codigo: '',
  descricao: '',
  categoria_id: null as string | null,
  preco: '0',
  custo: '',
  estoque: '0',
  estoque_minimo: '0',
  unidade: 'un',
  imagem: '',
})

const fieldErrors = reactive({
  nome: '',
  preco: '',
  estoque: '',
  estoque_minimo: '',
})

const isEditing = computed(() => Boolean(props.produto?.id))

const categoryAlertInputs = [
  {
    name: 'nome',
    type: 'text' as const,
    placeholder: 'Nome da categoria',
  },
]

const categoryAlertButtons = computed(() => [
  {
    text: 'Cancelar',
    role: 'cancel',
  },
  {
    text: 'Criar',
    handler: async (data: { nome?: string }) => {
      const nome = data.nome?.trim()
      if (!nome) {
        showToast('Informe o nome da categoria', 'warning')
        return false
      }

      try {
        const categoria = await estoqueStore.criarCategoria(nome)
        form.categoria_id = categoria.id
        showToast('Categoria criada com sucesso', 'success')
        return true
      } catch (err: any) {
        showToast(err.message || 'Erro ao criar categoria', 'danger')
        return false
      }
    },
  },
])

const deactivateAlertButtons = computed(() => [
  {
    text: 'Cancelar',
    role: 'cancel',
  },
  {
    text: 'Desativar',
    role: 'destructive',
    handler: deactivate,
  },
])

watch(
  () => [props.isOpen, props.produto] as const,
  ([isOpen]) => {
    if (isOpen) {
      resetForm(props.produto)
    }
  },
  { immediate: true },
)

function resetForm(produto: ProdutoComCategoria | null) {
  fieldErrors.nome = ''
  fieldErrors.preco = ''
  fieldErrors.estoque = ''
  fieldErrors.estoque_minimo = ''

  form.nome = produto?.nome ?? ''
  form.codigo = produto?.codigo ?? ''
  form.descricao = produto?.descricao ?? ''
  form.categoria_id = produto?.categoria_id ?? null
  form.preco = String(produto?.preco ?? 0)
  form.custo = produto?.custo === null || produto?.custo === undefined ? '' : String(produto.custo)
  form.estoque = String(produto?.estoque ?? 0)
  form.estoque_minimo = String(produto?.estoque_minimo ?? 0)
  form.unidade = produto?.unidade ?? 'un'
  form.imagem = produto?.imagem ?? ''
}

function handleCategoriaChange(event: CustomEvent) {
  if (event.detail.value === NEW_CATEGORY_VALUE) {
    form.categoria_id = props.produto?.categoria_id ?? null
    categoryAlertOpen.value = true
  }
}

function validate() {
  fieldErrors.nome = ''
  fieldErrors.preco = ''
  fieldErrors.estoque = ''
  fieldErrors.estoque_minimo = ''

  const preco = Number(form.preco)
  const estoque = Number(form.estoque)
  const estoqueMinimo = Number(form.estoque_minimo)

  if (!form.nome.trim()) {
    fieldErrors.nome = 'Nome e obrigatorio'
  }

  if (Number.isNaN(preco) || preco < 0) {
    fieldErrors.preco = 'Preco nao pode ser negativo'
  }

  if (Number.isNaN(estoque) || estoque < 0) {
    fieldErrors.estoque = 'Estoque nao pode ser negativo'
  }

  if (Number.isNaN(estoqueMinimo) || estoqueMinimo < 0) {
    fieldErrors.estoque_minimo = 'Estoque minimo nao pode ser negativo'
  }

  return !fieldErrors.nome && !fieldErrors.preco && !fieldErrors.estoque && !fieldErrors.estoque_minimo
}

async function submit() {
  if (!validate()) {
    showToast('Revise os campos destacados', 'warning')
    return
  }

  saving.value = true
  try {
    const payload = buildPayload()

    if (props.produto) {
      await estoqueStore.editarProduto(props.produto.id, payload)
      showToast('Produto atualizado com sucesso', 'success')
    } else {
      await estoqueStore.criarProduto(payload as Omit<CreateProduto, 'empresa_id'>)
      showToast('Produto salvo com sucesso', 'success')
    }

    emit('saved')
    close()
  } catch (err: any) {
    showToast(err.message || 'Erro ao salvar produto', 'danger')
  } finally {
    saving.value = false
  }
}

function buildPayload(): Omit<CreateProduto, 'empresa_id'> | UpdateProduto {
  return {
    categoria_id: form.categoria_id,
    codigo: emptyToNull(form.codigo),
    nome: form.nome.trim(),
    descricao: emptyToNull(form.descricao),
    preco: Number(form.preco),
    custo: form.custo === '' ? 0 : Number(form.custo),
    estoque: Number(form.estoque),
    estoque_minimo: Number(form.estoque_minimo),
    unidade: form.unidade || 'un',
    imagem: emptyToNull(form.imagem),
    ativo: true,
  }
}

async function deactivate() {
  if (!props.produto) return true

  saving.value = true
  try {
    await estoqueStore.desativarProduto(props.produto.id)
    showToast('Produto desativado com sucesso', 'success')
    emit('saved')
    close()
    return true
  } catch (err: any) {
    showToast(err.message || 'Erro ao desativar produto', 'danger')
    return false
  } finally {
    saving.value = false
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function showToast(message: string, color: 'success' | 'danger' | 'warning') {
  toastMessage.value = message
  toastColor.value = color
  toastOpen.value = true
}

function close() {
  emit('close')
}

function handleDismiss() {
  emit('close')
}
</script>

<style scoped>
.product-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-list {
  padding: 0;
  background: transparent;
}

ion-item {
  --background: rgba(255, 255, 255, 0.03);
  --border-color: rgba(255, 122, 26, 0.16);
  --border-radius: 14px;
  --padding-start: 0.85rem;
  --inner-padding-end: 0.85rem;
  margin-bottom: 0.7rem;
  border: 1px solid rgba(255, 122, 26, 0.16);
  border-radius: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.field-error {
  margin: -0.45rem 0 0.7rem 0.85rem;
  color: var(--ion-color-danger);
  font-size: 0.82rem;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.5rem;
}

.action-spacer {
  flex: 1 1 auto;
}

ion-spinner {
  width: 18px;
  height: 18px;
}

@media (min-width: 720px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
