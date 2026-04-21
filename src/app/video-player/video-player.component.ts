import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ElementRef, ViewChild,
  signal, computed, inject, SimpleChanges } from '@angular/core';
import type { VideoProvider } from '../utils/video.utils';
import { VideoProgressService } from '../services/video-progress.service';
// @ts-ignore — plyr .d.ts has conflicting export = / export default declarations
import PlyrLib from 'plyr';

export interface PlyrPlayer {
  on(event: string, cb: () => void): void;
  currentTime: number;
  readonly duration: number;
  source: unknown;
  destroy(): void;
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css',
})

export class VideoPlayerComponent implements OnChanges, AfterViewInit, OnDestroy {

  @Input({ required: true }) videoId!: string;
  @Input() provider: VideoProvider = 'youtube';
  @ViewChild('playerContainer') playerContainerRef!: ElementRef<HTMLDivElement>;

  protected readonly watchedPercentage = signal(0);
  protected readonly savedTime = signal(0);

  protected readonly formattedSavedTime = computed(() => {
    const t = this.savedTime();
    if (t === 0) return '';
    const m = Math.floor(t / 60); // minutes
    const s = Math.floor(t % 60); // remain secound
    return `${m}:${s.toString().padStart(2, '0')}`;
  });

  private player: PlyrPlayer | null = null;
  private resumeApplied = false;
  private readonly progressService = inject(VideoProgressService);

  ngOnChanges(changes: SimpleChanges): void {
  // If the video has changed, it's not the first time.
    if (changes['videoId'] && !changes['videoId'].firstChange && this.player) {
      this.resumeApplied = false;
      this.loadSavedProgress();
      this.player.source = {
        type: 'video',
        sources: [{ src: this.videoId, provider: this.provider }],
      };
    }
  }

  ngAfterViewInit(): void {
    this.loadSavedProgress();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.player = new (PlyrLib as any)(this.playerContainerRef.nativeElement, {
      controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
    }) as PlyrPlayer;

    const applyResume = () => {
      if (this.resumeApplied) return;
      const saved = this.progressService.getProgress(this.videoId);
      if (saved && saved.currentTime > 0) {
        this.player!.currentTime = saved.currentTime;
        this.resumeApplied = true;
      }
    };

    // canplay/ready fire too early for Vimeo — Vimeo resets currentTime when play starts.
    this.player.on('play', applyResume);

    this.player.on('timeupdate', () => {
      const ct = this.player!.currentTime;
      const dur = this.player!.duration;
      if (ct > 0 && dur > 0) {
        this.progressService.saveProgress(this.videoId, ct, dur);
        this.watchedPercentage.set(this.progressService.getWatchedPercentage(this.videoId));
        this.savedTime.set(ct);
      }
    });
  }

  ngOnDestroy(): void {
    this.player?.destroy();
  }

  resetProgress(): void {
    this.progressService.clearProgress(this.videoId);
    this.watchedPercentage.set(0);
    this.savedTime.set(0);
    if (this.player) {
      this.player.currentTime = 0;
    }
  }

  private loadSavedProgress(): void {
    const saved = this.progressService.getProgress(this.videoId);
    this.savedTime.set(saved?.currentTime ?? 0);
    this.watchedPercentage.set(this.progressService.getWatchedPercentage(this.videoId));
  }

}
