import { Injectable } from '@angular/core';
import { PlayerConfig } from '../../interfaces/config/player';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private playerDataSource = new BehaviorSubject<PlayerConfig | null>(null);

  public get player$(): Observable<PlayerConfig | null> {
    return this.playerDataSource.asObservable();
  }

  public updatePlayerData(data: PlayerConfig | null): PlayerConfig | null {
    this.playerDataSource.next(data);
    return data;
  }
}
