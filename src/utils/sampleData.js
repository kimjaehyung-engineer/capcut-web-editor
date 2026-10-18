// Sample data, presets, and initial project state for CapCut Pro Studio Web

export const INITIAL_VIDEO_CLIPS = [
  {
    id: 'vid-1',
    title: '도시_네온_드론.mp4',
    subtitleTag: '4K 60FPS • B-Roll',
    type: 'procedural',
    theme: 'cyber_grid',
    track: 'main',
    start: 0,
    duration: 4.5,
    speed: 1,
    volume: 1,
    opacity: 1,
    scale: 100,
    x: 0,
    y: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    blendMode: 'source-over',
    animIn: 'zoom_in',
    animCombo: 'none',
    transition: 'dissolve',
    transitionDuration: 0.6,
    filters: {
      brightness: 105,
      contrast: 120,
      saturate: 130,
      temperature: 0,
      tint: 0,
      vignette: 15,
      blur: 0,
      grayscale: 0
    }
  },
  {
    id: 'vid-2',
    title: '인터뷰_클립_01.mp4',
    subtitleTag: '4K 30FPS • A-Roll',
    type: 'procedural',
    theme: 'gradient_flow',
    track: 'main',
    start: 4.5,
    duration: 5.5,
    speed: 1,
    volume: 1,
    opacity: 1,
    scale: 100,
    x: 0,
    y: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    blendMode: 'source-over',
    animIn: 'none',
    animCombo: 'ken_burns',
    transition: 'slide_left',
    transitionDuration: 0.5,
    filters: {
      brightness: 102,
      contrast: 112,
      saturate: 118,
      temperature: 8,
      tint: 0,
      vignette: 10,
      blur: 0,
      grayscale: 0
    }
  },
  {
    id: 'vid-3',
    title: '화려한_오프닝.mp4',
    subtitleTag: '4K 60FPS • Finale',
    type: 'procedural',
    theme: 'neon_city',
    track: 'main',
    start: 10.0,
    duration: 5.0,
    speed: 1,
    volume: 1,
    opacity: 1,
    scale: 100,
    x: 0,
    y: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    blendMode: 'source-over',
    animIn: 'fade',
    animCombo: 'pulse',
    transition: 'flash',
    transitionDuration: 0.4,
    filters: {
      brightness: 110,
      contrast: 128,
      saturate: 140,
      temperature: -10,
      tint: 5,
      vignette: 20,
      blur: 0,
      grayscale: 0
    }
  }
];

export const INITIAL_PIP_CLIPS = [
  {
    id: 'pip-1',
    title: '리액션_캠_PIP.mp4',
    type: 'procedural',
    theme: 'bokeh_cinema',
    track: 'pip',
    start: 4.8,
    duration: 4.5,
    speed: 1,
    volume: 0,
    opacity: 0.95,
    scale: 36,
    x: 26,
    y: -26,
    rotation: -3,
    flipH: false,
    flipV: false,
    cornerRadius: 18,
    borderColor: '#00f2fe',
    borderWidth: 3,
    animIn: 'pop',
    filters: {
      brightness: 105,
      contrast: 110,
      saturate: 115,
      temperature: 0,
      tint: 0,
      vignette: 0,
      blur: 0,
      grayscale: 0
    }
  }
];

export const INITIAL_EFFECT_CLIPS = [
  {
    id: 'fx-1',
    title: '✨ 네온 글로우 효과',
    effectType: 'neon_glow',
    start: 0.2,
    duration: 4.0,
    intensity: 75,
    speed: 1.0
  },
  {
    id: 'fx-2',
    title: '🎬 시네마틱 레터박스',
    effectType: 'letterbox',
    start: 4.5,
    duration: 5.5,
    intensity: 65,
    speed: 1.0
  },
  {
    id: 'fx-3',
    title: '🌈 RGB 글리치 펄스',
    effectType: 'rgb_glitch',
    start: 10.0,
    duration: 4.8,
    intensity: 60,
    speed: 1.2
  }
];

