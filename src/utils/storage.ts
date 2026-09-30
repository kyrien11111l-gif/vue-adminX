export function readStorage<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback

  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeStorage(key: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(key)
}
