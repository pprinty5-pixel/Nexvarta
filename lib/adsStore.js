import fs from 'fs';
import path from 'path';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
const directory = path.join(process.cwd(), 'data', 'backups');
const storePath = path.join(directory, 'advertisements.json');
export function readAds() {
  if (!fs.existsSync(storePath)) return { ads: [], contactPhone: '' };
  return JSON.parse(fs.readFileSync(storePath, 'utf8'));
}
export function writeAds(data) {
  fs.mkdirSync(directory, { recursive: true });
  const temporary = `${storePath}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(data, null, 2));
  fs.renameSync(temporary, storePath);
}
function secret() {
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, 'ads-session.key');
  if (!fs.existsSync(file)) fs.writeFileSync(file, randomBytes(32).toString('hex'), { mode: 0o600 });
  return fs.readFileSync(file, 'utf8');
}
export function createAdSession() {
  const expiry = String(Date.now() + 86400000);
  return `${expiry}.${createHmac('sha256', secret()).update(expiry).digest('hex')}`;
}
export function isAdAdmin(request) {
  const value = request.cookies.get('nv_ads_admin')?.value || '';
  const [expiry, signature] = value.split('.');
  if (!signature || !/^\d+$/.test(expiry) || Number(expiry) <= Date.now()) return false;
  const expected = createHmac('sha256', secret()).update(expiry).digest('hex');
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
