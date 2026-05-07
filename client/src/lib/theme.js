const KEY = 'mmm-theme';

export function getTheme() {
  return localStorage.getItem(KEY) || 'light';
}

export function setTheme(theme) {
  localStorage.setItem(KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export function initTheme() {
  const saved = getTheme();
  document.documentElement.setAttribute('data-theme', saved);
  return saved;
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
