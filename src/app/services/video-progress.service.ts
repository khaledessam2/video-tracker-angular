import { Injectable } from '@angular/core';

export interface ProgressRecord {
  currentTime: number;
  duration: number;
  updatedAt: number;
}

@Injectable({ providedIn: 'root' })
export class VideoProgressService {
  private readonly PREFIX = 'vt_';

  saveProgress(videoId: string, currentTime: number, duration: number): void {
    const record: ProgressRecord = { currentTime, duration, updatedAt: Date.now() };
    localStorage.setItem(this.PREFIX + videoId, JSON.stringify(record));
  }

  getProgress(videoId: string): ProgressRecord | null {
    const raw = localStorage.getItem(this.PREFIX + videoId);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ProgressRecord;
    } catch {
      return null;
    }
  }

  clearProgress(videoId: string): void {
    localStorage.removeItem(this.PREFIX + videoId);
  }

  getWatchedPercentage(videoId: string): number {
    const progress = this.getProgress(videoId);
    if (!progress || progress.duration === 0) return 0;
    return Math.min(100, Math.round((progress.currentTime / progress.duration) * 100));
  }
}
