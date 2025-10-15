import { Routes } from '@angular/router';
import { ConnectGuard } from '../../../core/guards/connect/connect-guard';
import { ProtectGuard } from '../../../core/guards/protect/protect-guard';
import { AddPageComponent } from '../add/add-page/add-page.component';

export const routes: Routes = [
  {
    path: 'add',
    canMatch: [ConnectGuard],
    canActivate: [ProtectGuard],
    component: AddPageComponent,
  },
];
