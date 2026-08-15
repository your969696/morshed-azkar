const api = typeof window !== 'undefined' ? window.electronAPI : null;

export async function pGet(key) {
  if (api?.settingsGet) {
    const v = await api.settingsGet(key);
    if (v !== null) return v;
  }
  return localStorage.getItem(key);
}

export async function pSet(key, value) {
  localStorage.setItem(key, value);
  if (api?.settingsSet) {
    await api.settingsSet(key, value);
  }
}

export function pGetSync(key) {
  return localStorage.getItem(key);
}

export function pSetSync(key, value) {
  localStorage.setItem(key, value);
  if (api?.settingsSet) {
    api.settingsSet(key, value);
  }
}
