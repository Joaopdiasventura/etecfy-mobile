import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { IonButton, IonCard } from '@ionic/angular/standalone';
import { Song } from '../../../core/models/song';

@Component({
  selector: 'app-song-card',
  imports: [LucideAngularModule, IonButton, IonCard],
  templateUrl: './song-card.component.html',
  styleUrls: ['./song-card.component.scss'],
})
export class SongCardComponent {
  @Input() public song!: Song;
  @Input() public index!: number;
  @Input() public isPlaying!: boolean;

  @Output() public playEvent = new EventEmitter<number>();

  public onPlayClick(): void {
    this.playEvent.emit(this.index);
  }

  public get formatedDuration(): string {
    const hours = Math.floor(this.song.duration / 3600);
    const minutes = Math.floor((this.song.duration % 3600) / 60);
    const seconds = this.song.duration % 60;

    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');

    return hours > 0
      ? `${hours.toString().padStart(2, '0')}:${minutesStr}:${secondsStr}`
      : `${minutesStr}:${secondsStr}`;
  }
}
