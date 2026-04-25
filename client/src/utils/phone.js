export function normalizeUkrainianPhone(value) {
  if (!value) {
    return "";
  }

  const digits = String(value).replace(/[^\d]/g, "");

  if (/^380\d{9}$/.test(digits)) {
    return `+${digits}`;
  }

  if (/^0\d{9}$/.test(digits)) {
    return `+38${digits}`;
  }

  return "";
}

export function isValidUkrainianPhone(value) {
  if (!value) {
    return true;
  }

  return Boolean(normalizeUkrainianPhone(value));
}
