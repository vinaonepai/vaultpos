import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('cria conta e faz login localmente', async () => {
    const store = useAuthStore()

    await store.register('demo@example.com', '123456', { full_name: 'Demo User' })

    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.getItem('vaultpos-users')).toContain('demo@example.com')

    await store.logout()

    const secondStore = useAuthStore()
    await secondStore.login('demo@example.com', '123456')

    expect(secondStore.isAuthenticated).toBe(true)
  })
})
