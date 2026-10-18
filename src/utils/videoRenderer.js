// CapCut Pro Studio Web - Multi-Track Canvas Video Rendering & Export Engine

export function renderFrame({
  ctx,
  width,
  height,
  currentTime,
  videoClips = [],
  pipClips = [],
  effectClips = [],
  textClips = [],
  trackVisibility = { video: true, pip: true, effects: true, text: true },
  showSafeZone = false,
  showGrid = false,
  aspectRatio = '9:16'
}) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Base obsidian canvas background
  ctx.fillStyle = '#090a0f';
  ctx.fillRect(0, 0, width, height);

  // Check if camera_shake effect is active
  const activeEffects = trackVisibility.effects
    ? effectClips.filter((fx) => currentTime >= fx.start && currentTime < fx.start + fx.duration)
    : [];

  const shakeFx = activeEffects.find((fx) => fx.effectType === 'camera_shake');
  if (shakeFx) {
    const intensity = ((shakeFx.intensity ?? 70) / 100) * 14;
    const dx = Math.sin(currentTime * 48) * intensity;
    const dy = Math.cos(currentTime * 37) * intensity;
    ctx.translate(dx, dy);
  }

  // 1. Render Main Video Track (with transitions)
  if (trackVisibility.video !== false) {
    const activeVideo = videoClips.find(
      (c) => currentTime >= c.start && currentTime < c.start + c.duration
    );

    if (activeVideo) {
      const timeIntoClip = currentTime - activeVideo.start;
      const timeRemaining = activeVideo.start + activeVideo.duration - currentTime;
      const transType = activeVideo.transition || 'none';
      const transDur = activeVideo.transitionDuration || 0.5;

      // Render main clip
      renderMediaClip(ctx, activeVideo, width, height, currentTime, false);

      // Render outgoing transition at the end of clip
      if (transType !== 'none' && timeRemaining <= transDur && transDur > 0) {
        const progress = 1 - timeRemaining / transDur; // 0 -> 1
        renderTransitionEffect(ctx, width, height, transType, progress, videoClips, activeVideo, currentTime);
      } else if (timeIntoClip < 0.25 && activeVideo.transition === 'flash') {
        const flashAlpha = Math.max(0, 1 - timeIntoClip / 0.25) * 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      renderEmptyCanvasGrid(ctx, width, height);
    }
  }

  // 2. Render PIP Overlay Track
  if (trackVisibility.pip !== false && pipClips.length > 0) {
    pipClips.forEach((pip) => {
      if (currentTime >= pip.start && currentTime < pip.start + pip.duration) {
        renderMediaClip(ctx, pip, width, height, currentTime, true);
      }
    });
  }

  // 3. Render Video FX Overlay Track
  if (trackVisibility.effects !== false && activeEffects.length > 0) {
    activeEffects.forEach((fx) => {
      renderVideoEffectOverlay(ctx, fx, width, height, currentTime);
    });
  }

  // 4. Render Active Text / Subtitle / Sticker Clips
  if (trackVisibility.text !== false && textClips.length > 0) {
    textClips.forEach((clip) => {
      if (currentTime >= clip.start && currentTime < clip.start + clip.duration) {
        renderTextClip(ctx, clip, width, height, currentTime);
      }
    });
  }

  // 5. Render Composition 3x3 Grid
  if (showGrid) {
    renderRuleOfThirdsGrid(ctx, width, height);
  }

  // 6. Render Safe Zone (TikTok / Reels / Shorts UI overlay guides)
  if (showSafeZone && aspectRatio === '9:16') {
    renderSafeZoneGuides(ctx, width, height);
  }

  ctx.restore();
}

