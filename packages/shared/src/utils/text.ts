/** Lowercase, strip Vietnamese diacritics and collapse whitespace — used for accent-insensitive search. */
export function normalizeSearch(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // bỏ dấu thanh, dấu mũ
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/** "Hà Nội" → "ha-noi". */
export function slugify(input: string): string {
  return normalizeSearch(input)
    .replace(/[^a-z0-9\s-]/g, '') // drop punctuation
    .replace(/[\s-]+/g, '-') // spaces -> dash
    .replace(/^-|-$/g, ''); // trim dashes
}
