import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { extractVideoInfo, VideoInfo } from './utils/video.utils';

@Component({
  selector: 'app-root',
  imports: [FormsModule, VideoPlayerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected urlInputValue = '';
  protected readonly currentVideo = signal<VideoInfo | null>(null);
  protected readonly urlError = signal(false);

  submitUrl(): void {
    const info = extractVideoInfo(this.urlInputValue);
    if (info) {
      console.log(info) // {id : string , provider : string}
      this.currentVideo.set(info);
      this.urlError.set(false);
    } else {
      this.urlError.set(true);
    }
  }
}