// Render a single Main or PIP media clip with Transform, Animation, Filters & Color Grading
function renderMediaClip(ctx, clip, width, height, currentTime, isPip = false) {
  ctx.save();

  const timeIntoClip = currentTime - clip.start;
  let animScale = 1;
  let animAlpha = 1;
  let animOffsetX = 0;
  let animOffsetY = 0;

  // Entrance animations
  if (clip.animIn === 'zoom_in' && timeIntoClip < 0.45) {
    const p = timeIntoClip / 0.45;
    animScale = 0.75 + 0.25 * easeOutCubic(p);
    animAlpha = easeOutCubic(p);
  } else if (clip.animIn === 'fade' && timeIntoClip < 0.45) {
    animAlpha = timeIntoClip / 0.45;
  } else if (clip.animIn === 'pop' && timeIntoClip < 0.35) {
    const p = timeIntoClip / 0.35;
    animScale = 0.4 + 0.6 * Math.sin(p * Math.PI * 0.65);
  } else if (clip.animIn === 'slide_up' && timeIntoClip < 0.4) {
    const p = timeIntoClip / 0.4;
    animOffsetY = (1 - easeOutCubic(p)) * height * 0.18;
  }

  // Continuous Combo animations
  if (clip.animCombo === 'ken_burns') {
    const p = Math.min(1, timeIntoClip / Math.max(1, clip.duration));
    animScale *= 1 + p * 0.14;
  } else if (clip.animCombo === 'pulse') {
    animScale *= 1 + Math.sin(currentTime * 6) * 0.03;
  }

  // User Transform properties
  const userScale = (clip.scale ?? (isPip ? 38 : 100)) / 100;
  const finalScale = userScale * animScale;
  const offsetX = ((clip.x ?? 0) / 100) * width + animOffsetX;
  const offsetY = ((clip.y ?? 0) / 100) * height + animOffsetY;
  const rotationRad = ((clip.rotation ?? 0) * Math.PI) / 180;
  const flipH = clip.flipH ? -1 : 1;
  const flipV = clip.flipV ? -1 : 1;

  ctx.globalAlpha = Math.max(0, Math.min(1, (clip.opacity ?? 1) * animAlpha));
  ctx.globalCompositeOperation = clip.blendMode || 'source-over';

  // Apply CSS Filters
  const f = clip.filters || {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    temperature: 0,
    tint: 0,
    vignette: 0,
    blur: 0,
    grayscale: 0
  };
  ctx.filter = `brightness(${f.brightness ?? 100}%) contrast(${f.contrast ?? 100}%) saturate(${f.saturate ?? 100}%) blur(${f.blur ?? 0}px) grayscale(${f.grayscale ?? 0}%) hue-rotate(${f.tint ?? 0}deg)`;

  ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
  ctx.rotate(rotationRad);
  ctx.scale(finalScale * flipH, finalScale * flipV);

  const drawW = width;
  const drawH = height;

  if (isPip) {
    // Rounded PIP frame clipping
    const radius = clip.cornerRadius ?? 18;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-drawW / 2, -drawH / 2, drawW, drawH, radius);
    } else {
      ctx.rect(-drawW / 2, -drawH / 2, drawW, drawH);
    }
    ctx.clip();
  }

  ctx.translate(-drawW / 2, -drawH / 2);

  // Sync HTML5 Video element if uploaded
  if (clip.type === 'video' && clip.videoElement) {
    const vid = clip.videoElement;
    const targetVidTime = ((currentTime - clip.start) * (clip.speed || 1)) % Math.max(0.5, vid.duration || 5);
    if (Math.abs((vid.currentTime || 0) - targetVidTime) > 0.18) {
      try {
        vid.currentTime = targetVidTime;
      } catch (e) {
        // ignore seek error
      }
    }
    drawImageCover(ctx, vid, drawW, drawH);
  } else if (clip.type === 'image' && clip.imageElement) {
    drawImageCover(ctx, clip.imageElement, drawW, drawH);
  } else {
    renderProceduralBackground(ctx, drawW, drawH, clip.theme || 'cyber_grid', currentTime * (clip.speed || 1));
  }

  // Color Temperature Overlay (Warm Orange / Cool Cyan tint)
  ctx.filter = 'none';
  if (f.temperature && f.temperature !== 0) {
    const tempVal = f.temperature;
    const alpha = Math.min(0.35, Math.abs(tempVal) / 140);
    ctx.fillStyle = tempVal > 0 ? `rgba(255, 140, 20, ${alpha})` : `rgba(0, 195, 255, ${alpha})`;
    ctx.fillRect(0, 0, drawW, drawH);
  }

  // Vignette Overlay
  if (f.vignette && f.vignette > 0) {
    const vigAlpha = Math.min(0.85, f.vignette / 100);
    const radGrad = ctx.createRadialGradient(
      drawW / 2,
      drawH / 2,
      drawW * 0.25,
      drawW / 2,
      drawH / 2,
      Math.max(drawW, drawH) * 0.72
    );
    radGrad.addColorStop(0, 'transparent');
    radGrad.addColorStop(1, `rgba(0, 0, 0, ${vigAlpha})`);
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, drawW, drawH);
  }

  // PIP Border
  if (isPip && (clip.borderWidth ?? 3) > 0) {
    ctx.strokeStyle = clip.borderColor || '#00f2fe';
    ctx.lineWidth = (clip.borderWidth ?? 3) * (1 / Math.max(0.2, finalScale));
    ctx.strokeRect(0, 0, drawW, drawH);
  }

  ctx.restore();
}

