import { Routes } from '@angular/router';
import { ConnectGuard } from './core/guards/connect/connect-guard';

export const routes: Routes = [
  {
    path: 'home',
    canMatch: [ConnectGuard],
    loadComponent: () =>
      import('./features/home/home-page/home-page.component').then(
        (m) => m.HomePageComponent
      ),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./features/user/routes/user.routes').then((m) => m.routes),
  },
  {
    path: 'song',
    loadChildren: () =>
      import('./features/song/routes/song.routes').then((m) => m.routes),
  },
  {
    path: 'playlist',
    loadChildren: () =>
      import('./features/playlist/routes/playlist.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
