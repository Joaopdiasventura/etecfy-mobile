import { Routes } from '@angular/router';
import { ConnectGuard } from '../../../core/guards/connect/connect-guard';
import { ProtectGuard } from '../../../core/guards/protect/protect-guard';
import { CreatePageComponent } from '../create/create-page/create-page.component';
import { LoginPageComponent } from '../login/login-page/login-page.component';
import { ProfilePageComponent } from '../profile/profile-page/profile-page.component';

export const routes: Routes = [
  {
    path: '',
    canMatch: [ConnectGuard],
    canActivate: [ProtectGuard],
    component: ProfilePageComponent,
  },
  { path: 'create', component: CreatePageComponent },
  { path: 'login', component: LoginPageComponent },
];
