# 🎬 CapCut Studio Web (CutPro Studio)

> **브라우저에서 직접 구동되는 차세대 CapCut Pro 스타일의 멀티트랙 숏폼 비디오 웹 편집기**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Audio-Web_Audio_API-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 주요 핵심 기능 (Key Features)

### 1. 📱 반응형 화면 비율 & 세이프존 (Safe Zone)
- **9:16 쇼츠 (YouTube Shorts, TikTok, Reels)**, **16:9 가로**, **1:1 정방형** 화면비 원클릭 전환
- 틱톡/유튜브 쇼츠 UI에 자막이 가려지지 않도록 방지하는 **세이프존(Safe Zone) 오버레이 가이드** 지원

### 2. 💬 쇼츠 전용 고시인성 자막 & SRT 연동
- 인기 쇼츠 자막 프리셋 5종 (옐로우 볼드, 네온 시안, 레드 뱃지, 미니멀 화이트, 네온 바이올렛)
- **자막 직접 드래그 이동**: 캔버스 화면 위에서 마우스 드래그로 자막 위치 즉시 재배치
- **CapCut 호환 SRT 내보내기/불러오기**: 실제 CapCut이나 프리미어에서 [자막 가져오기] 한 번으로 싱크가 100% 일치하는 `.srt` 파일 추출

### 3. 🎞️ 멀티트랙 타임라인 & 정밀 컷 편집 (Multi-track Timeline)
- **독립 트랙**: 자막(Purple), 메인 비디오(Cyan), BGM/SFX(Amber) 3단 트랙 분리
- **컷 분할 (Split)**: 붉은색 스크러버 플레이헤드 위치에서 원클릭 또는 `Ctrl + B`로 싹둑 자르기
- **트림 (Trim)**: 클립 양 끝단 핸들 드래그로 시작점/끝점 미세 조절
- **단축키 지원**: 스페이스바(재생/정지), `Ctrl+B`(분할), `Delete`(클립 삭제), `← / →`(0.5초 이동)

### 4. 🚀 브라우저 네이티브 비디오 렌더링 & 내보내기 (Export)
- 외부 서버 백엔드 없이 브라우저의 `HTML5 Canvas + MediaRecorder API`를 통해 실시간 30fps 고화질 비디오(`.webm`) 자동 렌더링 및 다운로드
- 렌더링 프로그레스 바(0~100%) 및 축하 색종이(Confetti) 연출

### 5. 🎵 Web Audio API 오프라인 사운드 엔진
- 100% 오프라인으로 안정 동작하는 Lo-Fi & Cyber 신디사이저 BGM 및 효과음(Ding, Whoosh, Pop, Boom)

---

## 🚀 빠른 시작 (Getting Started)

### 요구 사양
- Node.js 18.0 이상

### 설치 및 로컬 실행
```bash
# 1. 저장소 클론
git clone https://github.com/kimjaehyung-engineer/capcut-web-editor.git
cd capcut-web-editor

# 2. 패키지 설치
npm install

# 3. 로컬 개발 서버 실행
npm run dev
```
브라우저에서 `http://127.0.0.1:5173/` 접속 후 즉시 편집기를 사용하실 수 있습니다.

---

## 🏗️ 기술 스택 (Tech Stack)

| 구분 | 기술 / 라이브러리 |
|:---|:---|
| **Core Framework** | React 19, Vite 8.3 |
| **Icons** | Lucide React |
| **Canvas & Video** | HTML5 Canvas 2D API, MediaRecorder API |
| **Audio Engine** | Web Audio API (Procedural Synthesizer) |
| **Styling** | Vanilla CSS (CapCut Dark Studio Theme, Obsidian Glassmorphism) |
| **Animation/FX** | Canvas Confetti |

---

## 📄 라이선스 (License)
This project is licensed under the MIT License.
