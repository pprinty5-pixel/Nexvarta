/**
 * Watermark Utility for Nexvarta News Images
 * Draws broadcast-grade watermark ribbons, badges, and official logo branding onto images using HTML5 Canvas.
 */

const loadBaseImage = (source) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for watermarking'));

    if (typeof source === 'string') {
      img.src = source;
    } else if (source instanceof File || source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(source);
    } else {
      reject(new Error('Invalid image source'));
    }
  });
};

const loadLogoImage = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn('Watermark logo could not be loaded from:', src);
      resolve(null);
    };
    img.src = src;
  });
};

export async function applyWatermarkToImage(fileOrUrl, options = {}) {
  const {
    watermarkText = '🌟 अधिकृत लोगो',
    locationText = 'PUNE • MAHARASHTRA',
    showLocation = true,
    domainText = 'NVNEWS.IN',
    showDomain = true,
    logoUrl = '/uploads/logos/nexvarta_official_logo.png',
    showLogo = true,
    position = 'bottom-banner', // 'bottom-banner' | 'corner-badge' | 'none'
    quality = 0.92
  } = options;

  const [baseImg, logoImg] = await Promise.all([
    loadBaseImage(fileOrUrl),
    showLogo ? loadLogoImage(logoUrl) : Promise.resolve(null)
  ]);

  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set dimensions (preserve aspect ratio, standard width 1200 if larger)
      const maxWidth = 1200;
      let width = baseImg.width;
      let height = baseImg.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // 1. Draw base image
      ctx.drawImage(baseImg, 0, 0, width, height);

      if (position === 'none') {
        resolve(canvas.toDataURL('image/jpeg', quality));
        return;
      }

      // 2. Draw broadcast styling
      if (position === 'bottom-banner') {
        const bannerHeight = Math.max(56, Math.min(110, Math.round(height * 0.12)));
        const y = height - bannerHeight;

        // Gradient backdrop
        const grad = ctx.createLinearGradient(0, y - 24, 0, height);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.35, 'rgba(15, 23, 42, 0.88)');
        grad.addColorStop(1, 'rgba(2, 6, 23, 0.97)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, y - 24, width, bannerHeight + 24);

        // Top thin accent line
        let accentColor = '#ea580c';
        let badgeColor = '#dc2626';
        if (watermarkText.includes('SPECIAL') || watermarkText.includes('विशेष')) {
          accentColor = '#f59e0b';
          badgeColor = '#ea580c';
        } else if (watermarkText.includes('PUNE') || watermarkText.includes('पुणे')) {
          accentColor = '#3b82f6';
          badgeColor = '#003884';
        } else if (watermarkText.includes('BREAKING') || watermarkText.includes('ब्रेकिंग') || watermarkText.includes('अलर्ट') || watermarkText.includes('ALERT')) {
          accentColor = '#ef4444';
          badgeColor = '#b91c1c';
        } else if (watermarkText.includes('ग्राउंड') || watermarkText.includes('REPORT')) {
          accentColor = '#10b981';
          badgeColor = '#047857';
        } else if (watermarkText.includes('लोगो') || watermarkText.includes('OFFICIAL')) {
          accentColor = '#0284c7';
          badgeColor = '#003884';
        }

        ctx.fillStyle = accentColor;
        ctx.fillRect(0, y, width, 3);

        let currentLeftX = 20;

        // 2A. Draw Official Logo on Ribbon
        if (showLogo && logoImg) {
          const logoH = Math.round(bannerHeight * 0.72);
          const aspect = logoImg.width / logoImg.height;
          const logoW = Math.max(30, Math.round(logoH * aspect));
          const logoY = y + (bannerHeight - logoH) / 2;

          // White pill backing with subtle glow so official logo pops against any background
          ctx.fillStyle = '#ffffff';
          roundRect(ctx, currentLeftX, logoY - 2, logoW + 8, logoH + 4, 6);
          ctx.fill();

          ctx.drawImage(logoImg, currentLeftX + 4, logoY, logoW, logoH);
          currentLeftX += logoW + 18;
        }

        // 2B. Draw Tag Badge (if not just generic official logo or none)
        const rawTag = watermarkText.replace(/^[🔴⚡📍❌🏷️🌟✏️●◆\s]+/, '').trim();
        const isOfficialLogoTag = !rawTag || rawTag === 'अधिकृत लोगो' || rawTag === 'NEXVARTA';

        if (!isOfficialLogoTag && rawTag !== 'विना वॉटरमार्क') {
          const cleanBadgeText = `● ${rawTag}`;
          const pillHeight = Math.round(bannerHeight * 0.50);
          const fontSize = Math.round(pillHeight * 0.48);
          ctx.font = `bold ${fontSize}px 'Segoe UI', system-ui, -apple-system, sans-serif`;
          const textMetrics = ctx.measureText(cleanBadgeText);
          const pillPadding = 20;
          const pillWidth = Math.max(90, Math.round(textMetrics.width + pillPadding));
          const pillY = y + (bannerHeight - pillHeight) / 2;

          ctx.fillStyle = badgeColor;
          roundRect(ctx, currentLeftX, pillY, pillWidth, pillHeight, 6);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cleanBadgeText, currentLeftX + pillWidth / 2, pillY + pillHeight / 2);
          currentLeftX += pillWidth + 14;
        }

        // 2C. Optional Location Subtitle
        if (showLocation && locationText && locationText.trim()) {
          ctx.fillStyle = '#f8fafc';
          ctx.font = `600 ${Math.round(bannerHeight * 0.28)}px 'Segoe UI', system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(locationText.trim(), currentLeftX, y + bannerHeight / 2);
        }

        // 2D. Right Brand Digital Seal (NVNEWS.IN)
        if (showDomain && domainText && domainText.trim()) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
          ctx.font = `800 ${Math.round(bannerHeight * 0.32)}px 'Segoe UI', system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(domainText.trim().toUpperCase(), width - 24, y + bannerHeight / 2);
        }

      } else if (position === 'corner-badge') {
        const badgeW = showLogo && logoImg ? 220 : 180;
        const badgeH = 48;
        const bX = width - badgeW - 20;
        const bY = height - badgeH - 20;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        roundRect(ctx, bX, bY, badgeW, badgeH, 10);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0284c7';
        ctx.stroke();

        let bLeft = bX + 10;
        if (showLogo && logoImg) {
          const lH = 34;
          const lW = Math.round(lH * (logoImg.width / logoImg.height));
          ctx.fillStyle = '#ffffff';
          roundRect(ctx, bLeft, bY + 7, lW + 6, lH, 4);
          ctx.fill();
          ctx.drawImage(logoImg, bLeft + 3, bY + 7, lW, lH);
          bLeft += lW + 12;
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 13px 'Segoe UI', system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(domainText || 'NVNEWS.IN', bLeft, bY + badgeH / 2);
      }

      const watermarkedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(watermarkedDataUrl);
    } catch (err) {
      reject(err);
    }
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
