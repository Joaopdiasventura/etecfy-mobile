import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SongChunk } from '../../models/song-chunk';
import { HttpClient } from '@angular/common/http';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class SongChunkService {
  private readonly apiUrl = API_URL + '/song-chunk';
  private readonly http = inject(HttpClient);

  public findAllBySong(song: string): Observable<SongChunk[]> {
    return this.http.get<SongChunk[]>(`${this.apiUrl}/${song}`);
  }
}
