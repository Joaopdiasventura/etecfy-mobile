import { Song } from '../song';

export interface Playlist {
  _id: string;
  user: string;
  name: string;
  firstSong: Song;
  songs: Song[];
}