export const INITIAL_TEXT_CLIPS = [
  {
    id: 'txt-1',
    text: '✨ 안녕하세요 오늘 브이로그 시작할게요!',
    start: 0.3,
    duration: 4.0,
    fontSize: 50,
    color: '#00F2FE',
    bgColor: 'rgba(13, 14, 19, 0.85)',
    strokeColor: '#000000',
    strokeWidth: 6,
    shadowColor: 'rgba(0, 242, 254, 0.5)',
    shadowBlur: 12,
    fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif",
    x: 50,
    y: 76,
    rotation: 0,
    scale: 100,
    opacity: 1,
    animStyle: 'pop',
    ttsEnabled: false,
    ttsRate: 1.1,
    ttsPitch: 1.0
  },
  {
    id: 'txt-2',
    text: '🔥 캡컷 프로급 멀티트랙 & 실시간 렌더링!',
    start: 4.6,
    duration: 5.0,
    fontSize: 52,
    color: '#FFE600',
    bgColor: 'rgba(0, 0, 0, 0.82)',
    strokeColor: '#000000',
    strokeWidth: 7,
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    shadowBlur: 10,
    fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif",
    x: 50,
    y: 76,
    rotation: 0,
    scale: 100,
    opacity: 1,
    animStyle: 'typewriter',
    ttsEnabled: false,
    ttsRate: 1.1,
    ttsPitch: 1.0
  },
  {
    id: 'txt-3',
    text: '👉 지금 바로 나만의 쇼츠를 완성하세요!',
    start: 10.1,
    duration: 4.6,
    fontSize: 54,
    color: '#FFFFFF',
    bgColor: '#FF2E63',
    strokeColor: '#000000',
    strokeWidth: 6,
    shadowColor: 'rgba(255, 46, 99, 0.6)',
    shadowBlur: 14,
    fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif",
    x: 50,
    y: 76,
    rotation: 0,
    scale: 100,
    opacity: 1,
    animStyle: 'bounce',
    ttsEnabled: false,
    ttsRate: 1.1,
    ttsPitch: 1.0
  }
];

export const INITIAL_AUDIO_CLIPS = [
  {
    id: 'aud-1',
    title: '배경음악_로파이.wav',
    trackName: 'lofi',
    audioType: 'bgm',
    start: 0,
    duration: 15.0,
    volume: 0.75,
    fadeIn: 0.8,
    fadeOut: 1.5,
    speed: 1.0,
    isMuted: false
  },
  {
    id: 'aud-2',
    title: '💨 휙 (전환 SFX)',
    trackName: 'whoosh',
    audioType: 'sfx',
    start: 4.4,
    duration: 0.8,
    volume: 0.9,
    fadeIn: 0,
    fadeOut: 0.1,
    speed: 1.0,
    isMuted: false
  },
  {
    id: 'aud-3',
    title: '💥 임팩트 붐 (SFX)',
    trackName: 'boom',
    audioType: 'sfx',
    start: 10.0,
    duration: 1.0,
    volume: 0.9,
    fadeIn: 0,
    fadeOut: 0.2,
    speed: 1.0,
    isMuted: false
  }
];

export const INITIAL_MEDIA_BIN = [
  {
    id: 'asset-1',
    title: '도시_네온_드론.mp4',
    meta: '4K 60FPS',
    duration: 4.5,
    type: 'procedural',
    theme: 'cyber_grid',
    color1: '#040b14',
    color2: '#00f2fe'
  },
  {
    id: 'asset-2',
    title: '인터뷰_클립_01.mp4',
    meta: '4K 30FPS',
    duration: 5.5,
    type: 'procedural',
    theme: 'gradient_flow',
    color1: '#4A00E0',
    color2: '#ff007f'
  },
  {
    id: 'asset-3',
    title: '화려한_오프닝.mp4',
    meta: '4K 60FPS',
    duration: 5.0,
    type: 'procedural',
    theme: 'neon_city',
    color1: '#1e1b4b',
    color2: '#8b5cf6'
  },
  {
    id: 'asset-4',
    title: '골든_엠버_파이어.mp4',
    meta: '1080P 60FPS',
    duration: 5.0,
    type: 'procedural',
    theme: 'fire_amber',
    color1: '#f12711',
    color2: '#f5af19'
  },
  {
    id: 'asset-5',
    title: '매트릭스_데이터_레인.mp4',
    meta: '4K 60FPS',
    duration: 6.0,
    type: 'procedural',
    theme: 'matrix_rain',
    color1: '#022c22',
    color2: '#10b981'
  },
  {
    id: 'asset-6',
    title: '시네마_보케_라이트.mp4',
    meta: '1080P 30FPS',
    duration: 5.0,
    type: 'procedural',
    theme: 'bokeh_cinema',
    color1: '#1f1235',
    color2: '#f472b6'
  }
];

