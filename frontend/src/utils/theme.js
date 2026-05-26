const STORAGE_KEY = 'startuphub-theme'

export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY) || 'dark'
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(STORAGE_KEY, theme)
}

// export function toggleTheme(currentTheme) {
//   const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'
//   applyTheme(nextTheme)
//   return nextTheme
// }
