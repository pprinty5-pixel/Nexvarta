export const AD_PLACEMENTS = {
  header: { label: 'हेडरखाली', desktop: '970 × 90', mobile: '320 × 100' },
  feed: { label: 'बातम्यांच्या मध्ये / लेखाखाली', desktop: '728 × 90', mobile: '300 × 250' },
  sidebar: { label: 'साइडबार / मोबाइलवर बातम्यांनंतर', desktop: '300 × 250', mobile: '300 × 250' },
};
export function indiaToday(now = new Date()) {
  return new Date(now.getTime() + 19800000).toISOString().slice(0, 10);
}
export function adStatus(ad, today = indiaToday()) {
  if (!ad.enabled) return 'बंद';
  if (ad.startDate > today) return 'नियोजित';
  if (ad.endDate < today) return 'मुदत संपली';
  return 'सक्रिय';
}
export function safeAdLink(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function validAdImage(value) {
  return typeof value === 'string' && (/^\/uploads\/[a-zA-Z0-9_./-]+$/.test(value) || /^https:\/\//.test(value));
}
