//server\utils\format.utils.js
export const toTitleCase = (value) => {
  if (!value) return value;

  return value
    .trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
};
