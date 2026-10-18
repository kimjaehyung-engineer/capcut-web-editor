import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronsLeft,
  ChevronsRight,
  Volume2,
  VolumeX,
  Maximize2,
  Camera,
  Repeat,
  Bookmark
} from 'lucide-react';
import { renderFrame } from '../utils/videoRenderer';

export default function PreviewPlayer({
  currentTime,
  setCurrentTime,
  duration,
  isPlaying,
  setIsPlaying,
  isLooping,
  setIsLooping,
  isMasterMuted,
  setIsMasterMuted,
  videoClips,
  pipClips,
  effectClips,
  textClips,
  trackVisibility,
  aspectRatio,
  showSafeZone,
  showGrid,
  selectedClipId,
  selectedTrackType,
  onSelectClip,
  onUpdateClip,
  onAddMarker
}) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [inlineEditText, setInlineEditText] = useState(null);

  // Render canvas whenever state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    renderFrame({
      ctx,
      width,
      height,
      currentTime,
      videoClips,
      pipClips,
      effectClips,
      textClips,
      trackVisibility,
      showSafeZone,
      showGrid,
      aspectRatio
    });
  }, [
    currentTime,
    videoClips,
    pipClips,
    effectClips,
    textClips,
    trackVisibility,
    showSafeZone,
    showGrid,
    aspectRatio
  ]);

  // Format seconds to SMPTE MM:SS:FF (30fps)
  const formatSMPTE = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const f = Math.floor((secs % 1) * 30);
    return `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f
      .toString()
      .padStart(2, '0')}`;
  };

  // Canvas logical resolution based on aspect ratio
  const canvasDimensions =
    aspectRatio === '9:16'
      ? { width: 540, height: 960, label: '1080×1920 60fps' }
      : aspectRatio === '1:1'
      ? { width: 720, height: 720, label: '1080×1080 60fps' }
      : aspectRatio === '4:5'
      ? { width: 640, height: 800, label: '1080×1350 60fps' }
      : { width: 960, height: 540, label: '1920×1080 60fps' };

  // Find active text or PIP at currentTime for interactive bounding box
  const activeText = textClips.find(
    (c) =>
      (c.id === selectedClipId && selectedTrackType === 'text') ||
      (currentTime >= c.start && currentTime < c.start + c.duration)
  );

  const activePip = pipClips.find(
    (c) =>
      (c.id === selectedClipId && selectedTrackType === 'pip') ||
      (currentTime >= c.start && currentTime < c.start + c.duration)
  );

  // Handle direct drag repositioning on canvas
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Prioritize selected PIP if PIP is selected, else active Text
    if (selectedTrackType === 'pip' && activePip) {
      const startX = e.clientX;
      const startY = e.clientY;
      const initX = activePip.x ?? 24;
      const initY = activePip.y ?? -24;

      const onMove = (moveEvt) => {
        const dx = ((moveEvt.clientX - startX) / rect.width) * 100;
        const dy = ((moveEvt.clientY - startY) / rect.height) * 100;
        onUpdateClip(activePip.id, 'pip', {
          x: Math.round(initX + dx),
          y: Math.round(initY + dy)
        });
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return;
    }

    const targetText = textClips.find(
      (c) => currentTime >= c.start && currentTime < c.start + c.duration
    );

    if (targetText) {
      onSelectClip(targetText.id, 'text');
      onUpdateClip(targetText.id, 'text', {
        x: Math.round(clickX),
        y: Math.round(clickY)
      });

      const onMouseMove = (moveEvt) => {
        const curX = Math.max(8, Math.min(92, ((moveEvt.clientX - rect.left) / rect.width) * 100));
        const curY = Math.max(8, Math.min(92, ((moveEvt.clientY - rect.top) / rect.height) * 100));
        onUpdateClip(targetText.id, 'text', {
          x: Math.round(curX),
          y: Math.round(curY)
        });
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  // Double-click canvas to inline edit active subtitle
  const handleCanvasDoubleClick = () => {
    const targetText = textClips.find(
      (c) => currentTime >= c.start && currentTime < c.start + c.duration
    );
    if (targetText) {
      onSelectClip(targetText.id, 'text');
      setInlineEditText({ id: targetText.id, text: targetText.text });
    }
  };

  // Snapshot download as PNG
  const handleCaptureSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `CutPro_Snapshot_${currentTime.toFixed(2)}s.png`;
    a.click();
  };

  // Fullscreen toggle
  const handleFullscreen = () => {
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <main className="preview-player-container" ref={stageRef}>
      {/* Top Canvas Monitor Header Bar (Stitch style) */}
      <div className="monitor-top-bar">
        <div className="monitor-top-left">
          <span className="monitor-title">미리보기 ({aspectRatio})</span>
          <span className="monitor-spec-badge">{canvasDimensions.label}</span>
        </div>

        <div className="monitor-top-right">
          <button
            className="monitor-icon-btn"
            onClick={handleCaptureSnapshot}
            title="현재 화면 PNG 스냅샷 캡처"
          >
            <Camera size={13} />
            <span>캡처</span>
          </button>

          <select
            className="monitor-zoom-select"
            value={canvasZoom}
            onChange={(e) => setCanvasZoom(Number(e.target.value))}
            title="미리보기 화면 배율"
          >
            <option value={85}>85%</option>
            <option value={100}>100% (맞춤)</option>
            <option value={115}>115%</option>
          </select>
        </div>
      </div>

      {/* Visual Canvas Monitor Stage */}
      <div className="canvas-wrapper">
        <div
          className={`canvas-viewport-frame ratio-${aspectRatio.replace(':', '-')}`}
          style={{ transform: `scale(${canvasZoom / 100})` }}
        >
          <canvas
            ref={canvasRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            className="render-canvas"
            onMouseDown={handleCanvasMouseDown}
            onDoubleClick={handleCanvasDoubleClick}
            title="클릭 후 드래그하여 자막/PIP 이동 • 더블클릭하여 자막 바로 수정"
          />

          {/* Interactive Stitch Cyan Bounding Box Overlay */}
          {activeText && currentTime >= activeText.start && currentTime < activeText.start + activeText.duration && (
            <div
              className="canvas-bounding-box"
              style={{
                left: `${activeText.x ?? 50}%`,
                top: `${activeText.y ?? 76}%`
              }}
            >
              <div className="bbox-handle tl" />
              <div className="bbox-handle tr" />
              <div className="bbox-handle bl" />
              <div className="bbox-handle br" />
              <div className="bbox-rot-handle" />
            </div>
          )}

          {/* Inline Subtitle Quick Editor Overlay */}
          {inlineEditText && (
            <div className="inline-text-editor-overlay" onClick={() => setInlineEditText(null)}>
              <div className="inline-editor-card" onClick={(e) => e.stopPropagation()}>
                <span>자막 빠른 편집</span>
                <input
                  type="text"
                  autoFocus
                  value={inlineEditText.text}
                  onChange={(e) => {
                    setInlineEditText({ ...inlineEditText, text: e.target.value });
                    onUpdateClip(inlineEditText.id, 'text', { text: e.target.value });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                      setInlineEditText(null);
                    }
                  }}
                />
                <button onClick={() => setInlineEditText(null)}>완료</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Transport Control Bar (Stitch style) */}
      <div className="player-controls-bar">
        <div className="controls-left">
          <span className="timecode-display">
            <span className="time-current">{formatSMPTE(currentTime)}</span>
            <span className="time-sep">/</span>
            <span className="time-total">{formatSMPTE(duration)}</span>
          </span>
        </div>

        <div className="controls-center">
          <button
            className="ctrl-btn"
            onClick={() => {
              setCurrentTime(0);
              setIsPlaying(false);
            }}
            title="처음으로 이동 (Home)"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            className="ctrl-btn"
            onClick={() => setCurrentTime(Math.max(0, Math.round((currentTime - 0.1) * 100) / 100))}
            title="1프레임 뒤로 (←)"
          >
            <SkipBack size={15} />
          </button>

          <button
            className="play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title="재생 / 일시정지 (Space)"
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            className="ctrl-btn"
            onClick={() =>
              setCurrentTime(Math.min(duration, Math.round((currentTime + 0.1) * 100) / 100))
            }
            title="1프레임 앞으로 (→)"
          >
            <SkipForward size={15} />
          </button>

          <button
            className="ctrl-btn"
            onClick={() => {
              setCurrentTime(duration);
              setIsPlaying(false);
            }}
            title="마지막으로 이동 (End)"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        <div className="controls-right">
          <button
            className={`ctrl-btn ${isLooping ? 'active-cyan' : ''}`}
            onClick={() => setIsLooping(!isLooping)}
            title="구간 반복 재생 (Loop)"
          >
            <Repeat size={14} />
          </button>

          <button
            className={`ctrl-btn ${isMasterMuted ? 'active-danger' : ''}`}
            onClick={() => setIsMasterMuted(!isMasterMuted)}
            title="마스터 오디오 음소거"
          >
            {isMasterMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            className="ctrl-btn"
            onClick={onAddMarker}
            title="현재 위치에 타임라인 마커 추가 (M)"
          >
            <Bookmark size={14} />
          </button>

          <button
            className="ctrl-btn"
            onClick={handleFullscreen}
            title="미리보기 전체화면"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </main>
  );
}
