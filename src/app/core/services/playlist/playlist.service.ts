import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreatePlaylistDto } from '../../../shared/dto/playlist/create-playlist.dto';
import { FindPlaylistDto } from '../../../shared/dto/playlist/find-playlist.dto';
import { Message } from '../../../shared/interfaces/messages';
import { Playlist } from '../../models/playlist';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private readonly apiUrl = API_URL + '/playlist';
  private readonly http = inject(HttpClient);

  public create(creatPlaylistDto: CreatePlaylistDto): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, creatPlaylistDto);
  }

  public findById(id: string): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.apiUrl}/${id}`);
  }

  public findMany(findPlaylistDto: FindPlaylistDto): Observable<Playlist[]> {
    const obj = Object.entries(findPlaylistDto).reduce((acc, [k, v]) => {
      acc[k] = Array.isArray(v) ? v.map(String) : String(v);
      return acc;
    }, {} as Record<string, string | string[]>);
    const params = new HttpParams({ fromObject: obj });
    return this.http.get<Playlist[]>(this.apiUrl, { params });
  }

  public delete(id: string): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/${id}`);
  }
}