export const TEXT_PRESETS = [
  {
    name: '캡컷 사이버 시안',
    color: '#00F2FE',
    bgColor: 'rgba(13, 14, 19, 0.88)',
    strokeColor: '#000000',
    strokeWidth: 6,
    shadowColor: 'rgba(0, 242, 254, 0.5)',
    shadowBlur: 12,
    fontFamily: "'Black Han Sans', sans-serif",
    animStyle: 'pop'
  },
  {
    name: '쇼츠 옐로우 볼드',
    color: '#FFE600',
    bgColor: 'rgba(0, 0, 0, 0.85)',
    strokeColor: '#000000',
    strokeWidth: 8,
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    shadowBlur: 8,
    fontFamily: "'Black Han Sans', sans-serif",
    animStyle: 'pop'
  },
  {
    name: '레드 속보/경고 뱃지',
    color: '#FFFFFF',
    bgColor: '#FF2E63',
    strokeColor: '#590016',
    strokeWidth: 5,
    shadowColor: 'rgba(255, 46, 99, 0.6)',
    shadowBlur: 12,
    fontFamily: "'Black Han Sans', sans-serif",
    animStyle: 'bounce'
  },
  {
    name: '네온 바이올렛 펄스',
    color: '#E9D5FF',
    bgColor: 'rgba(59, 7, 100, 0.85)',
    strokeColor: '#581C87',
    strokeWidth: 6,
    shadowColor: 'rgba(168, 85, 247, 0.8)',
    shadowBlur: 16,
    fontFamily: "'Black Han Sans', sans-serif",
    animStyle: 'neon'
  },
  {
    name: '예능 강조 화이트민트',
    color: '#FFFFFF',
    bgColor: 'transparent',
    strokeColor: '#00B4D8',
    strokeWidth: 10,
    shadowColor: 'rgba(0, 0, 0, 0.9)',
    shadowBlur: 10,
    fontFamily: "'Black Han Sans', sans-serif",
    animStyle: 'bounce'
  },
  {
    name: '에메랄드 팩트체크',
    color: '#6EE7B7',
    bgColor: 'rgba(6, 78, 59, 0.88)',
    strokeColor: '#000000',
    strokeWidth: 6,
    shadowColor: 'rgba(16, 185, 129, 0.5)',
    shadowBlur: 10,
    fontFamily: "'Noto Sans KR', sans-serif",
    animStyle: 'slide_up'
  },
  {
    name: '클린 미니멀 브이로그',
    color: '#FFFFFF',
    bgColor: 'rgba(15, 23, 42, 0.65)',
    strokeColor: '#000000',
    strokeWidth: 3,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowBlur: 6,
    fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
    animStyle: 'fade'
  },
  {
    name: '타자기 다큐멘터리',
    color: '#F8FAFC',
    bgColor: 'rgba(0, 0, 0, 0.92)',
    strokeColor: '#000000',
    strokeWidth: 0,
    shadowColor: 'transparent',
    shadowBlur: 0,
    fontFamily: "'JetBrains Mono', 'Noto Sans KR', monospace",
    animStyle: 'typewriter'
  }
];

export const STICKER_PRESETS = [
  '🔥', '🚀', '⚡', '💡', '⚠️', '🎯', '🎬', '💥',
  '⭐', '❤️', '👏', '👀', '💯', '🚨', '📌', '✨',
  '👍', '🔔', '🎁', '🏆', '💎', '🎵', '🎤', '⏳'
];

