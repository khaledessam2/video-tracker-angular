import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';

vi.mock('plyr', () => ({ default: vi.fn() }));
import { App } from './app';
import { PLYR_FACTORY } from './video-player/video-player.component';

const mockPlyrFactory = () => ({
  on: () => undefined,
  destroy: () => undefined,
  currentTime: 0,
  duration: 0,
  source: null,
});

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: PLYR_FACTORY, useValue: mockPlyrFactory }],
    }).compileComponents();
  });

  it('creates the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the URL input field', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input[type="url"]');
    expect(input).not.toBeNull();
  });

  it('renders the Track button', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button');
    expect(button?.textContent?.trim()).toBe('Track');
  });

  it('does not show the video player initially', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const player = fixture.nativeElement.querySelector('app-video-player');
    expect(player).toBeNull();
  });

  it('does not show an error message initially', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const error = fixture.nativeElement.querySelector('p.text-red-400');
    expect(error).toBeNull();
  });

  it('shows the video player after a valid URL is submitted', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance['urlInputValue'] = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    fixture.componentInstance.submitUrl();
    await fixture.whenStable();
    const player = fixture.nativeElement.querySelector('app-video-player');
    expect(player).not.toBeNull();
  });

  it('shows an error message for an invalid URL', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance['urlInputValue'] = 'not-a-youtube-url';
    fixture.componentInstance.submitUrl();
    await fixture.whenStable();
    const error = fixture.nativeElement.querySelector('p.text-red-400');
    expect(error).not.toBeNull();
  });

  it('does not show the video player when an invalid URL is submitted', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance['urlInputValue'] = 'https://vimeo.com/12345';
    fixture.componentInstance.submitUrl();
    await fixture.whenStable();
    const player = fixture.nativeElement.querySelector('app-video-player');
    expect(player).toBeNull();
  });

  it('clears the error when a valid URL is submitted after an invalid one', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance['urlInputValue'] = 'bad-url';
    fixture.componentInstance.submitUrl();
    fixture.componentInstance['urlInputValue'] = 'https://youtu.be/dQw4w9WgXcQ';
    fixture.componentInstance.submitUrl();
    await fixture.whenStable();
    const error = fixture.nativeElement.querySelector('p.text-red-400');
    expect(error).toBeNull();
  });

  it('updates the video when a new valid URL is submitted', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance['urlInputValue'] = 'https://youtu.be/dQw4w9WgXcQ';
    fixture.componentInstance.submitUrl();
    fixture.componentInstance['urlInputValue'] = 'https://youtu.be/abcdefghijk';
    fixture.componentInstance.submitUrl();
    await fixture.whenStable();
    expect(fixture.componentInstance['currentVideoId']()).toBe('abcdefghijk');
  });
});
