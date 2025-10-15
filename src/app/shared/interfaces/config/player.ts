import { Song } from '../../../core/models/song';

export interface PlayerConfig {
  playlist: Song[] | null;
  currentIndex: number;
  isPlaying: boolean;
  playEvent: (index: number) => void;
  closeEvent: () => void;
  loadMore: () => void;
  playingChange: (playing: boolean) => void;
}
