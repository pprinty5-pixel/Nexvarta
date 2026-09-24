/**
 * Watermark Utility for Nexvarta News Images
 * Draws broadcast-grade watermark ribbons, badges, and branding onto images using HTML5 Canvas.
 */

export async function applyWatermarkToImage(fileOrUrl, options = {}) {
  const {
    watermarkText = '🔴 NEXVARTA EXCLUSIVE',
    locationText = 'PUNE • MAHARASHTRA',
    position = 'bottom-banner', // 'bottom-banner' | 'corner-badge' | 'none'
    quality = 0.92
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set dimensions (preserve aspect ratio, standard width 1200 if larger)
        const maxWidth = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // 1. Draw base image
        ctx.drawImage(img, 0, 0, width, height);

        if (position === 'none') {
          resolve(canvas.toDataURL('image/jpeg', quality));
          return;
        }

        // 2. Draw broadcast styling
        if (position === 'bottom-banner') {
          const bannerHeight = Math.max(54, Math.round(height * 0.12));
          const y = height - bannerHeight;

          // Gradient backdrop
          const grad = ctx.createLinearGradient(0, y - 20, 0, height);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          grad.addColorStop(0.35, 'rgba(15, 23, 42, 0.85)');
          grad.addColorStop(1, 'rgba(2, 6, 23, 0.96)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, y - 20, width, bannerHeight + 20);

          // Top thin accent line
          let accentColor = '#ea580c';
          let badgeColor = '#dc2626';
          if (watermarkText.includes('SPECIAL')) {
            accentColor = '#f59e0b';
            badgeColor = '#ea580c';
          } else if (watermarkText.includes('PUNE')) {
            accentColor = '#3b82f6';
            badgeColor = '#003884';
          }

          ctx.fillStyle = accentColor;
          ctx.fillRect(0, y, width, 3);

          // Clean Badge Text (strip leading emojis)
          const cleanBadgeText = watermarkText.replace(/^[🔴⚡📍❌]\s*/, '● ');

          // Left Brand Pill Badge
          const pillHeight = Math.round(bannerHeight * 0.52);
          const fontSize = Math.round(pillHeight * 0.48);
          ctx.font = `bold ${fontSize}px 'Segoe UI', system-ui, -apple-system, sans-serif`;
          const textMetrics = ctx.measureText(cleanBadgeText);
          const pillPadding = 24;
          const pillWidth = Math.max(160, Math.min(Math.round(width * 0.45), Math.round(textMetrics.width + pillPadding)));
          const pillX = 20;
          const pillY = y + (bannerHeight - pillHeight) / 2;

          ctx.fillStyle = badgeColor;
          roundRect(ctx, pillX, pillY, pillWidth, pillHeight, 6);
          ctx.fill();

          // Brand pill text
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${fontSize}px 'Segoe UI', system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cleanBadgeText, pillX + pillWidth / 2, pillY + pillHeight / 2);

          // Location and Date Subtitle
          ctx.fillStyle = '#f8fafc';
          ctx.font = `600 ${Math.round(bannerHeight * 0.28)}px 'Segoe UI', system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(locationText, pillX + pillWidth + 14, pillY + pillHeight / 2);

          // Right Nexvarta Digital Seal
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = `800 ${Math.round(bannerHeight * 0.32)}px 'Segoe UI', system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'right';
          ctx.fillText('NEXVARTA.COM', width - 24, pillY + pillHeight / 2);

        } else if (position === 'corner-badge') {
          // Modern Floating Glass Badge (Top-Right or Bottom-Right)
          const badgeW = 200;
          const badgeH = 46;
          const bX = width - badgeW - 20;
          const bY = height - badgeH - 20;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          roundRect(ctx, bX, bY, badgeW, badgeH, 10);
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ea580c';
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold 14px 'Segoe UI', system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(watermarkText, bX + badgeW / 2, bY + badgeH / 2);
        }

        const watermarkedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(watermarkedDataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => reject(new Error('Failed to load image for watermarking'));

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(fileOrUrl);
    } else {
      reject(new Error('Invalid image source'));
    }
  });
}

function roundRect(ctx, x, y, width, height, radius) {
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
