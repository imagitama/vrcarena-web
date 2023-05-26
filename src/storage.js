export function storeInLocalStorage(key, value) {
  return localStorage.setItem(key, JSON.stringify(value))
}

export function retrieveFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key))
}
