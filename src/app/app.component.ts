import { Component, inject, OnInit, signal } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonContent } from '@ionic/angular/standalone';
import { PlayerConfig } from './shared/interfaces/config/player';
import { PlayerService } from './shared/services/player/player.service';
import { PlayerComponent } from './shared/components/player/player.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonMenu, IonContent, PlayerComponent, SidebarComponent],
})
export class AppComponent implements OnInit {
  public playerConfig = signal<PlayerConfig | null>(null);

  private readonly playerService = inject(PlayerService);

  public ngOnInit(): void {
    this.playerService.player$.subscribe((data) => this.playerConfig.set(data));
  }
}
