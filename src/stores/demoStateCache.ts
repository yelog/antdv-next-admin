import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'demo-state-cache'

type PersistedState = {
  keyword: string
  counter: number
  notes: string
  updatedAt: string
}

const loadPersistedState = (): PersistedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        keyword: '',
        counter: 0,
        notes: '',
        updatedAt: '-'
      }
    }

    const parsed = JSON.parse(raw) as PersistedState
    return {
      keyword: parsed.keyword || '',
      counter: Number(parsed.counter || 0),
      notes: parsed.notes || '',
      updatedAt: parsed.updatedAt || '-'
    }
  } catch {
    return {
      keyword: '',
      counter: 0,
      notes: '',
      updatedAt: '-'
    }
  }
}

export const useDemoStateCacheStore = defineStore('demoStateCache', () => {
  const initial = loadPersistedState()

  const keyword = ref(initial.keyword)
  const counter = ref(initial.counter)
  const notes = ref(initial.notes)
  const updatedAt = ref(initial.updatedAt)

  const persist = () => {
    updatedAt.value = new Date().toLocaleString()
    const snapshot: PersistedState = {
      keyword: keyword.value,
      counter: counter.value,
      notes: notes.value,
      updatedAt: updatedAt.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  }

  watch([keyword, counter, notes], persist, { deep: true })

  const reset = () => {
    keyword.value = ''
    counter.value = 0
    notes.value = ''
    persist()
  }

  return {
    keyword,
    counter,
    notes,
    updatedAt,
    reset
  }
})
