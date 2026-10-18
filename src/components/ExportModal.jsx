import React, { useEffect, useState } from 'react';
import { Sparkles, Download, CheckCircle2, X, Film, Settings2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExportModal({
  isOpen,
  onClose,
  progress,
  isFinished,
  isRendering,
  onStartRender,
  projectName,
  aspectRatio,
  duration
}) {
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState(30);

  useEffect(() => {
    if (isFinished) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    }
  }, [isFinished]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="export-modal">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Sparkles className="sparkle-icon" size={18} />
            <h3>동영상 내보내기 (CapCut Pro Export)</h3>
          </div>
          {!isRendering && (
            <button className="close-btn" onClick={onClose}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="modal-content">
          {!isRendering && !isFinished && (
            <div className="export-config-view">
              <div className="export-summary-row">
                <div className="export-summary-item">
                  <span className="summary-label">프로젝트명</span>
                  <span className="summary-val">{projectName}</span>
                </div>
                <div className="export-summary-item">
                  <span className="summary-label">화면 비율</span>
                  <span className="summary-val">{aspectRatio}</span>
                </div>
                <div className="export-summary-item">
                  <span className="summary-label">총 길이</span>
                  <span className="summary-val">{duration.toFixed(1)}초</span>
                </div>
              </div>

              <div className="export-setting-group">
                <label>해상도 (Resolution)</label>
                <div className="segmented-control">
                  {['720p', '1080p'].map((res) => (
                    <button
                      key={res}
                      className={`seg-btn ${resolution === res ? 'active' : ''}`}
                      onClick={() => setResolution(res)}
                    >
                      {res === '1080p' ? '1080P FHD (고화질)' : '720P HD (고속 렌더링)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="export-setting-group">
                <label>프레임 레이트 (Frame Rate)</label>
                <div className="segmented-control">
                  {[30, 60].map((f) => (
                    <button
                      key={f}
                      className={`seg-btn ${fps === f ? 'active' : ''}`}
                      onClick={() => setFps(f)}
                    >
                      {f} FPS {f === 60 ? '(부드러운 모션)' : '(표준)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="export-setting-group">
                <label>코덱 & 포맷</label>
                <div className="codec-info-box">
                  <Film size={14} />
                  <span>WebM VP9 고화질 마스터링 (비디오 + PIP + FX 효과 + 자막/스티커 합성)</span>
                </div>
              </div>

              <button
                className="export-cta-btn full-width-cta"
                onClick={() => onStartRender({ resolution, fps })}
              >
                <Download size={16} />
                <span>지금 렌더링 및 다운로드 시작</span>
              </button>
            </div>
          )}

          {isRendering && !isFinished && (
            <div className="rendering-status">
              <div className="spinner-glow" />
              <h4>브라우저 멀티트랙 실시간 인코딩 중...</h4>
              <p className="status-desc">
                비디오, PIP 오버레이, FX 효과, 색보정 LUT, 자막 애니메이션을 합성하고 있습니다.
              </p>

              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="progress-text">{progress}% 완료 ({resolution} • {fps}fps)</div>
            </div>
          )}

          {isFinished && (
            <div className="finished-status">
              <CheckCircle2 size={48} className="success-icon" />
              <h4>렌더링 완료! 동영상이 다운로드되었습니다.</h4>
              <p className="status-desc">
                PC 다운로드 폴더에 <strong>{projectName}</strong> ({resolution} {fps}fps) 영상이 저장되었습니다.
              </p>
              <button className="export-cta-btn full-width-cta" onClick={onClose}>
                편집기로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
