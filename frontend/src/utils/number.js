// Shared numeric helpers for FE

export const toFloat = (val, fallback = 0) => {
  if (val === null || val === undefined || val === '') return fallback;
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  return Number.isFinite(n) ? n : fallback;
};

export const toInt = (val, fallback = 0) => {
  if (val === null || val === undefined || val === '') return fallback;
  const n = typeof val === 'string' ? parseInt(val, 10) : Number(val);
  return Number.isFinite(n) ? n : fallback;
};

export const toFixedString = (val, digits = 2) => {
  const n = toFloat(val, 0);
  return n.toFixed(digits);
};


