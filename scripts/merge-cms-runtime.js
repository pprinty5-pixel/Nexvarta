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

  // 3. Preserve breakingTickers if runtime has custom tickers
  if (Array.isArray(runtimeData.breakingTickers) && runtimeData.breakingTickers.length > 0) {
    const set = new Set(repoData.breakingTickers || []);
    runtimeData.breakingTickers.forEach(t => set.add(t));
    merged.breakingTickers = Array.from(set);
  }

  // 4. Merge articles in each section
  if (Array.isArray(runtimeData.newsSections)) {
    merged.newsSections = (merged.newsSections || []).map(repoSec => {
      const runSec = runtimeData.newsSections.find(s => s.id === repoSec.id || s.slug === repoSec.slug);
      if (!runSec || !Array.isArray(runSec.articles)) return repoSec;

      const existingIds = new Set(repoSec.articles.map(a => a.id));
      const userArticles = runSec.articles.filter(a => !existingIds.has(a.id) || a.id.startsWith('art-'));
      
      return {
        ...repoSec,
        articles: [...userArticles, ...repoSec.articles.filter(a => !userArticles.some(u => u.id === a.id))]
      };
    });

    runtimeData.newsSections.forEach(runSec => {
      if (!merged.newsSections.some(s => s.id === runSec.id)) {
        merged.newsSections.push(runSec);
      }
    });
  }

  // 5. Merge creatorVideos if any added
  if (Array.isArray(runtimeData.creatorVideos)) {
    const existingVidIds = new Set((merged.creatorVideos || []).map(v => v.id));
    const newVids = runtimeData.creatorVideos.filter(v => !existingVidIds.has(v.id));
    merged.creatorVideos = [...newVids, ...(merged.creatorVideos || [])];
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
