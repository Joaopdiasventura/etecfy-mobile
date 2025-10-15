import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song } from '../../models/song';
import { FindSongDto } from '../../../shared/dto/song/find-song.dto';
import { Message } from '../../../shared/interfaces/messages';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class SongService {
  private readonly apiUrl = API_URL + '/song';
  private readonly http = inject(HttpClient);

  public create(creatSongDto: FormData): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, creatSongDto);
  }

  public findMany(findSongDto: FindSongDto): Observable<Song[]> {
    const obj = Object.entries(findSongDto).reduce((acc, [k, v]) => {
      acc[k] = Array.isArray(v) ? v.map(String) : String(v);
      return acc;
    }, {} as Record<string, string | string[]>);
    const params = new HttpParams({ fromObject: obj });
    return this.http.get<Song[]>(this.apiUrl, { params });
  }
}
