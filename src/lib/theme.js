const STORAGE_KEY = 'portfolio-theme';

export function getTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'light';
  } catch {
    return 'light';
  }
}

export function setTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch { /* noop */ }
  document.documentElement.setAttribute('data-theme', theme);
}

export function initTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
