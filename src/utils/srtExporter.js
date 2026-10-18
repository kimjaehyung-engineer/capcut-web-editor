// SRT (SubRip Subtitle) Exporter & Parser for CapCut integration

function formatSRTTime(seconds) {
  const pad = (num, size) => ('000' + num).slice(-size);
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)},${pad(ms, 3)}`;
}

export function exportToSRT(textClips) {
  // Sort clips by start time
  const sortedClips = [...textClips].sort((a, b) => a.start - b.start);

  let srtContent = '';
  sortedClips.forEach((clip, index) => {
    const startTime = formatSRTTime(clip.start);
    const endTime = formatSRTTime(clip.start + clip.duration);
    
    srtContent += `${index + 1}\n`;
    srtContent += `${startTime} --> ${endTime}\n`;
    srtContent += `${clip.text.trim()}\n\n`;
  });

  // Trigger download
  const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `capcut_subtitles_${Date.now()}.srt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return srtContent;
}

export function parseSRT(srtText) {
  const blocks = srtText.trim().replace(/\r\n/g, '\n').split('\n\n');
  const clips = [];

  blocks.forEach((block, idx) => {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      const timeLine = lines[1];
      const timeMatch = timeLine.match(/(\d+:\d+:\d+,\d+)\s*-->\s*(\d+:\d+:\d+,\d+)/);
      if (timeMatch) {
        const parseTime = (tStr) => {
          const [hms, ms] = tStr.split(',');
          const [h, m, s] = hms.split(':').map(Number);
          return h * 3600 + m * 60 + s + Number(ms) / 1000;
        };

        const start = parseTime(timeMatch[1]);
        const end = parseTime(timeMatch[2]);
        const text = lines.slice(2).join(' ');

        clips.push({
          id: `srt-txt-${Date.now()}-${idx}`,
          text,
          start,
          duration: Math.max(0.5, end - start),
          fontSize: 50,
          color: '#FFE600',
          bgColor: 'rgba(0,0,0,0.8)',
          strokeColor: '#000000',
          strokeWidth: 6,
          fontFamily: "'Black Han Sans', sans-serif",
          x: 50,
          y: 72,
          animStyle: 'pop'
        });
      }
    }
  });

  return clips;
}
