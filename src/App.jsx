import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PreviewPlayer from './components/PreviewPlayer';
import Inspector from './components/Inspector';
import Timeline from './components/Timeline';
import ExportModal from './components/ExportModal';

import {
  INITIAL_VIDEO_CLIPS,
  INITIAL_PIP_CLIPS,
  INITIAL_EFFECT_CLIPS,
  INITIAL_TEXT_CLIPS,
  INITIAL_AUDIO_CLIPS
} from './utils/sampleData';
import { exportToSRT } from './utils/srtExporter';
import { exportProjectVideo } from './utils/videoRenderer';
import { audioEngine } from './utils/audioSynth';
import './App.css';

export default function App() {
  const [projectName, setProjectName] = useState('프로젝트_브이로그_01.cap');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const [activeSidebarTab, setActiveSidebarTab] = useState('media');
  const [inspectorTab, setInspectorTab] = useState('basic');
  const [activeWorkspace, setActiveWorkspace] = useState('media');

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  const [isMagnetic, setIsMagnetic] = useState(true);
  const [duration, setDuration] = useState(15.0);

  // 5 Multi-Tracks State
  const [videoClips, setVideoClips] = useState(INITIAL_VIDEO_CLIPS);
  const [pipClips, setPipClips] = useState(INITIAL_PIP_CLIPS);
  const [effectClips, setEffectClips] = useState(INITIAL_EFFECT_CLIPS);
  const [textClips, setTextClips] = useState(INITIAL_TEXT_CLIPS);
  const [audioClips, setAudioClips] = useState(INITIAL_AUDIO_CLIPS);
  const [markers, setMarkers] = useState([
    { id: 'mk-1', time: 4.5, label: '전환 포인트' },
    { id: 'mk-2', time: 10.0, label: '하이라이트' }
  ]);

  const [trackVisibility, setTrackVisibility] = useState({
    video: true,
    pip: true,
    effects: true,
    text: true,
    audio: true
  });

  const [selectedClipId, setSelectedClipId] = useState('vid-1');
  const [selectedTrackType, setSelectedTrackType] = useState('video');

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExportFinished, setIsExportFinished] = useState(false);

  // Undo / Redo History Stack
  const [history, setHistory] = useState([
    {
      videoClips: INITIAL_VIDEO_CLIPS,
      pipClips: INITIAL_PIP_CLIPS,
      effectClips: INITIAL_EFFECT_CLIPS,
      textClips: INITIAL_TEXT_CLIPS,
      audioClips: INITIAL_AUDIO_CLIPS
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveHistorySnapshot = useCallback(
    (nextState) => {
      const snap = {
        videoClips: nextState.videoClips ?? videoClips,
        pipClips: nextState.pipClips ?? pipClips,
        effectClips: nextState.effectClips ?? effectClips,
        textClips: nextState.textClips ?? textClips,
        audioClips: nextState.audioClips ?? audioClips
      };
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), snap].slice(-30));
      setHistoryIndex((prev) => Math.min(29, prev + 1));
    },
    [videoClips, pipClips, effectClips, textClips, audioClips, historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prevIdx = historyIndex - 1;
    const snap = history[prevIdx];
    if (snap) {
      setVideoClips(snap.videoClips);
      setPipClips(snap.pipClips);
      setEffectClips(snap.effectClips);
      setTextClips(snap.textClips);
      setAudioClips(snap.audioClips);
      setHistoryIndex(prevIdx);
      audioEngine.playSFX('pop', 0.4);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const nextIdx = historyIndex + 1;
    const snap = history[nextIdx];
    if (snap) {
      setVideoClips(snap.videoClips);
      setPipClips(snap.pipClips);
      setEffectClips(snap.effectClips);
      setTextClips(snap.textClips);
      setAudioClips(snap.audioClips);
      setHistoryIndex(nextIdx);
      audioEngine.playSFX('pop', 0.4);
    }
  }, [history, historyIndex]);

  // Sync Master Mute
  useEffect(() => {
    audioEngine.setMuted(isMasterMuted);
  }, [isMasterMuted]);

  // Recalculate project duration based on furthest clip end
  useEffect(() => {
    let maxEnd = 10.0;
    videoClips.forEach((c) => (maxEnd = Math.max(maxEnd, c.start + c.duration)));
    pipClips.forEach((c) => (maxEnd = Math.max(maxEnd, c.start + c.duration)));
    effectClips.forEach((c) => (maxEnd = Math.max(maxEnd, c.start + c.duration)));
    textClips.forEach((c) => (maxEnd = Math.max(maxEnd, c.start + c.duration)));
    audioClips.forEach((c) => (maxEnd = Math.max(maxEnd, c.start + c.duration)));
    setDuration(Math.ceil(maxEnd));
  }, [videoClips, pipClips, effectClips, textClips, audioClips]);

  // Magnetic track packing for Main Video when toggled ON
  useEffect(() => {
    if (!isMagnetic) return;
    setVideoClips((prev) => {
      const sorted = [...prev].sort((a, b) => a.start - b.start);
      let cursor = 0;
      let changed = false;
      const packed = sorted.map((clip) => {
        const roundedCursor = Math.round(cursor * 10) / 10;
        if (Math.abs(clip.start - roundedCursor) > 0.05) {
          changed = true;
        }
        cursor += clip.duration;
        return { ...clip, start: roundedCursor };
      });
      return changed ? packed : prev;
    });
  }, [isMagnetic]);

  // Playback Loop + SFX Triggering
  const lastTimeRef = useRef(null);
  const triggeredSfxRef = useRef(new Set());

  useEffect(() => {
    let animId;

    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const bgmClip = audioClips.find((a) => a.audioType !== 'sfx' && !a.isMuted);
      if (bgmClip) {
        audioEngine.playBGM(bgmClip.trackName || 'lofi');
      }

      const tick = (now) => {
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime((prev) => {
          const next = prev + delta;

          // Check timeline SFX clips crossing between prev and next
          audioClips.forEach((aud) => {
            if (aud.audioType === 'sfx' && !aud.isMuted) {
              if (aud.start >= prev && aud.start < next && !triggeredSfxRef.current.has(aud.id)) {
                triggeredSfxRef.current.add(aud.id);
                audioEngine.playSFX(aud.trackName || 'whoosh', aud.volume || 0.85);
              }
            }
          });

          if (next >= duration) {
            triggeredSfxRef.current.clear();
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              audioEngine.stopBGM();
              return 0;
            }
          }
          return next;
        });

        animId = requestAnimationFrame(tick);
      };

      animId = requestAnimationFrame(tick);
    } else {
      triggeredSfxRef.current.clear();
      audioEngine.stopBGM();
    }

    return () => {
      cancelAnimationFrame(animId);
      audioEngine.stopBGM();
    };
  }, [isPlaying, duration, isLooping, audioClips]);

  // Workspace Switcher
  const handleSelectWorkspace = (wsId) => {
    setActiveWorkspace(wsId);
    if (wsId === 'media') {
      setActiveSidebarTab('media');
      setInspectorTab('basic');
    } else if (wsId === 'text') {
      setActiveSidebarTab('text');
    } else if (wsId === 'effects') {
      setActiveSidebarTab('effects');
      setInspectorTab('anim');
    } else if (wsId === 'color') {
      setActiveSidebarTab('filters');
      setInspectorTab('color');
    } else if (wsId === 'audio') {
      setActiveSidebarTab('audio');
    }
  };

  // Select clip helper
  const handleSelectClip = (id, trackType) => {
    setSelectedClipId(id);
    setSelectedTrackType(trackType);
  };

  // Update Clip Properties across any of the 5 tracks
  const handleUpdateClip = (id, trackType, newProps) => {
    const updater = (prev) => prev.map((c) => (c.id === id ? { ...c, ...newProps } : c));
    if (trackType === 'text') setTextClips(updater);
    else if (trackType === 'video') setVideoClips(updater);
    else if (trackType === 'pip') setPipClips(updater);
    else if (trackType === 'effects') setEffectClips(updater);
    else if (trackType === 'audio') setAudioClips(updater);
  };

  // Add Clips
  const handleAddVideoClip = (newClip) => {
    const next = [...videoClips, newClip];
    setVideoClips(next);
    saveHistorySnapshot({ videoClips: next });
    setSelectedClipId(newClip.id);
    setSelectedTrackType('video');
    audioEngine.playSFX('whoosh');
  };

  const handleAddPipClip = (newClip) => {
    const next = [...pipClips, newClip];
    setPipClips(next);
    saveHistorySnapshot({ pipClips: next });
    setSelectedClipId(newClip.id);
    setSelectedTrackType('pip');
    audioEngine.playSFX('pop');
  };

  const handleAddEffectClip = (newClip) => {
    const next = [...effectClips, newClip];
    setEffectClips(next);
    saveHistorySnapshot({ effectClips: next });
    setSelectedClipId(newClip.id);
    setSelectedTrackType('effects');
    audioEngine.playSFX('magic');
  };

  const handleAddTextClip = (newClip) => {
    const next = [...textClips, newClip];
    setTextClips(next);
    saveHistorySnapshot({ textClips: next });
    setSelectedClipId(newClip.id);
    setSelectedTrackType('text');
    audioEngine.playSFX('pop');
  };

  const handleAddBatchTextClips = (clipsArray) => {
    const next = [...textClips, ...clipsArray];
    setTextClips(next);
    saveHistorySnapshot({ textClips: next });
    if (clipsArray[0]) {
      setSelectedClipId(clipsArray[0].id);
      setSelectedTrackType('text');
    }
    audioEngine.playSFX('magic');
  };

  const handleAddAudioClip = (newClip) => {
    const next = [...audioClips, newClip];
    setAudioClips(next);
    saveHistorySnapshot({ audioClips: next });
    setSelectedClipId(newClip.id);
    setSelectedTrackType('audio');
    audioEngine.playSFX('ding');
  };

  const handleImportSRT = (importedClips) => {
    const next = [...textClips, ...importedClips];
    setTextClips(next);
    saveHistorySnapshot({ textClips: next });
    audioEngine.playSFX('ding');
  };

  // Delete Clip
  const handleDeleteClip = (id, trackType) => {
    if (!id) return;
    if (trackType === 'text') {
      const next = textClips.filter((c) => c.id !== id);
      setTextClips(next);
      saveHistorySnapshot({ textClips: next });
    } else if (trackType === 'video') {
      const next = videoClips.filter((c) => c.id !== id);
      setVideoClips(next);
      saveHistorySnapshot({ videoClips: next });
    } else if (trackType === 'pip') {
      const next = pipClips.filter((c) => c.id !== id);
      setPipClips(next);
      saveHistorySnapshot({ pipClips: next });
    } else if (trackType === 'effects') {
      const next = effectClips.filter((c) => c.id !== id);
      setEffectClips(next);
      saveHistorySnapshot({ effectClips: next });
    } else if (trackType === 'audio') {
      const next = audioClips.filter((c) => c.id !== id);
      setAudioClips(next);
      saveHistorySnapshot({ audioClips: next });
    }
    setSelectedClipId(null);
    setSelectedTrackType(null);
    audioEngine.playSFX('pop');
  };

  // Duplicate Clip
  const handleDuplicateClip = (id, trackType) => {
    if (!id || !trackType) return;
    const mapTrack = {
      video: [videoClips, setVideoClips, 'videoClips'],
      pip: [pipClips, setPipClips, 'pipClips'],
      effects: [effectClips, setEffectClips, 'effectClips'],
      text: [textClips, setTextClips, 'textClips'],
      audio: [audioClips, setAudioClips, 'audioClips']
    };
    const entry = mapTrack[trackType];
    if (!entry) return;
    const [list, setter, keyName] = entry;
    const target = list.find((c) => c.id === id);
    if (!target) return;

    const duplicated = {
      ...target,
      id: `${trackType}-${Date.now()}`,
      start: Math.round((target.start + target.duration + 0.1) * 10) / 10
    };
    const next = [...list, duplicated];
    setter(next);
    saveHistorySnapshot({ [keyName]: next });
    setSelectedClipId(duplicated.id);
    audioEngine.playSFX('pop');
  };

  // Split Clip at Playhead or custom splitTime
  const handleSplitClip = (id, customTime) => {
    const splitAt = typeof customTime === 'number' ? customTime : currentTime;

    const trySplit = (list, setter, keyName, prefix) => {
      const target = list.find((c) => c.id === id);
      if (!target) return false;
      if (splitAt <= target.start + 0.2 || splitAt >= target.start + target.duration - 0.2) {
        return false;
      }
      const firstDuration = Math.round((splitAt - target.start) * 10) / 10;
      const secondDuration = Math.round((target.duration - firstDuration) * 10) / 10;

      const firstClip = { ...target, duration: firstDuration };
      const secondClip = {
        ...target,
        id: `${prefix}-${Date.now()}`,
        start: Math.round(splitAt * 10) / 10,
        duration: secondDuration,
        title: target.title ? `${target.title} (2)` : undefined
      };

      const next = list.flatMap((c) => (c.id === id ? [firstClip, secondClip] : c));
      setter(next);
      saveHistorySnapshot({ [keyName]: next });
      setSelectedClipId(secondClip.id);
      audioEngine.playSFX('whoosh');
      return true;
    };

    if (trySplit(videoClips, setVideoClips, 'videoClips', 'vid')) return;
    if (trySplit(pipClips, setPipClips, 'pipClips', 'pip')) return;
    if (trySplit(textClips, setTextClips, 'textClips', 'txt')) return;
    if (trySplit(effectClips, setEffectClips, 'effectClips', 'fx')) return;
    trySplit(audioClips, setAudioClips, 'audioClips', 'aud');
  };

  // Freeze Frame (insert 2.0s frozen segment)
  const handleFreezeClip = (id, trackType) => {
    if (trackType !== 'video' && trackType !== 'pip') return;
    const list = trackType === 'video' ? videoClips : pipClips;
    const setter = trackType === 'video' ? setVideoClips : setPipClips;
    const target = list.find((c) => c.id === id);
    if (!target) return;

    const frozenClip = {
      ...target,
      id: `freeze-${Date.now()}`,
      title: `❄️ [프리즈] ${target.title}`,
      start: Math.round((target.start + target.duration) * 10) / 10,
      duration: 2.0,
      speed: 0.01
    };
    const next = [...list, frozenClip];
    setter(next);
    setSelectedClipId(frozenClip.id);
    audioEngine.playSFX('shutter');
  };

  // Mirror (Flip Horizontal)
  const handleMirrorClip = (id, trackType) => {
    if (trackType !== 'video' && trackType !== 'pip') return;
    const list = trackType === 'video' ? videoClips : pipClips;
    const target = list.find((c) => c.id === id);
    if (!target) return;
    handleUpdateClip(id, trackType, { flipH: !target.flipH });
    audioEngine.playSFX('pop');
  };

  // Apply Color Filter Preset
  const handleApplyFilterPreset = (filters) => {
    if ((selectedTrackType === 'video' || selectedTrackType === 'pip') && selectedClipId) {
      handleUpdateClip(selectedClipId, selectedTrackType, { filters });
    } else {
      const activeVideo = videoClips.find(
        (c) => currentTime >= c.start && currentTime < c.start + c.duration
      );
      if (activeVideo) {
        handleUpdateClip(activeVideo.id, 'video', { filters });
        setSelectedClipId(activeVideo.id);
        setSelectedTrackType('video');
      }
    }
    audioEngine.playSFX('magic');
  };

  // Apply Transition Preset
  const handleApplyTransitionPreset = (transitionId, transitionDuration) => {
    if (selectedTrackType === 'video' && selectedClipId) {
      handleUpdateClip(selectedClipId, 'video', {
        transition: transitionId,
        transitionDuration
      });
    } else {
      setVideoClips((prev) =>
        prev.map((c) => ({ ...c, transition: transitionId, transitionDuration }))
      );
    }
    audioEngine.playSFX('whoosh');
  };

  // Add Timeline Marker
  const handleAddMarker = useCallback(() => {
    setMarkers((prev) => [
      ...prev,
      {
        id: `mk-${Date.now()}`,
        time: Math.round(currentTime * 10) / 10,
        label: `마커 ${prev.length + 1}`
      }
    ]);
    audioEngine.playSFX('ding', 0.5);
  }, [currentTime]);

  // Toggle Track Visibility
  const handleToggleTrackVisibility = (trackKey) => {
    setTrackVisibility((prev) => ({ ...prev, [trackKey]: !prev[trackKey] }));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClipId && selectedTrackType) {
          handleDeleteClip(selectedClipId, selectedTrackType);
        }
      } else if (e.ctrlKey && e.code === 'KeyB') {
        e.preventDefault();
        if (selectedClipId) {
          handleSplitClip(selectedClipId);
        }
      } else if (e.ctrlKey && e.code === 'KeyD') {
        e.preventDefault();
        if (selectedClipId && selectedTrackType) {
          handleDuplicateClip(selectedClipId, selectedTrackType);
        }
      } else if (e.ctrlKey && e.code === 'KeyZ') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.code === 'KeyY') {
        e.preventDefault();
        handleRedo();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleAddMarker();
      } else if (e.code === 'ArrowLeft') {
        setCurrentTime((t) => Math.max(0, Math.round((t - 0.1) * 100) / 100));
      } else if (e.code === 'ArrowRight') {
        setCurrentTime((t) => Math.min(duration, Math.round((t + 0.1) * 100) / 100));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, selectedTrackType, duration, handleUndo, handleRedo, handleAddMarker]);

  // Export SRT
  const handleExportSRT = () => {
    exportToSRT(textClips);
    audioEngine.playSFX('ding');
  };

  // Open Export Video Modal
  const handleOpenExportModal = () => {
    setIsPlaying(false);
    setIsExportModalOpen(true);
    setIsRendering(false);
    setIsExportFinished(false);
    setExportProgress(0);
  };

  // Start Video Render
  const handleStartRender = async ({ resolution, fps }) => {
    setIsRendering(true);
    setExportProgress(0);
    setIsExportFinished(false);

    try {
      await exportProjectVideo({
        duration,
        videoClips,
        pipClips,
        effectClips,
        textClips,
        aspectRatio,
        resolution,
        fps,
        onProgress: (p) => setExportProgress(p)
      });
      setIsRendering(false);
      setIsExportFinished(true);
      setExportProgress(100);
      audioEngine.playSFX('boom');
    } catch (err) {
      console.error('Video Export Error:', err);
      alert('비디오 렌더링 중 오류가 발생했습니다.');
      setIsRendering(false);
      setIsExportModalOpen(false);
    }
  };

  // Save Project JSON
  const handleSaveProject = () => {
    const projectData = {
      version: '3.0-CapCutPro',
      projectName,
      aspectRatio,
      duration,
      videoClips: videoClips.map(({ videoElement, imageElement, ...rest }) => rest),
      pipClips: pipClips.map(({ videoElement, imageElement, ...rest }) => rest),
      effectClips,
      textClips,
      audioClips,
      markers
    };
    const jsonStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\.cap$/i, '')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    audioEngine.playSFX('ding');
  };

  // Load Project JSON
  const handleLoadProject = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.videoClips) setVideoClips(data.videoClips);
        if (data.pipClips) setPipClips(data.pipClips);
        if (data.effectClips) setEffectClips(data.effectClips);
        if (data.textClips) setTextClips(data.textClips);
        if (data.audioClips) setAudioClips(data.audioClips);
        if (data.markers) setMarkers(data.markers);
        if (data.aspectRatio) setAspectRatio(data.aspectRatio);
        if (data.projectName) setProjectName(data.projectName);
        audioEngine.playSFX('magic');
      } catch (err) {
        alert('올바른 프로젝트 JSON 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  // Find currently selected clip object across all 5 tracks
  const selectedClip =
    selectedTrackType === 'text'
      ? textClips.find((c) => c.id === selectedClipId)
      : selectedTrackType === 'video'
      ? videoClips.find((c) => c.id === selectedClipId)
      : selectedTrackType === 'pip'
      ? pipClips.find((c) => c.id === selectedClipId)
      : selectedTrackType === 'effects'
      ? effectClips.find((c) => c.id === selectedClipId)
      : selectedTrackType === 'audio'
      ? audioClips.find((c) => c.id === selectedClipId)
      : null;

  return (
    <div className="app-container">
      {/* 1. Top Header Bar */}
      <Header
        projectName={projectName}
        setProjectName={setProjectName}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        showSafeZone={showSafeZone}
        setShowSafeZone={setShowSafeZone}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={handleSelectWorkspace}
        onExportVideo={handleOpenExportModal}
        onExportSRT={handleExportSRT}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* 2. Main 3-Column Studio Workspace */}
      <div className="main-workspace">
        {/* Left: Stitch Icon Rail + Asset Drawer */}
        <Sidebar
          activeTab={activeSidebarTab}
          setActiveTab={setActiveSidebarTab}
          currentTime={currentTime}
          onAddVideoClip={handleAddVideoClip}
          onAddPipClip={handleAddPipClip}
          onAddEffectClip={handleAddEffectClip}
          onAddTextClip={handleAddTextClip}
          onAddBatchTextClips={handleAddBatchTextClips}
          onAddAudioClip={handleAddAudioClip}
          onImportSRT={handleImportSRT}
          onApplyFilterPreset={handleApplyFilterPreset}
          onApplyTransitionPreset={handleApplyTransitionPreset}
        />

        {/* Center: Interactive Canvas Monitor */}
        <PreviewPlayer
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          duration={duration}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          isLooping={isLooping}
          setIsLooping={setIsLooping}
          isMasterMuted={isMasterMuted}
          setIsMasterMuted={setIsMasterMuted}
          videoClips={videoClips}
          pipClips={pipClips}
          effectClips={effectClips}
          textClips={textClips}
          trackVisibility={trackVisibility}
          aspectRatio={aspectRatio}
          showSafeZone={showSafeZone}
          showGrid={showGrid}
          selectedClipId={selectedClipId}
          selectedTrackType={selectedTrackType}
          onSelectClip={handleSelectClip}
          onUpdateClip={handleUpdateClip}
          onAddMarker={handleAddMarker}
        />

        {/* Right: Stitch Tabbed Inspector */}
        <Inspector
          selectedClip={selectedClip}
          selectedTrackType={selectedTrackType}
          inspectorTab={inspectorTab}
          setInspectorTab={setInspectorTab}
          onUpdateClip={handleUpdateClip}
          onDeleteClip={handleDeleteClip}
          onSplitClip={handleSplitClip}
          onDuplicateClip={handleDuplicateClip}
          currentTime={currentTime}
          duration={duration}
          totalClipsCount={
            videoClips.length +
            pipClips.length +
            effectClips.length +
            textClips.length +
            audioClips.length
          }
          aspectRatio={aspectRatio}
        />
      </div>

      {/* 3. Bottom 5-Track NLE Timeline */}
      <Timeline
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        duration={duration}
        videoClips={videoClips}
        pipClips={pipClips}
        effectClips={effectClips}
        textClips={textClips}
        audioClips={audioClips}
        markers={markers}
        trackVisibility={trackVisibility}
        onToggleTrackVisibility={handleToggleTrackVisibility}
        selectedClipId={selectedClipId}
        setSelectedClipId={setSelectedClipId}
        selectedTrackType={selectedTrackType}
        setSelectedTrackType={setSelectedTrackType}
        onUpdateClip={handleUpdateClip}
        onDeleteClip={handleDeleteClip}
        onSplitClip={handleSplitClip}
        onDuplicateClip={handleDuplicateClip}
        onFreezeClip={handleFreezeClip}
        onMirrorClip={handleMirrorClip}
        isMagnetic={isMagnetic}
        setIsMagnetic={setIsMagnetic}
      />

      {/* 4. Export Video Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        progress={exportProgress}
        isFinished={isExportFinished}
        isRendering={isRendering}
        onStartRender={handleStartRender}
        projectName={projectName}
        aspectRatio={aspectRatio}
        duration={duration}
      />
    </div>
  );
}