export const CALLOUT_BADGES = [
  { text: '🔔 구독 & 좋아요', color: '#FFFFFF', bgColor: '#EF4444' },
  { text: '🔊 소리를 켜주세요', color: '#00F2FE', bgColor: 'rgba(15,23,42,0.9)' },
  { text: '✅ 핵심 체크포인트', color: '#10B981', bgColor: 'rgba(6,78,59,0.9)' },
  { text: '🚨 절대 주의!', color: '#FFE600', bgColor: '#991B1B' },
  { text: '🔴 REC LIVE', color: '#FFFFFF', bgColor: '#DC2626' },
  { text: '📌 고정 댓글 확인', color: '#E9D5FF', bgColor: '#581C87' }
];

export const VIDEO_EFFECT_PRESETS = [
  { id: 'neon_glow', name: '✨ 네온 글로우 테두리', desc: '사이버 시안/바이올렛 외곽 광채', color: '#00f2fe' },
  { id: 'rgb_glitch', name: '🌈 RGB 색수차 글리치', desc: '강렬한 비트 스플릿 & 스캔라인', color: '#ec4899' },
  { id: 'vhs_retro', name: '📼 VHS 레트로 필름', desc: '90년대 캠코더 타임코드 & 노이즈', color: '#f59e0b' },
  { id: 'letterbox', name: '🎬 시네마틱 레터박스', desc: '2.35:1 영화관 상하 블랙바', color: '#94a3b8' },
  { id: 'camera_shake', name: '💥 임팩트 카메라 쉐이크', desc: '역동적인 화면 흔들림 연출', color: '#ef4444' },
  { id: 'flash_pulse', name: '⚡ 화이트 플래시 펄스', desc: '비트감 있는 스트로브 조명', color: '#eab308' },
  { id: 'sparkle_rain', name: '🌟 골든 스파클 파티클', desc: '화사하게 흩날리는 빛 입자', color: '#a855f7' },
  { id: 'focus_vignette', name: '🔍 다크 포커스 비네팅', desc: '중앙 피사체 집중 조명 효과', color: '#10b981' }
];

export const TRANSITION_PRESETS = [
  { id: 'none', name: '없음 (직접 컷)', icon: '✂️', duration: 0 },
  { id: 'dissolve', name: '크로스 디졸브 (Dissolve)', icon: '🌫️', duration: 0.6 },
  { id: 'fade_black', name: '페이드 블랙 (Dip to Black)', icon: '🌑', duration: 0.6 },
  { id: 'flash', name: '화이트 플래시 (Flash)', icon: '⚡', duration: 0.4 },
  { id: 'slide_left', name: '왼쪽 슬라이드 (Whip Left)', icon: '⬅️', duration: 0.5 },
  { id: 'slide_right', name: '오른쪽 슬라이드 (Whip Right)', icon: '➡️', duration: 0.5 },
  { id: 'zoom_in', name: '다이내믹 줌 인 (Zoom)', icon: '🔍', duration: 0.5 },
  { id: 'wipe_down', name: '수직 와이프 (Wipe)', icon: '⬇️', duration: 0.5 }
];

