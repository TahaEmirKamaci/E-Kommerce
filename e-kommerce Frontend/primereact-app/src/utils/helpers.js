export function safeJSONParse(str, fallback = null) {
  try {
    if (typeof str !== 'string') return fallback;
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export function readJSON(key, fallback = null) {
  const raw = localStorage.getItem(key);
  return safeJSONParse(raw, fallback);
}

export function writeJSON(key, value) {
  if (value === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export const toArray = (v) =>
  Array.isArray(v) ? v
  : (v && Array.isArray(v.content)) ? v.content   // Spring pageable
  : (v && Array.isArray(v.items)) ? v.items
  : [];

// Kullanıcı rolünü tek tipe çevirir: 'ADMIN' | 'SELLER' | 'CUSTOMER' ...
export const getRoleType = (user) => {
  const r = user?.role ?? user?.roles ?? user?.authorities ?? user?.authority;
  const raw =
    typeof r === 'string' ? r :
    Array.isArray(r) ? (r[0]?.authority || r[0]?.role || r[0]?.name || r[0]) :
    typeof r === 'object' ? (r.roleType || r.name || r.authority || r.code) : '';
  return String(raw || '').replace(/^ROLE_/, '').toUpperCase() || undefined;
};