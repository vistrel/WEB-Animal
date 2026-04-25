function normalizeUkrainianPhone(value) {
  if (!value) {
    return null;
  }

  const digits = String(value).replace(/[^\d]/g, "");

  if (/^380\d{9}$/.test(digits)) {
    return `+${digits}`;
  }

  if (/^0\d{9}$/.test(digits)) {
    return `+38${digits}`;
  }

  return null;
}

function isValidUkrainianPhone(value) {
  return Boolean(normalizeUkrainianPhone(value));
}

module.exports = {
  normalizeUkrainianPhone,
  isValidUkrainianPhone,
};