export const LUT_FILTER_PRESETS = [
  {
    id: 'original',
    name: 'Original (원본)',
    badge: 'STD',
    gradient: 'linear-gradient(135deg, #334155, #0f172a)',
    filters: { brightness: 100, contrast: 100, saturate: 100, temperature: 0, tint: 0, vignette: 0, blur: 0, grayscale: 0 }
  },
  {
    id: 'teal_orange',
    name: '시네마틱 티얼 & 오렌지',
    badge: 'LUT 01',
    gradient: 'linear-gradient(135deg, #0d9488, #ea580c)',
    filters: { brightness: 104, contrast: 125, saturate: 130, temperature: 12, tint: -8, vignette: 20, blur: 0, grayscale: 0 }
  },
  {
    id: 'cyber_neon',
    name: '사이버펑크 나이트',
    badge: 'LUT 02',
    gradient: 'linear-gradient(135deg, #00f2fe, #9333ea)',
    filters: { brightness: 108, contrast: 140, saturate: 175, temperature: -18, tint: 18, vignette: 25, blur: 0, grayscale: 0 }
  },
  {
    id: 'noir_bw',
    name: '필름 느와르 모노',
    badge: 'B&W',
    gradient: 'linear-gradient(135deg, #71717a, #09090b)',
    filters: { brightness: 102, contrast: 145, saturate: 0, temperature: 0, tint: 0, vignette: 35, blur: 0, grayscale: 100 }
  },
  {
    id: 'kodak_warm',
    name: '빈티지 코닥 골드',
    badge: 'FILM',
    gradient: 'linear-gradient(135deg, #f59e0b, #78350f)',
    filters: { brightness: 106, contrast: 112, saturate: 122, temperature: 25, tint: 5, vignette: 18, blur: 0, grayscale: 0 }
  },
  {
    id: 'arctic_blue',
    name: '아틱 콜드 블루',
    badge: 'COLD',
    gradient: 'linear-gradient(135deg, #38bdf8, #1e3a8a)',
    filters: { brightness: 105, contrast: 118, saturate: 110, temperature: -28, tint: -5, vignette: 12, blur: 0, grayscale: 0 }
  },
  {
    id: 'dreamy_glow',
    name: '소프트 드림 블룸',
    badge: 'SOFT',
    gradient: 'linear-gradient(135deg, #f472b6, #a855f7)',
    filters: { brightness: 114, contrast: 92, saturate: 115, temperature: 8, tint: 12, vignette: 5, blur: 1, grayscale: 0 }
  },
  {
    id: 'high_punch',
    name: '쇼츠 하이 콘트라스트',
    badge: 'HDR',
    gradient: 'linear-gradient(135deg, #ef4444, #eab308)',
    filters: { brightness: 106, contrast: 150, saturate: 155, temperature: 5, tint: 0, vignette: 22, blur: 0, grayscale: 0 }
  }
];

export const BGM_LIBRARY = [
  { id: 'lofi', title: '배경음악_로파이_칠.wav', bpm: '110 BPM', mood: '브이로그 • 감성 엠비언트', duration: 15.0 },
  { id: 'cyber', title: '사이버_신스웨이브_펄스.wav', bpm: '128 BPM', mood: '쇼츠 텐션 • 강렬한 비트', duration: 15.0 },
  { id: 'tension', title: '시네마틱_다크_텐션.wav', bpm: '124 BPM', mood: '미스터리 • 소방/안전 쇼츠', duration: 15.0 },
  { id: 'upbeat', title: '업비트_크리에이터_팝.wav', bpm: '120 BPM', mood: '리뷰/꿀팁 • 밝고 경쾌함', duration: 15.0 }
];

export const SFX_LIBRARY = [
  { type: 'whoosh', label: '💨 휙 (화면 전환)', duration: 0.6 },
  { type: 'pop', label: '🎈 톡 (자막 등장)', duration: 0.4 },
  { type: 'boom', label: '💥 쾅 (시네마틱 임팩트)', duration: 1.0 },
  { type: 'ding', label: '🔔 딩동 (핵심 포인트)', duration: 0.8 },
  { type: 'shutter', label: '📸 찰칵 (카메라 셔터)', duration: 0.4 },
  { type: 'magic', label: '✨ 샤랄라 (매직 차임)', duration: 1.0 },
  { type: 'siren', label: '🚨 위잉 (경보 알람)', duration: 1.2 },
  { type: 'typing', label: '⌨️ 타닥 (키보드 타자)', duration: 0.5 }
];

export const PROCEDURAL_THEMES = [
  { id: 'cyber_grid', name: '도시 네온 드론', meta: '4K 60FPS', color1: '#040b14', color2: '#00F2FE' },
  { id: 'gradient_flow', name: '오로라 웨이브', meta: '4K 60FPS', color1: '#4A00E0', color2: '#ff007f' },
  { id: 'neon_city', name: '미드나잇 펄스', meta: '4K 60FPS', color1: '#1e1b4b', color2: '#8b5cf6' },
  { id: 'fire_amber', name: '골든 엠버 플레임', meta: '1080P 60FPS', color1: '#F12711', color2: '#F5AF19' },
  { id: 'matrix_rain', name: '사이버 매트릭스', meta: '4K 60FPS', color1: '#022c22', color2: '#10b981' },
  { id: 'bokeh_cinema', name: '시네마 보케 라이트', meta: '1080P 30FPS', color1: '#1f1235', color2: '#f472b6' }
];
