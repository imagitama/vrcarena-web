export function storeInLocalStorage(key: string, value: any): void {
  return localStorage.setItem(key, JSON.stringify(value))
}

export function retrieveFromLocalStorage<T>(key: string): T | null {
  const val = localStorage.getItem(key)
  if (val !== null) {
    return JSON.parse(val)
  } else {
    return null
  }
}
