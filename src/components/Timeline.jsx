import React, { useRef, useState } from 'react';
import {
  Scissors,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Type,
  Film,
  Music,
  Wand2,
  Layers,
  MousePointer,
  Snowflake,
  FlipHorizontal,
  Magnet,
  Grid,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shuffle,
  Bookmark
} from 'lucide-react';

export default function Timeline({
  currentTime,
  setCurrentTime,
  duration,
  videoClips,
  pipClips,
  effectClips,
  textClips,
  audioClips,
  markers = [],
  trackVisibility,
  onToggleTrackVisibility,
  selectedClipId,
  setSelectedClipId,
  selectedTrackType,
  setSelectedTrackType,
  onUpdateClip,
  onDeleteClip,
  onSplitClip,
  onDuplicateClip,
  onFreezeClip,
  onMirrorClip,
  isMagnetic,
  setIsMagnetic
}) {
  const [zoom, setZoom] = useState(52); // pixels per second
  const [toolMode, setToolMode] = useState('select'); // 'select' | 'blade'
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [lockedTracks, setLockedTracks] = useState({});
  const timelineTracksRef = useRef(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const toggleLock = (trackKey) => {
    setLockedTracks((prev) => ({ ...prev, [trackKey]: !prev[trackKey] }));
  };

  // Ruler tick marks (every 1 second)
  const totalSeconds = Math.max(duration + 4, 20);
  const rulerTicks = [];
  for (let s = 0; s <= totalSeconds; s++) {
    rulerTicks.push(s);
  }

  const formatSMPTE = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const f = Math.floor((secs % 1) * 30);
    return `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f
      .toString()
      .padStart(2, '0')}`;
  };

  // Handle click / drag on timeline ruler to seek
  const handleRulerMouseDown = (e) => {
    const container = timelineTracksRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left + container.scrollLeft;
    const newTime = Math.max(0, Math.min(duration, clickX / zoom));
    setCurrentTime(newTime);
    setIsScrubbing(true);

    const onMouseMove = (moveEvt) => {
      const moveX = moveEvt.clientX - rect.left + container.scrollLeft;
      const t = Math.max(0, Math.min(duration, moveX / zoom));
      setCurrentTime(t);
    };

    const onMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Drag Clip (move horizontal timing) or Blade Split if in 'blade' mode
  const handleClipMouseDown = (e, clip, trackType) => {
    e.stopPropagation();
    if (lockedTracks[trackType]) return;

    // If blade tool is active, split clip at click position!
    if (toolMode === 'blade') {
      const container = timelineTracksRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const clickTime = (e.clientX - rect.left + container.scrollLeft) / zoom;
        setCurrentTime(clickTime);
        setSelectedClipId(clip.id);
        setSelectedTrackType(trackType);
        setTimeout(() => onSplitClip(clip.id, clickTime), 10);
      }
      return;
    }

    setSelectedClipId(clip.id);
    setSelectedTrackType(trackType);

    const startX = e.clientX;
    const initialStart = clip.start;

    const onMouseMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - startX;
      const deltaTime = deltaX / zoom;
      let newStart = Math.max(0, initialStart + deltaTime);

      // Snap to playhead or integer second if snapEnabled
      if (snapEnabled) {
        if (Math.abs(newStart - currentTime) < 0.18) {
          newStart = currentTime;
        } else if (Math.abs(newStart - Math.round(newStart)) < 0.1) {
          newStart = Math.round(newStart);
        }
      }

      onUpdateClip(clip.id, trackType, { start: Math.round(newStart * 10) / 10 });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Trim Left Handle
  const handleTrimLeft = (e, clip, trackType) => {
    e.stopPropagation();
    if (lockedTracks[trackType]) return;
    const startX = e.clientX;
    const initialStart = clip.start;
    const initialDuration = clip.duration;

    const onMouseMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - startX;
      const deltaTime = deltaX / zoom;
      const newStart = Math.max(0, initialStart + deltaTime);
      const newDuration = Math.max(0.4, initialDuration - deltaTime);
      if (newDuration > 0.4) {
        onUpdateClip(clip.id, trackType, {
          start: Math.round(newStart * 10) / 10,
          duration: Math.round(newDuration * 10) / 10
        });
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Trim Right Handle
  const handleTrimRight = (e, clip, trackType) => {
    e.stopPropagation();
    if (lockedTracks[trackType]) return;
    const startX = e.clientX;
    const initialDuration = clip.duration;

    const onMouseMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - startX;
      const deltaTime = deltaX / zoom;
      const newDuration = Math.max(0.4, initialDuration + deltaTime);
      onUpdateClip(clip.id, trackType, { duration: Math.round(newDuration * 10) / 10 });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const playheadPositionPx = currentTime * zoom;

  return (
    <footer className="timeline-container">
      {/* 1. Stitch CapCut Pro Timeline Toolbar */}
      <div className="timeline-toolbar">
        <div className="toolbar-left">
          {/* Tool Mode Switcher: Select vs Blade */}
          <div className="tool-mode-group">
            <button
              className={`tl-icon-btn ${toolMode === 'select' ? 'active' : ''}`}
              onClick={() => setToolMode('select')}
              title="선택 및 이동 툴 (V)"
            >
              <MousePointer size={14} />
            </button>
            <button
              className={`tl-icon-btn ${toolMode === 'blade' ? 'active' : ''}`}
              onClick={() => setToolMode('blade')}
              title="블레이드 컷 분할 툴 (B) - 클립 클릭 시 즉시 자르기"
            >
              <Scissors size={14} />
            </button>
          </div>

          <div className="tl-divider" />

          {/* Clip Edit Actions */}
          <button
            className={`tl-action-btn ${!selectedClipId ? 'disabled' : ''}`}
            onClick={() => onSplitClip(selectedClipId)}
            disabled={!selectedClipId}
            title="현재 재생헤드에서 분할 (Ctrl+B)"
          >
            <Scissors size={13} />
            <span>분할</span>
          </button>

          <button
            className={`tl-action-btn ${!selectedClipId ? 'disabled' : ''}`}
            onClick={() => onDuplicateClip(selectedClipId, selectedTrackType)}
            disabled={!selectedClipId}
            title="클립 복제 (Ctrl+D)"
          >
            <Copy size={13} />
            <span>복제</span>
          </button>

          <button
            className={`tl-action-btn ${!selectedClipId ? 'disabled' : ''}`}
            onClick={() => onFreezeClip(selectedClipId, selectedTrackType)}
            disabled={!selectedClipId}
            title="프리즈 (정지 화면 2초 삽입)"
          >
            <Snowflake size={13} />
            <span>프리즈</span>
          </button>

          <button
            className={`tl-action-btn ${!selectedClipId ? 'disabled' : ''}`}
            onClick={() => onMirrorClip(selectedClipId, selectedTrackType)}
            disabled={!selectedClipId}
            title="좌우 반전 (Mirror)"
          >
            <FlipHorizontal size={13} />
            <span>반전</span>
          </button>

          <button
            className={`tl-action-btn danger ${!selectedClipId ? 'disabled' : ''}`}
            onClick={() => onDeleteClip(selectedClipId, selectedTrackType)}
            disabled={!selectedClipId}
            title="선택 클립 삭제 (Delete)"
          >
            <Trash2 size={13} />
            <span>삭제</span>
          </button>

          <div className="tl-divider" />

          {/* Magnetic & Snap Toggles */}
          <button
            className={`tl-toggle-pill ${isMagnetic ? 'active' : ''}`}
            onClick={() => setIsMagnetic(!isMagnetic)}
            title="자석 트랙 자동 정렬 (빈틈 제거)"
          >
            <Magnet size={13} />
            <span>자석</span>
          </button>

          <button
            className={`tl-toggle-pill ${snapEnabled ? 'active' : ''}`}
            onClick={() => setSnapEnabled(!snapEnabled)}
            title="재생헤드 및 클립 스냅 정렬"
          >
            <Grid size={13} />
            <span>스냅</span>
          </button>
        </div>

        {/* Center Timecode Readout (Stitch style) */}
        <div className="toolbar-center-timecode">
          <span className="tc-muted">00:00:00:00</span>
          <span className="tc-active">{formatSMPTE(currentTime)}</span>
          <span className="tc-muted">{formatSMPTE(duration)}</span>
        </div>

        {/* Right Zoom Controls */}
        <div className="toolbar-right">
          <div className="zoom-controls">
            <button
              className="zoom-btn"
              onClick={() => setZoom(Math.max(24, zoom - 8))}
              title="타임라인 축소"
            >
              <ZoomOut size={14} />
            </button>
            <input
              type="range"
              min="24"
              max="110"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              title="타임라인 줌 배율"
            />
            <button
              className="zoom-btn"
              onClick={() => setZoom(Math.min(110, zoom + 8))}
              title="타임라인 확대"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Multi-Track Workspace */}
      <div className="timeline-workspace">
        {/* Left Track Headers with Visibility & Lock Controls */}
        <div className="track-headers">
          <div className="track-header-cell ruler-spacer">
            <span>TRACKS</span>
          </div>

          {[
            { key: 'effects', label: 'EFFECTS', icon: Wand2, color: '#a855f7' },
            { key: 'text', label: 'SUBTITLES', icon: Type, color: '#00f2fe' },
            { key: 'pip', label: 'PIP VIDEO', icon: Layers, color: '#8b5cf6' },
            { key: 'video', label: 'MAIN VIDEO', icon: Film, color: '#00f2fe' },
            { key: 'audio', label: 'AUDIO', icon: Music, color: '#10b981' }
          ].map((tr) => {
            const IconComp = tr.icon;
            const isHidden = trackVisibility[tr.key] === false;
            const isLocked = Boolean(lockedTracks[tr.key]);
            return (
              <div key={tr.key} className="track-header-cell">
                <div className="track-hdr-left">
                  <IconComp size={12} style={{ color: tr.color }} />
                  <span className="track-hdr-name">{tr.label}</span>
                </div>
                <div className="track-hdr-btns">
                  {tr.key !== 'audio' && (
                    <button
                      className={`hdr-Ctrl ${isHidden ? 'off' : ''}`}
                      onClick={() => onToggleTrackVisibility(tr.key)}
                      title="트랙 표시/숨기기"
                    >
                      {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                  )}
                  <button
                    className={`hdr-Ctrl ${isLocked ? 'locked' : ''}`}
                    onClick={() => toggleLock(tr.key)}
                    title="트랙 잠금"
                  >
                    {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable Tracks Canvas */}
        <div
          className={`timeline-tracks-scroll ${toolMode === 'blade' ? 'cursor-blade' : ''}`}
          ref={timelineTracksRef}
        >
          <div
            className="timeline-tracks-content"
            style={{ width: `${totalSeconds * zoom}px` }}
          >
            {/* Time Ruler with Markers */}
            <div className="timeline-ruler" onMouseDown={handleRulerMouseDown}>
              {rulerTicks.map((sec) => (
                <div
                  key={sec}
                  className="ruler-tick"
                  style={{ left: `${sec * zoom}px` }}
                >
                  <span className="tick-label">00:{sec.toString().padStart(2, '0')}</span>
                  <div className="tick-line" />
                </div>
              ))}

              {/* User Markers */}
              {markers.map((m) => (
                <div
                  key={m.id}
                  className="timeline-marker-pin"
                  style={{ left: `${m.time * zoom}px` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentTime(m.time);
                  }}
                  title={`마커: ${m.label} (${m.time.toFixed(1)}s)`}
                >
                  <Bookmark size={11} />
                </div>
              ))}
            </div>

            {/* Glowing Cyan Playhead Scrubber Line */}
            <div
              className={`timeline-playhead ${isScrubbing ? 'scrubbing' : ''}`}
              style={{ left: `${playheadPositionPx}px` }}
            >
              <div className="playhead-handle" onMouseDown={handleRulerMouseDown}>
                <div className="playhead-diamond" />
              </div>
              <div className="playhead-line" />
            </div>

            {/* TRACK 1: EFFECTS (FX) */}
            <div className="timeline-track track-fx-lane">
              {effectClips.map((clip) => {
                const left = clip.start * zoom;
                const width = Math.max(32, clip.duration * zoom);
                const isSelected = selectedClipId === clip.id;

                return (
                  <div
                    key={clip.id}
                    className={`timeline-clip clip-fx ${isSelected ? 'selected' : ''}`}
                    style={{ left: `${left}px`, width: `${width}px` }}
                    onMouseDown={(e) => handleClipMouseDown(e, clip, 'effects')}
                  >
                    <div className="clip-top-band band-purple" />
                    <div
                      className="trim-handle trim-left"
                      onMouseDown={(e) => handleTrimLeft(e, clip, 'effects')}
                    />
                    <div className="clip-content-inner">
                      <span className="clip-title-label">{clip.title}</span>
                    </div>
                    <div
                      className="trim-handle trim-right"
                      onMouseDown={(e) => handleTrimRight(e, clip, 'effects')}
                    />
                  </div>
                );
              })}
            </div>

            {/* TRACK 2: SUBTITLES / TEXT */}
            <div className="timeline-track track-text-lane">
              {textClips.map((clip) => {
                const left = clip.start * zoom;
                const width = Math.max(32, clip.duration * zoom);
                const isSelected = selectedClipId === clip.id;

                return (
                  <div
                    key={clip.id}
                    className={`timeline-clip clip-text ${isSelected ? 'selected' : ''}`}
                    style={{ left: `${left}px`, width: `${width}px` }}
                    onMouseDown={(e) => handleClipMouseDown(e, clip, 'text')}
                  >
                    <div className="clip-top-band band-cyan" />
                    <div
                      className="trim-handle trim-left"
                      onMouseDown={(e) => handleTrimLeft(e, clip, 'text')}
                    />
                    <div className="clip-content-inner">
                      <span className="clip-text-preview">{clip.text}</span>
                    </div>
                    <div
                      className="trim-handle trim-right"
                      onMouseDown={(e) => handleTrimRight(e, clip, 'text')}
                    />
                  </div>
                );
              })}
            </div>

            {/* TRACK 3: PIP OVERLAY VIDEO */}
            <div className="timeline-track track-pip-lane">
              {pipClips.map((clip) => {
                const left = clip.start * zoom;
                const width = Math.max(32, clip.duration * zoom);
                const isSelected = selectedClipId === clip.id;

                return (
                  <div
                    key={clip.id}
                    className={`timeline-clip clip-pip ${isSelected ? 'selected' : ''}`}
                    style={{ left: `${left}px`, width: `${width}px` }}
                    onMouseDown={(e) => handleClipMouseDown(e, clip, 'pip')}
                  >
                    <div className="clip-top-band band-violet" />
                    <div
                      className="trim-handle trim-left"
                      onMouseDown={(e) => handleTrimLeft(e, clip, 'pip')}
                    />
                    <div className="clip-content-inner">
                      <Layers size={12} className="clip-icon" />
                      <span className="clip-title-label">{clip.title}</span>
                    </div>
                    <div
                      className="trim-handle trim-right"
                      onMouseDown={(e) => handleTrimRight(e, clip, 'pip')}
                    />
                  </div>
                );
              })}
            </div>

            {/* TRACK 4: MAIN VIDEO WITH TRANSITION BADGES */}
            <div className="timeline-track track-video-lane">
              {videoClips.map((clip) => {
                const left = clip.start * zoom;
                const width = Math.max(36, clip.duration * zoom);
                const isSelected = selectedClipId === clip.id;

                return (
                  <div
                    key={clip.id}
                    className={`timeline-clip clip-video ${isSelected ? 'selected' : ''}`}
                    style={{ left: `${left}px`, width: `${width}px` }}
                    onMouseDown={(e) => handleClipMouseDown(e, clip, 'video')}
                  >
                    <div className="clip-top-band band-cyan" />
                    <div
                      className="trim-handle trim-left"
                      onMouseDown={(e) => handleTrimLeft(e, clip, 'video')}
                    />
                    <div className="clip-content-inner">
                      <Film size={12} className="clip-icon" />
                      <span className="clip-title-label">{clip.title}</span>
                      {clip.speed && clip.speed !== 1 && (
                        <span className="clip-speed-badge">{clip.speed}x</span>
                      )}
                      <span className="clip-duration-tag">{clip.duration.toFixed(1)}s</span>
                    </div>

                    {/* Transition Node Indicator on Right Edge (Stitch Design) */}
                    {clip.transition && clip.transition !== 'none' && (
                      <div
                        className="clip-transition-badge"
                        title={`전환 효과: ${clip.transition}`}
                      >
                        <Shuffle size={10} />
                      </div>
                    )}

                    <div
                      className="trim-handle trim-right"
                      onMouseDown={(e) => handleTrimRight(e, clip, 'video')}
                    />
                  </div>
                );
              })}
            </div>

            {/* TRACK 5: AUDIO WITH EMERALD WAVEFORMS (Stitch Design) */}
            <div className="timeline-track track-audio-lane">
              {audioClips.map((clip) => {
                const left = clip.start * zoom;
                const width = Math.max(32, clip.duration * zoom);
                const isSelected = selectedClipId === clip.id;
                const barCount = Math.max(8, Math.min(80, Math.floor(width / 7)));

                return (
                  <div
                    key={clip.id}
                    className={`timeline-clip clip-audio ${isSelected ? 'selected' : ''}`}
                    style={{ left: `${left}px`, width: `${width}px` }}
                    onMouseDown={(e) => handleClipMouseDown(e, clip, 'audio')}
                  >
                    <div className="clip-top-band band-emerald" />
                    <div
                      className="trim-handle trim-left"
                      onMouseDown={(e) => handleTrimLeft(e, clip, 'audio')}
                    />

                    {/* Simulated Waveform Vector Bars */}
                    <div className="waveform-bars">
                      {Array.from({ length: barCount }).map((_, idx) => {
                        const h = 25 + ((idx * 37 + clip.id.length * 13) % 65);
                        return (
                          <div
                            key={idx}
                            className="wave-bar"
                            style={{ height: `${h}%` }}
                          />
                        );
                      })}
                    </div>

                    <div className="clip-content-inner audio-overlay-label">
                      <Music size={11} className="clip-icon" />
                      <span className="clip-audio-title">{clip.title}</span>
                    </div>

                    <div
                      className="trim-handle trim-right"
                      onMouseDown={(e) => handleTrimRight(e, clip, 'audio')}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