// Render smooth transitions between main video clips
function renderTransitionEffect(ctx, width, height, transType, progress, videoClips, currentClip, currentTime) {
  ctx.save();
  const p = easeOutCubic(Math.max(0, Math.min(1, progress)));

  if (transType === 'fade_black') {
    const alpha = Math.sin(p * Math.PI);
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.95})`;
    ctx.fillRect(0, 0, width, height);
  } else if (transType === 'flash') {
    const alpha = Math.sin(p * Math.PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx.fillRect(0, 0, width, height);
  } else if (transType === 'dissolve') {
    const nextClip = videoClips.find((c) => c.id !== currentClip.id && Math.abs(c.start - (currentClip.start + currentClip.duration)) < 0.3);
    if (nextClip) {
      ctx.globalAlpha = p;
      renderMediaClip(ctx, nextClip, width, height, nextClip.start + 0.05, false);
    }
  } else if (transType === 'slide_left' || transType === 'slide_right') {
    const dir = transType === 'slide_left' ? -1 : 1;
    ctx.fillStyle = `rgba(0, 242, 254, ${(1 - p) * 0.25})`;
    ctx.fillRect(dir > 0 ? 0 : width * (1 - p), 0, width * p, height);
  } else if (transType === 'wipe_down') {
    const grad = ctx.createLinearGradient(0, 0, 0, height * p);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(1, 'rgba(0, 242, 254, 0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height * p);
  }

  ctx.restore();
}

// Render FX Overlay Track Clips
function renderVideoEffectOverlay(ctx, fx, width, height, time) {
  ctx.save();
  const intensity = (fx.intensity ?? 75) / 100;
  const spd = fx.speed ?? 1.0;
  const t = time * spd;

  if (fx.effectType === 'neon_glow') {
    const pulse = 0.6 + 0.4 * Math.sin(t * 5);
    const borderGrad = ctx.createLinearGradient(0, 0, width, height);
    borderGrad.addColorStop(0, `rgba(0, 242, 254, ${0.75 * intensity * pulse})`);
    borderGrad.addColorStop(0.5, `rgba(139, 92, 246, ${0.65 * intensity * pulse})`);
    borderGrad.addColorStop(1, `rgba(255, 46, 99, ${0.75 * intensity * pulse})`);
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = Math.max(8, width * 0.022 * intensity);
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 24 * intensity;
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, width - ctx.lineWidth, height - ctx.lineWidth);
  } else if (fx.effectType === 'letterbox') {
    const barHeight = height * 0.11 * intensity;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, barHeight);
    ctx.fillRect(0, height - barHeight, width, barHeight);
  } else if (fx.effectType === 'rgb_glitch') {
    const sliceCount = 5;
    for (let i = 0; i < sliceCount; i++) {
      const y = ((Math.sin(t * 14 + i * 2.1) * 0.5 + 0.5) * height);
      const h = (12 + (i % 3) * 14) * intensity;
      ctx.fillStyle = i % 2 === 0
        ? `rgba(0, 242, 254, ${0.18 * intensity})`
        : `rgba(255, 0, 100, ${0.18 * intensity})`;
      ctx.fillRect(0, y, width, h);
    }
  } else if (fx.effectType === 'vhs_retro') {
    // Scanlines
    ctx.fillStyle = `rgba(0, 0, 0, ${0.22 * intensity})`;
    for (let y = 0; y < height; y += 6) {
      ctx.fillRect(0, y, width, 2);
    }
    // REC HUD
    ctx.fillStyle = `rgba(255, 50, 50, ${0.85 * intensity})`;
    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.07, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * intensity})`;
    ctx.font = `700 ${Math.round(width * 0.032)}px "JetBrains Mono", monospace`;
    ctx.fillText(`PLAY ▶  VHS ${formatSMPTEShort(time)}`, width * 0.14, height * 0.078);
  } else if (fx.effectType === 'flash_pulse') {
    const flash = Math.max(0, Math.sin(t * 12)) * 0.38 * intensity;
    ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
    ctx.fillRect(0, 0, width, height);
  } else if (fx.effectType === 'sparkle_rain') {
    for (let i = 0; i < 22; i++) {
      const x = ((i * 73 + t * 40 * (i % 2 === 0 ? 1 : -1)) % width + width) % width;
      const y = ((i * 117 + t * 110) % height);
      const r = (2 + (i % 4) * 2) * intensity;
      ctx.fillStyle = i % 2 === 0 ? `rgba(255, 230, 0, ${0.75 * intensity})` : `rgba(0, 242, 254, ${0.75 * intensity})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (fx.effectType === 'focus_vignette') {
    const rad = ctx.createRadialGradient(width / 2, height / 2, width * 0.18, width / 2, height / 2, width * 0.72);
    rad.addColorStop(0, 'transparent');
    rad.addColorStop(1, `rgba(0, 0, 0, ${0.82 * intensity})`);
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

// Procedural dynamic backgrounds for 6 themes
function renderProceduralBackground(ctx, width, height, theme, time) {
  const t = time;

  if (theme === 'cyber_grid') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#040b14');
    grad.addColorStop(0.58, '#0f172a');
    grad.addColorStop(1, '#00c6ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const sunGrad = ctx.createRadialGradient(width / 2, height * 0.42, 10, width / 2, height * 0.42, width * 0.36);
    sunGrad.addColorStop(0, 'rgba(255, 0, 128, 0.85)');
    sunGrad.addColorStop(0.65, 'rgba(0, 242, 254, 0.32)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.42, width * 0.36, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 242, 254, 0.45)';
    ctx.lineWidth = 2;
    const horizon = height * 0.58;
    const gridOffset = (t * 55) % 40;

    for (let y = horizon; y < height; y += 24) {
      const perspectiveY = y + gridOffset * ((y - horizon) / (height - horizon));
      if (perspectiveY <= height) {
        ctx.beginPath();
        ctx.moveTo(0, perspectiveY);
        ctx.lineTo(width, perspectiveY);
        ctx.stroke();
      }
    }
    for (let x = -width; x < width * 2; x += 60) {
      ctx.beginPath();
      ctx.moveTo(width / 2, horizon);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  } else if (theme === 'gradient_flow') {
    const angle = t * 0.55;
    const x1 = width / 2 + Math.cos(angle) * (width / 2);
    const y1 = height / 2 + Math.sin(angle) * (height / 2);
    const x2 = width / 2 - Math.cos(angle) * (width / 2);
    const y2 = height / 2 - Math.sin(angle) * (height / 2);

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, '#4f46e5');
    grad.addColorStop(0.5, '#9333ea');
    grad.addColorStop(1, '#ec4899');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 16; i++) {
      const px = (Math.sin(i * 3 + t * 0.8) * 0.4 + 0.5) * width;
      const py = (Math.cos(i * 5 + t * 0.6) * 0.4 + 0.5) * height;
      const r = 18 + Math.sin(i + t) * 12;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'fire_amber') {
    const grad = ctx.createLinearGradient(0, height, 0, 0);
    grad.addColorStop(0, '#7f1d1d');
    grad.addColorStop(0.45, '#dc2626');
    grad.addColorStop(0.85, '#f59e0b');
    grad.addColorStop(1, '#111827');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 24; i++) {
      const px = ((i * 53 + Math.sin(t * 2 + i) * 35) % width + width) % width;
      const py = height - ((t * 140 + i * 65) % height);
      const r = 6 + (i % 5) * 4;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.42)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'matrix_rain') {
    ctx.fillStyle = '#021814';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.55)';
    ctx.font = `700 ${Math.round(width * 0.032)}px "JetBrains Mono", monospace`;
    for (let col = 0; col < 14; col++) {
      const x = (col / 14) * width + 14;
      const y = ((t * (120 + col * 18) + col * 90) % height);
      ctx.fillText('01', x, y);
      ctx.fillText('10', x, (y + 42) % height);
      ctx.fillText('AI', x, (y + 84) % height);
    }
  } else if (theme === 'bokeh_cinema') {
    const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * 0.8);
    grad.addColorStop(0, '#2e1065');
    grad.addColorStop(0.6, '#1e1b4b');
    grad.addColorStop(1, '#090a0f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 14; i++) {
      const x = (Math.sin(t * 0.4 + i * 1.7) * 0.42 + 0.5) * width;
      const y = (Math.cos(t * 0.35 + i * 2.3) * 0.42 + 0.5) * height;
      const r = 28 + (i % 4) * 18;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(244, 114, 182, 0.22)' : 'rgba(56, 189, 248, 0.22)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // neon_city
    const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.8);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 6; i++) {
      const ringRadius = ((t * 85 + i * 75) % (width * 0.72));
      const alpha = Math.max(0, 1 - ringRadius / (width * 0.72)) * 0.45;
      ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(width / 2, height * 0.45, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function renderEmptyCanvasGrid(ctx, width, height) {
  ctx.fillStyle = '#090a0f';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#181a24';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawImageCover(ctx, media, width, height) {
  const mWidth = media.videoWidth || media.naturalWidth || media.width;
  const mHeight = media.videoHeight || media.naturalHeight || media.height;
  if (!mWidth || !mHeight) return;

  const hRatio = width / mWidth;
  const vRatio = height / mHeight;
  const ratio = Math.max(hRatio, vRatio);

  const centerShiftX = (width - mWidth * ratio) / 2;
  const centerShiftY = (height - mHeight * ratio) / 2;

  ctx.drawImage(media, 0, 0, mWidth, mHeight, centerShiftX, centerShiftY, mWidth * ratio, mHeight * ratio);
}

// Render styled CapCut Pro subtitles & stickers on canvas
function renderTextClip(ctx, clip, width, height, currentTime) {
  ctx.save();

  const timeIntoClip = currentTime - clip.start;
  let scale = (clip.scale ?? 100) / 100;
  let opacity = clip.opacity ?? 1;
  let offsetY = 0;
  let displayText = clip.text || '';

  if (clip.animStyle === 'pop' && timeIntoClip < 0.28) {
    const progress = timeIntoClip / 0.28;
    const spring = 0.5 + 0.5 * Math.sin(progress * Math.PI * 0.5) * 1.18;
    scale *= spring;
  } else if (clip.animStyle === 'fade' && timeIntoClip < 0.35) {
    opacity *= timeIntoClip / 0.35;
  } else if (clip.animStyle === 'bounce') {
    offsetY = Math.sin(timeIntoClip * 8) * 6;
  } else if (clip.animStyle === 'slide_up' && timeIntoClip < 0.35) {
    const p = timeIntoClip / 0.35;
    offsetY = (1 - easeOutCubic(p)) * 36;
    opacity *= p;
  } else if (clip.animStyle === 'typewriter') {
    const charDuration = Math.min(1.4, clip.duration * 0.65);
    const ratio = Math.min(1, timeIntoClip / Math.max(0.2, charDuration));
    const charCount = Math.max(1, Math.ceil(displayText.length * ratio));
    displayText = displayText.slice(0, charCount);
  }

  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

  const posX = ((clip.x ?? 50) / 100) * width;
  const posY = ((clip.y ?? 75) / 100) * height + offsetY;
  const rotRad = ((clip.rotation ?? 0) * Math.PI) / 180;

  ctx.translate(posX, posY);
  ctx.rotate(rotRad);
  ctx.scale(scale, scale);

  const fontPx = Math.max(16, Math.round(((clip.fontSize || 50) / 1080) * width * 1.65));
  ctx.font = `900 ${fontPx}px ${clip.fontFamily || "'Black Han Sans', 'Noto Sans KR', sans-serif"}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = String(displayText).split('\n');
  const lineHeight = fontPx * 1.24;
  const totalHeight = lines.length * lineHeight;

  let maxLineWidth = 0;
  lines.forEach((line) => {
    const m = ctx.measureText(line);
    if (m.width > maxLineWidth) maxLineWidth = m.width;
  });

  const paddingX = fontPx * 0.42;
  const paddingY = fontPx * 0.26;
  const boxWidth = maxLineWidth + paddingX * 2;
  const boxHeight = totalHeight + paddingY * 1.6;

  // Background Pill/Box
  if (clip.bgColor && clip.bgColor !== 'transparent') {
    ctx.fillStyle = clip.bgColor;
    const radius = fontPx * 0.26;
    const rx = -boxWidth / 2;
    const ry = -boxHeight / 2;

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(rx, ry, boxWidth, boxHeight, radius);
    } else {
      ctx.rect(rx, ry, boxWidth, boxHeight);
    }
    ctx.fill();
  }

  // Drop Shadow / Neon Glow
  if (clip.shadowBlur > 0 || clip.animStyle === 'neon') {
    ctx.shadowColor = clip.shadowColor || clip.color || '#00f2fe';
    ctx.shadowBlur = clip.animStyle === 'neon' ? 18 + Math.sin(currentTime * 8) * 6 : clip.shadowBlur || 8;
  }

  lines.forEach((line, idx) => {
    const ly = (idx - (lines.length - 1) / 2) * lineHeight;
    if ((clip.strokeWidth ?? 0) > 0 && clip.strokeColor) {
      ctx.strokeStyle = clip.strokeColor;
      ctx.lineWidth = Math.max(2, Math.round(((clip.strokeWidth || 6) / 1080) * width * 1.6));
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(line, 0, ly);
    }
    ctx.fillStyle = clip.color || '#FFFFFF';
    ctx.fillText(line, 0, ly);
  });

  ctx.restore();
}

