// Storage utility with encryption support

interface StorageData<T> {
  value: T
  expire?: number
}

class Storage {
  private storage: globalThis.Storage

  constructor(storage: globalThis.Storage) {
    this.storage = storage
  }

  /**
   * Set storage item
   * @param key Storage key
   * @param value Storage value
   * @param expire Expiration time in seconds
   */
  set<T>(key: string, value: T, expire?: number): void {
    const data: StorageData<T> = {
      value
    }

    if (expire) {
      data.expire = Date.now() + expire * 1000
    }

    this.storage.setItem(key, JSON.stringify(data))
  }

  /**
   * Get storage item
   * @param key Storage key
   * @param defaultValue Default value if not found or expired
   */
  get<T>(key: string, defaultValue?: T): T | null {
    const item = this.storage.getItem(key)

    if (!item) {
      return defaultValue ?? null
    }

    try {
      const data: StorageData<T> = JSON.parse(item)

      // Check if expired
      if (data.expire && Date.now() > data.expire) {
        this.remove(key)
        return defaultValue ?? null
      }

      return data.value
    } catch (error) {
      console.error('Failed to parse storage item:', error)
      return defaultValue ?? null
    }
  }

  /**
   * Remove storage item
   * @param key Storage key
   */
  remove(key: string): void {
    this.storage.removeItem(key)
  }

  /**
   * Clear all storage items
   */
  clear(): void {
    this.storage.clear()
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Object.keys(this.storage)
  }

  /**
   * Check if key exists
   * @param key Storage key
   */
  has(key: string): boolean {
    return this.storage.getItem(key) !== null
  }
}

// Export localStorage and sessionStorage instances
export const localStorage = new Storage(window.localStorage)
export const sessionStorage = new Storage(window.sessionStorage)

// Simple encryption/decryption (for basic obfuscation)
class EncryptedStorage extends Storage {
  private encryptionKey: string

  constructor(storage: globalThis.Storage, encryptionKey: string = 'default-key') {
    super(storage)
    this.encryptionKey = encryptionKey
  }

  private encrypt(text: string): string {
    // Simple XOR encryption (not secure, just for obfuscation)
    let result = ''
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
      )
    }
    return btoa(result)
  }

  private decrypt(encrypted: string): string {
    try {
      const text = atob(encrypted)
      let result = ''
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        )
      }
      return result
    } catch (error) {
      console.error('Decryption failed:', error)
      return ''
    }
  }

  set<T>(key: string, value: T, expire?: number): void {
    const data: StorageData<T> = {
      value
    }

    if (expire) {
      data.expire = Date.now() + expire * 1000
    }

    const encrypted = this.encrypt(JSON.stringify(data))
    this.storage.setItem(key, encrypted)
  }

  get<T>(key: string, defaultValue?: T): T | null {
    const item = this.storage.getItem(key)

    if (!item) {
      return defaultValue ?? null
    }

    try {
      const decrypted = this.decrypt(item)
      const data: StorageData<T> = JSON.parse(decrypted)

      // Check if expired
      if (data.expire && Date.now() > data.expire) {
        this.remove(key)
        return defaultValue ?? null
      }

      return data.value
    } catch (error) {
      console.error('Failed to parse encrypted storage item:', error)
      return defaultValue ?? null
    }
  }
}

// Export encrypted storage
export const encryptedLocalStorage = new EncryptedStorage(window.localStorage)
export const encryptedSessionStorage = new EncryptedStorage(window.sessionStorage)
