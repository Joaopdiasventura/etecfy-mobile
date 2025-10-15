import { Routes } from '@angular/router';
import { ConnectGuard } from '../../../core/guards/connect/connect-guard';
import { ProtectGuard } from '../../../core/guards/protect/protect-guard';
import { CreatePageComponent } from '../create/create-page/create-page.component';
import { PlaylistPageComponent } from '../playlist-page/playlist-page.component';

export const routes: Routes = [
  {
    path: 'create',
    canMatch: [ConnectGuard],
    canActivate: [ProtectGuard],
    component: CreatePageComponent,
  },
  { path: ':id', canMatch: [ConnectGuard], component: PlaylistPageComponent },
];