function renderRuleOfThirdsGrid(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo((width * i) / 3, 0);
    ctx.lineTo((width * i) / 3, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, (height * i) / 3);
    ctx.lineTo(width, (height * i) / 3);
    ctx.stroke();
  }
  ctx.restore();
}

function renderSafeZoneGuides(ctx, width, height) {
  ctx.save();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.65)';
  ctx.lineWidth = 2;

  ctx.strokeRect(width * 0.07, height * 0.11, width * 0.86, height * 0.73);

  // Right TikTok/Shorts action icons zone indicator
  ctx.strokeStyle = 'rgba(255, 59, 92, 0.55)';
  ctx.strokeRect(width * 0.82, height * 0.45, width * 0.14, height * 0.36);

  ctx.fillStyle = 'rgba(0, 242, 254, 0.9)';
  ctx.font = '600 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📱 9:16 쇼츠/릴스 세이프존 가이드', width / 2, height * 0.095);

  ctx.restore();
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function formatSMPTEShort(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const f = Math.floor((secs % 1) * 30);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
}

// Export Video using MediaRecorder
export async function exportProjectVideo({
  duration,
  videoClips,
  pipClips = [],
  effectClips = [],
  textClips = [],
  aspectRatio = '9:16',
  resolution = '1080p',
  fps = 30,
  onProgress
}) {
  const exportCanvas = document.createElement('canvas');
  const scaleMult = resolution === '1080p' ? 1 : 0.6667;
  const baseW = aspectRatio === '9:16' ? 1080 : aspectRatio === '1:1' ? 1080 : aspectRatio === '4:5' ? 1080 : 1920;
  const baseH = aspectRatio === '9:16' ? 1920 : aspectRatio === '1:1' ? 1080 : aspectRatio === '4:5' ? 1350 : 1080;

  const exportWidth = Math.round(baseW * scaleMult);
  const exportHeight = Math.round(baseH * scaleMult);

  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;
  const ctx = exportCanvas.getContext('2d');

  const stream = exportCanvas.captureStream(fps);
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: resolution === '1080p' ? 6000000 : 3500000
  });
  const recordedChunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `CapCut_Pro_${resolution}_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      resolve(blob);
    };

    recorder.onerror = (err) => reject(err);
    recorder.start();

    const totalFrames = Math.floor(duration * fps);
    let frame = 0;

    function renderNext() {
      if (frame >= totalFrames) {
        recorder.stop();
        if (onProgress) onProgress(100);
        return;
      }

      const t = frame / fps;
      renderFrame({
        ctx,
        width: exportWidth,
        height: exportHeight,
        currentTime: t,
        videoClips,
        pipClips,
        effectClips,
        textClips,
        showSafeZone: false,
        showGrid: false,
        aspectRatio
      });

      frame++;
      const progressPercent = Math.min(99, Math.round((frame / totalFrames) * 100));
      if (onProgress && frame % 4 === 0) {
        onProgress(progressPercent);
      }

      requestAnimationFrame(renderNext);
    }

    renderNext();
  });
}
