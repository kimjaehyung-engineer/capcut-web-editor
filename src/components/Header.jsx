import React, { useState } from 'react';
import {
  Film,
  Download,
  FileText,
  Save,
  FolderOpen,
  Smartphone,
  Tv,
  Square,
  ShieldCheck,
  Undo2,
  Redo2,
  Grid,
  Keyboard,
  CheckCircle2,
  Sliders,
  Music,
  Type,
  Wand2
} from 'lucide-react';

export default function Header({
  projectName,
  setProjectName,
  aspectRatio,
  setAspectRatio,
  showSafeZone,
  setShowSafeZone,
  showGrid,
  setShowGrid,
  activeWorkspace,
  onSelectWorkspace,
  onExportVideo,
  onExportSRT,
  onSaveProject,
  onLoadProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const workspaces = [
    { id: 'media', label: 'Media', ko: '미디어', icon: Film },
    { id: 'text', label: 'Text & AI', ko: '자막/AI', icon: Type },
    { id: 'effects', label: 'Effects', ko: '효과/전환', icon: Wand2 },
    { id: 'color', label: 'Color', ko: '색보정', icon: Sliders },
    { id: 'audio', label: 'Audio', ko: '오디오', icon: Music }
  ];

  return (
    <>
      <header className="header-bar">
        {/* Left: Brand, Project Name, Undo/Redo */}
        <div className="header-left">
          <div className="logo-badge">
            <div className="logo-icon-box">
              <Film size={16} />
            </div>
            <span className="logo-text">
              CutPro <span className="logo-sub">Studio</span>
            </span>
            <span className="version-pill">PRO</span>
          </div>

          <div className="project-title-wrap">
            <input
              type="text"
              className="project-title-input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="프로젝트 제목"
            />
            <span className="autosave-badge" title="실시간 로컬 상태 동기화됨">
              <CheckCircle2 size={11} />
              <span>자동저장</span>
            </span>
          </div>

          <div className="header-divider" />

          <div className="history-buttons">
            <button
              className={`icon-btn ${!canUndo ? 'disabled' : ''}`}
              onClick={onUndo}
              disabled={!canUndo}
              title="실행 취소 (Ctrl+Z)"
            >
              <Undo2 size={15} />
            </button>
            <button
              className={`icon-btn ${!canRedo ? 'disabled' : ''}`}
              onClick={onRedo}
              disabled={!canRedo}
              title="다시 실행 (Ctrl+Y)"
            >
              <Redo2 size={15} />
            </button>
          </div>
        </div>

        {/* Center: Stitch Workspace Navigation + Ratio & Canvas Guides */}
        <div className="header-center">
          <nav className="workspace-nav">
            {workspaces.map((ws) => {
              const IconComp = ws.icon;
              return (
                <button
                  key={ws.id}
                  className={`ws-nav-btn ${activeWorkspace === ws.id ? 'active' : ''}`}
                  onClick={() => onSelectWorkspace(ws.id)}
                >
                  <IconComp size={13} />
                  <span>{ws.ko}</span>
                </button>
              );
            })}
          </nav>

          <div className="header-divider" />

          <div className="ratio-selector">
            <button
              className={`ratio-btn ${aspectRatio === '9:16' ? 'active' : ''}`}
              onClick={() => setAspectRatio('9:16')}
              title="9:16 (유튜브 쇼츠 / 틱톡 / 릴스)"
            >
              <Smartphone size={13} />
              <span>9:16</span>
            </button>
            <button
              className={`ratio-btn ${aspectRatio === '16:9' ? 'active' : ''}`}
              onClick={() => setAspectRatio('16:9')}
              title="16:9 (유튜브 가로 영상)"
            >
              <Tv size={13} />
              <span>16:9</span>
            </button>
            <button
              className={`ratio-btn ${aspectRatio === '1:1' ? 'active' : ''}`}
              onClick={() => setAspectRatio('1:1')}
              title="1:1 (정방형 피드)"
            >
              <Square size={13} />
              <span>1:1</span>
            </button>
            <button
              className={`ratio-btn ${aspectRatio === '4:5' ? 'active' : ''}`}
              onClick={() => setAspectRatio('4:5')}
              title="4:5 (인스타그램 세로)"
            >
              <Smartphone size={13} />
              <span>4:5</span>
            </button>
          </div>

          {aspectRatio === '9:16' && (
            <button
              className={`guide-toggle-btn ${showSafeZone ? 'active' : ''}`}
              onClick={() => setShowSafeZone(!showSafeZone)}
              title="쇼츠/틱톡 UI 가림 방지 세이프존 가이드"
            >
              <ShieldCheck size={14} />
              <span>세이프존</span>
            </button>
          )}

          <button
            className={`guide-toggle-btn ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="3분할 구도 격자 표시"
          >
            <Grid size={14} />
            <span>격자</span>
          </button>
        </div>

        {/* Right: Actions & Export */}
        <div className="header-right">
          <button
            className="tool-btn"
            onClick={() => setShowShortcutsModal(true)}
            title="캡컷 단축키 안내"
          >
            <Keyboard size={14} />
            <span>단축키</span>
          </button>

          <button className="tool-btn" onClick={onSaveProject} title="프로젝트 JSON 파일 저장">
            <Save size={14} />
            <span>저장</span>
          </button>

          <label className="tool-btn file-upload-label" title="저장된 프로젝트 JSON 불러오기">
            <FolderOpen size={14} />
            <span>열기</span>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={onLoadProject}
            />
          </label>

          <button
            className="tool-btn srt-btn"
            onClick={onExportSRT}
            title="CapCut 호환 SRT 자막 내보내기"
          >
            <FileText size={14} />
            <span>SRT 내보내기</span>
          </button>

          <button className="export-cta-btn" onClick={onExportVideo}>
            <Download size={14} />
            <span>동영상 내보내기</span>
          </button>
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="modal-backdrop" onClick={() => setShowShortcutsModal(false)}>
          <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h3>⌨️ CapCut Pro 단축키 가이드</h3>
              <button className="close-btn" onClick={() => setShowShortcutsModal(false)}>✕</button>
            </div>
            <div className="shortcuts-grid">
              <div className="shortcut-item"><kbd>Space</kbd><span>재생 / 일시정지</span></div>
              <div className="shortcut-item"><kbd>Ctrl + B</kbd><span>재생헤드 위치에서 분할(Split)</span></div>
              <div className="shortcut-item"><kbd>Delete / Backspace</kbd><span>선택 클립 삭제</span></div>
              <div className="shortcut-item"><kbd>Ctrl + D</kbd><span>선택 클립 복제</span></div>
              <div className="shortcut-item"><kbd>Ctrl + Z</kbd><span>실행 취소 (Undo)</span></div>
              <div className="shortcut-item"><kbd>Ctrl + Y</kbd><span>다시 실행 (Redo)</span></div>
              <div className="shortcut-item"><kbd>B</kbd><span>블레이드(자르기) 도구 전환</span></div>
              <div className="shortcut-item"><kbd>V</kbd><span>선택(화살표) 도구 전환</span></div>
              <div className="shortcut-item"><kbd>M</kbd><span>현재 시간에 마커 추가</span></div>
              <div className="shortcut-item"><kbd>← / →</kbd><span>프레임 단위 이동</span></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
