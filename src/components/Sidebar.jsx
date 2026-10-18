import React, { useState } from 'react';
import {
  Film,
  Type,
  Music,
  Smile,
  Sparkles,
  Upload,
  Plus,
  Volume2,
  FileText,
  Search,
  Wand2,
  Shuffle,
  Sliders,
  Layers,
  Mic,
  Play
} from 'lucide-react';
import {
  TEXT_PRESETS,
  STICKER_PRESETS,
  CALLOUT_BADGES,
  PROCEDURAL_THEMES,
  VIDEO_EFFECT_PRESETS,
  TRANSITION_PRESETS,
  LUT_FILTER_PRESETS,
  BGM_LIBRARY,
  SFX_LIBRARY,
  INITIAL_MEDIA_BIN
} from '../utils/sampleData';
import { audioEngine } from '../utils/audioSynth';
import { parseSRT } from '../utils/srtExporter';

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentTime,
  onAddVideoClip,
  onAddPipClip,
  onAddEffectClip,
  onAddTextClip,
  onAddBatchTextClips,
  onAddAudioClip,
  onImportSRT,
  onApplyFilterPreset,
  onApplyTransitionPreset
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaBin, setMediaBin] = useState(INITIAL_MEDIA_BIN);
  const [aiScriptText, setAiScriptText] = useState(
    '🔥 3초 만에 시선을 사로잡는 인트로!\n💡 캡컷 프로 웹 스튜디오의 핵심 기능\n👉 지금 바로 구독과 좋아요 눌러주세요!'
  );
  const [clipDurationPerLine, setClipDurationPerLine] = useState(3.5);

  const navItems = [
    { id: 'media', label: '미디어', icon: Film },
    { id: 'audio', label: '오디오', icon: Music },
    { id: 'text', label: '텍스트', icon: Type },
    { id: 'stickers', label: '스티커', icon: Smile },
    { id: 'effects', label: '효과', icon: Wand2 },
    { id: 'transitions', label: '전환', icon: Shuffle },
    { id: 'filters', label: '필터', icon: Sliders }
  ];

  // Handle local user video / image / audio upload
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.src = fileUrl;
      img.onload = () => {
        const newAsset = {
          id: `asset-${Date.now()}`,
          title: file.name,
          meta: `${img.naturalWidth}x${img.naturalHeight} IMG`,
          duration: 4.0,
          type: 'image',
          imageElement: img,
          src: fileUrl,
          color1: '#0f172a',
          color2: '#00f2fe'
        };
        setMediaBin((prev) => [newAsset, ...prev]);
        onAddVideoClip({
          id: `img-${Date.now()}`,
          title: file.name.slice(0, 18),
          subtitleTag: 'LOCAL IMAGE',
          type: 'image',
          imageElement: img,
          src: fileUrl,
          start: currentTime,
          duration: 4.0,
          speed: 1,
          volume: 1,
          opacity: 1,
          scale: 100,
          x: 0,
          y: 0,
          rotation: 0,
          flipH: false,
          flipV: false,
          animIn: 'zoom_in',
          transition: 'dissolve',
          transitionDuration: 0.5,
          filters: { brightness: 100, contrast: 100, saturate: 100, temperature: 0, tint: 0, vignette: 0, blur: 0, grayscale: 0 }
        });
      };
    } else if (file.type.startsWith('video/')) {
      const vid = document.createElement('video');
      vid.src = fileUrl;
      vid.muted = true;
      vid.playsInline = true;
      vid.preload = 'auto';
      vid.onloadedmetadata = () => {
        const dur = Math.min(20, Math.round((vid.duration || 5) * 10) / 10);
        const newAsset = {
          id: `asset-${Date.now()}`,
          title: file.name,
          meta: 'LOCAL VIDEO',
          duration: dur,
          type: 'video',
          videoElement: vid,
          src: fileUrl,
          color1: '#1e1b4b',
          color2: '#8b5cf6'
        };
        setMediaBin((prev) => [newAsset, ...prev]);
        onAddVideoClip({
          id: `vid-${Date.now()}`,
          title: file.name.slice(0, 18),
          subtitleTag: 'LOCAL MP4',
          type: 'video',
          videoElement: vid,
          src: fileUrl,
          start: currentTime,
          duration: dur,
          speed: 1,
          volume: 1,
          opacity: 1,
          scale: 100,
          x: 0,
          y: 0,
          rotation: 0,
          flipH: false,
          flipV: false,
          animIn: 'none',
          transition: 'dissolve',
          transitionDuration: 0.5,
          filters: { brightness: 100, contrast: 100, saturate: 100, temperature: 0, tint: 0, vignette: 0, blur: 0, grayscale: 0 }
        });
      };
    } else if (file.type.startsWith('audio/')) {
      onAddAudioClip({
        id: `aud-${Date.now()}`,
        title: file.name.slice(0, 18),
        src: fileUrl,
        trackName: 'lofi',
        audioType: 'bgm',
        start: currentTime,
        duration: 10.0,
        volume: 0.85,
        fadeIn: 0.5,
        fadeOut: 1.0,
        isMuted: false
      });
    }
  };

  // Handle SRT upload
  const handleSRTUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        const clips = parseSRT(text);
        if (clips.length > 0) {
          onImportSRT(clips);
        }
      }
    };
    reader.readAsText(file);
  };

  // Generate timed subtitles from multi-line AI script
  const handleGenerateAISubtitles = (speakFirst = false) => {
    const lines = aiScriptText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    let cursor = currentTime;
    const generated = lines.map((line, idx) => {
      const clip = {
        id: `txt-ai-${Date.now()}-${idx}`,
        text: line,
        start: Math.round(cursor * 10) / 10,
        duration: clipDurationPerLine,
        fontSize: 52,
        color: idx % 2 === 0 ? '#00F2FE' : '#FFE600',
        bgColor: 'rgba(13, 14, 19, 0.86)',
        strokeColor: '#000000',
        strokeWidth: 7,
        shadowColor: 'rgba(0, 242, 254, 0.45)',
        shadowBlur: 10,
        fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif",
        x: 50,
        y: 76,
        rotation: 0,
        scale: 100,
        opacity: 1,
        animStyle: idx % 2 === 0 ? 'pop' : 'typewriter',
        ttsEnabled: true
      };
      cursor += clipDurationPerLine;
      return clip;
    });

    onAddBatchTextClips(generated);
    if (speakFirst) {
      audioEngine.speakText(lines.join('. '), 1.1, 1.0);
    }
  };

  const addAssetToTrack = (asset, targetTrack = 'main') => {
    const baseClip = {
      id: `${targetTrack}-${Date.now()}`,
      title: asset.title,
      subtitleTag: asset.meta || '4K 60FPS',
      type: asset.type || 'procedural',
      theme: asset.theme || 'cyber_grid',
      imageElement: asset.imageElement,
      videoElement: asset.videoElement,
      src: asset.src,
      start: currentTime,
      duration: asset.duration || 4.5,
      speed: 1,
      volume: 1,
      opacity: 1,
      scale: targetTrack === 'pip' ? 38 : 100,
      x: targetTrack === 'pip' ? 24 : 0,
      y: targetTrack === 'pip' ? -24 : 0,
      rotation: 0,
      flipH: false,
      flipV: false,
      cornerRadius: targetTrack === 'pip' ? 16 : 0,
      borderColor: '#00f2fe',
      borderWidth: targetTrack === 'pip' ? 3 : 0,
      animIn: targetTrack === 'pip' ? 'pop' : 'zoom_in',
      animCombo: 'none',
      transition: 'dissolve',
      transitionDuration: 0.5,
      filters: {
        brightness: 102,
        contrast: 112,
        saturate: 120,
        temperature: 0,
        tint: 0,
        vignette: 10,
        blur: 0,
        grayscale: 0
      }
    };

    if (targetTrack === 'pip') {
      onAddPipClip(baseClip);
    } else {
      onAddVideoClip(baseClip);
    }
  };

  return (
    <aside className="sidebar-shell">
      {/* 1. Vertical Icon Rail (Stitch Left Rail) */}
      <div className="sidebar-icon-rail">
        <div className="rail-brand-tag">STUDIO</div>
        <div className="rail-tabs-stack">
          {navItems.map((item) => {
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                className={`rail-tab-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
              >
                <IconComp size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Expandable Asset Drawer */}
      <div className="sidebar-drawer">
        {/* Drawer Header */}
        <div className="drawer-header">
          <span className="drawer-title">
            {activeTab === 'media' && '미디어 라이브러리'}
            {activeTab === 'audio' && '오디오 & 효과음'}
            {activeTab === 'text' && '텍스트 & AI 자막'}
            {activeTab === 'stickers' && '스티커 & 콜아웃'}
            {activeTab === 'effects' && '비디오 이펙트 (FX)'}
            {activeTab === 'transitions' && '화면 전환 (Transition)'}
            {activeTab === 'filters' && '색보정 필터 (LUT)'}
          </span>

          <label className="import-pill-btn" title="내 PC에서 파일 가져오기">
            <Plus size={13} />
            <span>가져오기</span>
            <input
              type="file"
              accept="video/*,image/*,audio/*"
              style={{ display: 'none' }}
              onChange={handleMediaUpload}
            />
          </label>
        </div>

        {/* Search Input */}
        <div className="drawer-search-box">
          <div className="search-input-wrap">
            <Search size={13} className="search-icon" />
            <input
              type="text"
              placeholder="에셋 및 프리셋 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="drawer-content">
          {/* ================= TAB: MEDIA ================= */}
          {activeTab === 'media' && (
            <div className="drawer-section">
              <label className="upload-dropzone-card">
                <Upload size={18} />
                <div className="dropzone-text">
                  <strong>로컬 미디어 업로드 (MP4/PNG/WAV)</strong>
                  <span>클릭하여 내 PC의 영상/이미지를 추가하세요</span>
                </div>
                <input
                  type="file"
                  accept="video/*,image/*,audio/*"
                  style={{ display: 'none' }}
                  onChange={handleMediaUpload}
                />
              </label>

              <div className="sub-label-row">
                <span>스튜디오 에셋 빈 ({mediaBin.length})</span>
                <span className="hint-tag">메인 / PIP 추가 지원</span>
              </div>

              <div className="media-asset-grid">
                {mediaBin
                  .filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((asset) => (
                    <div key={asset.id} className="media-asset-card">
                      <div
                        className="asset-thumb"
                        style={{
                          background: `linear-gradient(135deg, ${asset.color1 || '#0f172a'}, ${asset.color2 || '#00f2fe'})`
                        }}
                        onClick={() => addAssetToTrack(asset, 'main')}
                      >
                        <span className="asset-duration-badge">
                          00:{String(Math.round(asset.duration)).padStart(2, '0')}
                        </span>
                        <div className="asset-hover-actions">
                          <button
                            className="asset-add-btn main"
                            onClick={(e) => {
                              e.stopPropagation();
                              addAssetToTrack(asset, 'main');
                            }}
                            title="메인 비디오 트랙에 추가"
                          >
                            + 메인
                          </button>
                          <button
                            className="asset-add-btn pip"
                            onClick={(e) => {
                              e.stopPropagation();
                              addAssetToTrack(asset, 'pip');
                            }}
                            title="PIP 오버레이 트랙에 추가"
                          >
                            + PIP
                          </button>
                        </div>
                      </div>
                      <div className="asset-meta-box">
                        <p className="asset-name">{asset.title}</p>
                        <span className="asset-fps">{asset.meta}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ================= TAB: TEXT & AI CAPTIONS ================= */}
          {activeTab === 'text' && (
            <div className="drawer-section">
              <div className="quick-btn-row">
                <button
                  className="primary-action-btn"
                  onClick={() =>
                    onAddTextClip({
                      id: `txt-${Date.now()}`,
                      text: '새 자막을 입력하세요',
                      start: currentTime,
                      duration: 3.5,
                      fontSize: 52,
                      color: '#00F2FE',
                      bgColor: 'rgba(13, 14, 19, 0.85)',
                      strokeColor: '#000000',
                      strokeWidth: 6,
                      shadowColor: 'rgba(0, 242, 254, 0.45)',
                      shadowBlur: 10,
                      fontFamily: "'Black Han Sans', sans-serif",
                      x: 50,
                      y: 76,
                      rotation: 0,
                      scale: 100,
                      opacity: 1,
                      animStyle: 'pop'
                    })
                  }
                >
                  <Plus size={15} />
                  <span>기본 자막 추가</span>
                </button>

                <label className="secondary-action-btn">
                  <FileText size={14} />
                  <span>SRT 가져오기</span>
                  <input
                    type="file"
                    accept=".srt,.txt"
                    style={{ display: 'none' }}
                    onChange={handleSRTUpload}
                  />
                </label>
              </div>

              {/* AI Auto-Caption & TTS Generator */}
              <div className="ai-caption-box">
                <div className="ai-box-header">
                  <span className="ai-badge">AI AUTO</span>
                  <h4>대본 → 자동 자막 & TTS 생성</h4>
                </div>
                <textarea
                  className="ai-script-textarea"
                  rows={3}
                  value={aiScriptText}
                  onChange={(e) => setAiScriptText(e.target.value)}
                  placeholder="줄바꿈(Enter) 기준으로 자막이 자동 분할 배치됩니다."
                />
                <div className="ai-duration-row">
                  <span>컷당 자막 길이: {clipDurationPerLine}초</span>
                  <input
                    type="range"
                    min="1.5"
                    max="6.0"
                    step="0.5"
                    value={clipDurationPerLine}
                    onChange={(e) => setClipDurationPerLine(Number(e.target.value))}
                  />
                </div>
                <div className="ai-btn-group">
                  <button
                    className="ai-generate-btn"
                    onClick={() => handleGenerateAISubtitles(false)}
                  >
                    <Sparkles size={13} />
                    <span>타임라인 자동 배치</span>
                  </button>
                  <button
                    className="ai-tts-btn"
                    onClick={() => handleGenerateAISubtitles(true)}
                    title="자막 생성과 동시에 한국어 TTS 음성으로 읽어줍니다"
                  >
                    <Mic size={13} />
                    <span>배치 + TTS 읽기</span>
                  </button>
                </div>
              </div>

              <div className="sub-label-row">
                <span>인기 쇼츠 자막 템플릿</span>
              </div>

              <div className="preset-list">
                {TEXT_PRESETS.filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((preset, idx) => (
                  <div
                    key={idx}
                    className="text-preset-card"
                    onClick={() =>
                      onAddTextClip({
                        id: `txt-${Date.now()}-${idx}`,
                        text: `${preset.name} 자막`,
                        start: currentTime,
                        duration: 3.5,
                        fontSize: 52,
                        color: preset.color,
                        bgColor: preset.bgColor,
                        strokeColor: preset.strokeColor,
                        strokeWidth: preset.strokeWidth,
                        shadowColor: preset.shadowColor,
                        shadowBlur: preset.shadowBlur,
                        fontFamily: preset.fontFamily,
                        x: 50,
                        y: 76,
                        rotation: 0,
                        scale: 100,
                        opacity: 1,
                        animStyle: preset.animStyle || 'pop'
                      })
                    }
                  >
                    <div
                      className="preset-preview"
                      style={{
                        backgroundColor: preset.bgColor,
                        color: preset.color,
                        fontFamily: preset.fontFamily,
                        WebkitTextStroke: `${Math.min(2, preset.strokeWidth / 3)}px ${preset.strokeColor}`
                      }}
                    >
                      가나다 ABC 123
                    </div>
                    <span className="preset-name">{preset.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: AUDIO & SFX ================= */}
          {activeTab === 'audio' && (
            <div className="drawer-section">
              <div className="sub-label-row">
                <span>스튜디오 BGM 라이브러리</span>
              </div>

              <div className="audio-item-list">
                {BGM_LIBRARY.map((bgm) => (
                  <div key={bgm.id} className="audio-card">
                    <button
                      className="audio-preview-icon"
                      onClick={() => audioEngine.playBGM(bgm.id)}
                      title="BGM 미리듣기"
                    >
                      <Play size={13} />
                    </button>
                    <div
                      className="audio-card-info"
                      onClick={() => {
                        audioEngine.playBGM(bgm.id);
                        onAddAudioClip({
                          id: `aud-${Date.now()}`,
                          title: bgm.title,
                          trackName: bgm.id,
                          audioType: 'bgm',
                          start: currentTime,
                          duration: bgm.duration,
                          volume: 0.75,
                          fadeIn: 0.5,
                          fadeOut: 1.0,
                          isMuted: false
                        });
                      }}
                    >
                      <span className="audio-title">{bgm.title}</span>
                      <span className="audio-meta">
                        {bgm.bpm} • {bgm.mood}
                      </span>
                    </div>
                    <button
                      className="play-sfx-btn"
                      onClick={() =>
                        onAddAudioClip({
                          id: `aud-${Date.now()}`,
                          title: bgm.title,
                          trackName: bgm.id,
                          audioType: 'bgm',
                          start: currentTime,
                          duration: bgm.duration,
                          volume: 0.75,
                          fadeIn: 0.5,
                          fadeOut: 1.0,
                          isMuted: false
                        })
                      }
                      title="타임라인에 추가"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="sub-label-row" style={{ marginTop: '14px' }}>
                <span>효과음 (SFX) — 클릭 시 재생 및 트랙 삽입</span>
              </div>

              <div className="sfx-grid">
                {SFX_LIBRARY.map((sfx) => (
                  <button
                    key={sfx.type}
                    className="sfx-btn"
                    onClick={() => {
                      audioEngine.playSFX(sfx.type);
                      onAddAudioClip({
                        id: `sfx-${Date.now()}`,
                        title: sfx.label,
                        trackName: sfx.type,
                        audioType: 'sfx',
                        start: currentTime,
                        duration: sfx.duration,
                        volume: 0.9,
                        fadeIn: 0,
                        fadeOut: 0.1,
                        isMuted: false
                      });
                    }}
                  >
                    <Volume2 size={14} />
                    <span>{sfx.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: STICKERS & BADGES ================= */}
          {activeTab === 'stickers' && (
            <div className="drawer-section">
              <div className="sub-label-row">
                <span>쇼츠 콜아웃 뱃지</span>
              </div>
              <div className="callout-grid">
                {CALLOUT_BADGES.map((badge, idx) => (
                  <button
                    key={idx}
                    className="callout-badge-btn"
                    style={{ backgroundColor: badge.bgColor, color: badge.color }}
                    onClick={() =>
                      onAddTextClip({
                        id: `badge-${Date.now()}-${idx}`,
                        text: badge.text,
                        start: currentTime,
                        duration: 3.0,
                        fontSize: 44,
                        color: badge.color,
                        bgColor: badge.bgColor,
                        strokeColor: '#000000',
                        strokeWidth: 4,
                        fontFamily: "'Black Han Sans', sans-serif",
                        x: 50,
                        y: 22,
                        rotation: 0,
                        scale: 100,
                        opacity: 1,
                        animStyle: 'bounce'
                      })
                    }
                  >
                    {badge.text}
                  </button>
                ))}
              </div>

              <div className="sub-label-row" style={{ marginTop: '14px' }}>
                <span>인기 이모지 스티커</span>
              </div>
              <div className="stickers-grid">
                {STICKER_PRESETS.map((sticker, idx) => (
                  <button
                    key={idx}
                    className="sticker-btn"
                    onClick={() =>
                      onAddTextClip({
                        id: `stk-${Date.now()}-${idx}`,
                        text: sticker,
                        start: currentTime,
                        duration: 2.8,
                        fontSize: 82,
                        color: '#FFFFFF',
                        bgColor: 'transparent',
                        strokeWidth: 0,
                        x: 50,
                        y: 48,
                        rotation: 0,
                        scale: 100,
                        opacity: 1,
                        animStyle: 'pop'
                      })
                    }
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: VIDEO EFFECTS (FX TRACK) ================= */}
          {activeTab === 'effects' && (
            <div className="drawer-section">
              <div className="sub-label-row">
                <span>특수 시각 효과 (Effects 트랙에 추가)</span>
              </div>
              <div className="fx-card-list">
                {VIDEO_EFFECT_PRESETS.map((fx) => (
                  <div
                    key={fx.id}
                    className="fx-preset-card"
                    onClick={() =>
                      onAddEffectClip({
                        id: `fx-${Date.now()}`,
                        title: fx.name,
                        effectType: fx.id,
                        start: currentTime,
                        duration: 4.0,
                        intensity: 75,
                        speed: 1.0
                      })
                    }
                  >
                    <div className="fx-color-bar" style={{ backgroundColor: fx.color }} />
                    <div className="fx-card-body">
                      <span className="fx-title">{fx.name}</span>
                      <span className="fx-desc">{fx.desc}</span>
                    </div>
                    <Plus size={15} className="fx-add-icon" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: TRANSITIONS ================= */}
          {activeTab === 'transitions' && (
            <div className="drawer-section">
              <div className="sub-label-row">
                <span>클립 간 장면 전환 (Transition)</span>
              </div>
              <div className="transition-grid">
                {TRANSITION_PRESETS.map((tr) => (
                  <button
                    key={tr.id}
                    className="transition-card-btn"
                    onClick={() => onApplyTransitionPreset(tr.id, tr.duration || 0.5)}
                  >
                    <span className="tr-icon">{tr.icon}</span>
                    <div className="tr-info">
                      <span className="tr-name">{tr.name}</span>
                      <span className="tr-dur">{tr.duration}s</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: COLOR LUT FILTERS ================= */}
          {activeTab === 'filters' && (
            <div className="drawer-section">
              <div className="sub-label-row">
                <span>시네마틱 색보정 LUT 프리셋</span>
              </div>
              <div className="lut-grid">
                {LUT_FILTER_PRESETS.map((lut) => (
                  <div
                    key={lut.id}
                    className="lut-card"
                    onClick={() => onApplyFilterPreset(lut.filters)}
                  >
                    <div className="lut-swatch" style={{ background: lut.gradient }}>
                      <span className="lut-badge">{lut.badge}</span>
                    </div>
                    <span className="lut-name">{lut.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
