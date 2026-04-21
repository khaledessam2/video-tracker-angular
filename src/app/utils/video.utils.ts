export type VideoProvider = 'youtube' | 'vimeo';

export interface VideoInfo {
  id: string;
  provider: VideoProvider;
}

export function extractVideoInfo(url: string): VideoInfo | null {
  if (!url) return null;

  try {
    const normalized = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    const parsed = new URL(normalized);

    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return { id, provider: 'youtube' };
    }

    if (parsed.hostname.endsWith('youtube.com')) {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v');
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return { id, provider: 'youtube' };
      }
      if (parsed.pathname.startsWith('/embed/')) {
        const id = parsed.pathname.split('/')[2];
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return { id, provider: 'youtube' };
      }
    }

    if (parsed.hostname === 'vimeo.com' || parsed.hostname === 'www.vimeo.com') {
      const id = parsed.pathname.slice(1).split('/')[0];
      if (/^\d+$/.test(id)) return { id, provider: 'vimeo' };
    }

    if (parsed.hostname === 'player.vimeo.com') {
      const id = parsed.pathname.replace('/video/', '').split('/')[0];
      if (/^\d+$/.test(id)) return { id, provider: 'vimeo' };
    }
  } catch {
    return null;
  }

  return null;
}
