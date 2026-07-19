import type { TrackedItem } from '../types'

const DATABASE_NAME = 'actbeforedue-local'
const DATABASE_VERSION = 1
const STORE_NAME = 'plans'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Local storage could not be opened.'))
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('Local storage could not be updated.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('Local storage update was cancelled.'))
  })
}

export async function loadLocalItems(): Promise<TrackedItem[]> {
  const database = await openDatabase()
  return new Promise<TrackedItem[]>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll()
    request.onsuccess = () => resolve((request.result as TrackedItem[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
    request.onerror = () => reject(request.error ?? new Error('Local plans could not be loaded.'))
  }).finally(() => database.close())
}

export async function saveLocalItem(item: TrackedItem): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, 'readwrite')
  transaction.objectStore(STORE_NAME).put(item)
  await transactionDone(transaction)
  database.close()
}

export async function deleteLocalItem(id: string): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, 'readwrite')
  transaction.objectStore(STORE_NAME).delete(id)
  await transactionDone(transaction)
  database.close()
}

export async function replaceLocalItems(items: TrackedItem[]): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)
  store.clear()
  items.forEach((item) => store.put(item))
  await transactionDone(transaction)
  database.close()
}

export async function clearLocalItems(): Promise<void> {
  return replaceLocalItems([])
}

function isTrackedItem(value: unknown): value is TrackedItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<TrackedItem>
  return typeof item.id === 'string'
    && typeof item.name === 'string'
    && typeof item.templateType === 'string'
    && typeof item.importantDate === 'string'
    && typeof item.updatedAt === 'string'
    && Array.isArray(item.milestones)
    && item.milestones.every((milestone) => Boolean(milestone)
      && typeof milestone.id === 'string'
      && typeof milestone.name === 'string'
      && typeof milestone.date === 'string'
      && typeof milestone.completed === 'boolean')
}

export async function readBackupFile(file: File): Promise<TrackedItem[]> {
  if (file.size > 5_000_000) throw new Error('That backup is too large for this app.')
  const parsed = JSON.parse(await file.text()) as { app?: unknown; version?: unknown; items?: unknown }
  if (parsed.app !== 'ActBeforeDue' || parsed.version !== 1 || !Array.isArray(parsed.items) || !parsed.items.every(isTrackedItem)) {
    throw new Error('This is not a valid ActBeforeDue backup file.')
  }
  return parsed.items
}
