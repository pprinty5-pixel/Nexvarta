const fs = require('fs');
const path = require('path');

const repoStorePath = path.join(process.cwd(), 'data', 'cmsStore.json');
const runtimeBackupPath = '/tmp/cmsStore_runtime.json';
const localBackupPath = path.join(process.cwd(), 'data', 'backups', 'cmsStore_latest.json');

try {
  if (!fs.existsSync(repoStorePath)) {
    console.log('No repo cmsStore.json found.');
    process.exit(0);
  }

  const repoData = JSON.parse(fs.readFileSync(repoStorePath, 'utf8'));

  let runtimeData = null;
  if (fs.existsSync(runtimeBackupPath)) {
    try {
      runtimeData = JSON.parse(fs.readFileSync(runtimeBackupPath, 'utf8'));
    } catch (e) {}
  } else if (fs.existsSync(localBackupPath)) {
    try {
      runtimeData = JSON.parse(fs.readFileSync(localBackupPath, 'utf8'));
    } catch (e) {}
  }

  if (!runtimeData) {
    console.log('No runtime cmsStore backup to merge. Using repository cmsStore.json.');
    process.exit(0);
  }

  // Merge runtime articles with repo articles
  const merged = { ...repoData };

  // 1. Preserve siteConfig customizations if present in runtime
  if (runtimeData.siteConfig) {
    merged.siteConfig = {
      ...merged.siteConfig,
      ...runtimeData.siteConfig,
    };
  }

  // 2. Preserve tickerSpeed & trendingArticleId
  if (runtimeData.tickerSpeed) {
    merged.tickerSpeed = runtimeData.tickerSpeed;
  }
  if (runtimeData.trendingArticleId) {
    merged.trendingArticleId = runtimeData.trendingArticleId;
  }

  // 3. Preserve breakingTickers from runtime (honoring deletions)
  if (Array.isArray(runtimeData.breakingTickers)) {
    merged.breakingTickers = runtimeData.breakingTickers;
  }

  // 4. Preserve newsSections and articles from runtime (honoring deletions, edits, and additions)
  if (Array.isArray(runtimeData.newsSections) && runtimeData.newsSections.length > 0) {
    merged.newsSections = runtimeData.newsSections;
  }

  // 5. Preserve creatorVideos from runtime (honoring deletions)
  if (Array.isArray(runtimeData.creatorVideos)) {
    merged.creatorVideos = runtimeData.creatorVideos;
  }

  // 6. Preserve subscriptionPlan, liveTv, nexvartaShorts from runtime if present
  if (runtimeData.subscriptionPlan) {
    merged.subscriptionPlan = runtimeData.subscriptionPlan;
  }
  if (runtimeData.liveTv) {
    merged.liveTv = runtimeData.liveTv;
  }
  if (Array.isArray(runtimeData.nexvartaShorts)) {
    merged.nexvartaShorts = runtimeData.nexvartaShorts;
  }

  // Write back to data/cmsStore.json
  fs.writeFileSync(repoStorePath, JSON.stringify(merged, null, 2), 'utf8');

  // Also ensure data/backups exists
  const backupDir = path.join(process.cwd(), 'data', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  fs.writeFileSync(localBackupPath, JSON.stringify(merged, null, 2), 'utf8');

  console.log('✅ Successfully merged runtime CMS data with new code changes!');
} catch (err) {
  console.error('Error during CMS store merge:', err);
}
